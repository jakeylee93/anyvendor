// In-process Postgres (PGlite) with Supabase's auth pieces reproduced, so the real
// migrations, RLS policies and SECURITY DEFINER functions run exactly as written.
import { PGlite } from "@electric-sql/pglite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS = join(import.meta.dirname, "..", "..", "supabase", "migrations");

const BOOTSTRAP = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant usage on schema public to anon, authenticated, service_role;
`;

export type Db = PGlite;
export type Actor = string | "anon" | "service";

export async function freshDb(): Promise<Db> {
  const db = new PGlite();
  await db.exec(BOOTSTRAP);
  const files = readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql") && !f.includes("storage")).sort();
  for (const f of files) await db.exec(readFileSync(join(MIGRATIONS, f), "utf8"));
  return db;
}

export async function addUser(db: Db, id: string, email = `${id.slice(0, 8)}@example.test`, verified = true) {
  await db.query("insert into auth.users (id, email, email_confirmed_at) values ($1, $2, $3)", [id, email, verified ? new Date().toISOString() : null]);
  return id;
}

/** Run fn as a signed-in user (uuid), as anon, or as the service role. Always resets afterwards. */
export async function as<T>(db: Db, actor: Actor, fn: () => Promise<T>): Promise<T> {
  const role = actor === "anon" ? "anon" : actor === "service" ? "service_role" : "authenticated";
  const sub = actor === "anon" || actor === "service" ? "" : actor;
  await db.exec(`set role ${role}`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [sub]);
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub', '', false)");
  }
}

export async function rows<T = Record<string, unknown>>(db: Db, sql: string, params: unknown[] = []): Promise<T[]> {
  return (await db.query<T>(sql, params)).rows;
}

export async function one<T = Record<string, unknown>>(db: Db, sql: string, params: unknown[] = []): Promise<T> {
  const r = await rows<T>(db, sql, params);
  if (r.length !== 1) throw new Error(`expected one row, got ${r.length}: ${sql}`);
  return r[0];
}

/** Resolves with the Postgres error message (e.g. 'plan_required'), or throws if the call succeeded. */
export async function rejects(p: Promise<unknown>): Promise<string> {
  try {
    await p;
  } catch (e) {
    return (e as Error).message;
  }
  throw new Error("expected the call to be rejected");
}

export const U = {
  alice: "00000000-0000-4000-8000-00000000000a",
  bob: "00000000-0000-4000-8000-00000000000b",
  carol: "00000000-0000-4000-8000-00000000000c",
  dave: "00000000-0000-4000-8000-00000000000d",
  staff: "00000000-0000-4000-8000-0000000000ff",
};

/** Gives a business a subscription the way the Stripe webhook does (service role). */
export async function subscribe(db: Db, business: string, plan: "website" | "seo" | "social", status = "active", at = new Date()) {
  return as(db, "service", () =>
    one<{ r: string }>(
      db,
      "select public.upsert_subscription($1, $2, $3, $4::public.plan_code, $5, $6, now() + interval '30 days', false, null, false, $7) as r",
      [business, `sub_${business.slice(-6)}`, `cus_${business.slice(-6)}`, plan, `price_${plan}`, status, at.toISOString()],
    ),
  );
}

/** Marks a user's email as verified, the way Supabase does when a magic link is used. */
export async function verifyUser(db: Db, id: string) {
  await db.query("update auth.users set email_confirmed_at = now() where id = $1", [id]);
}
