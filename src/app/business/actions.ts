"use server";

import { randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { appUrl, backendReady } from "@/lib/supabase/env";
import { BUSINESS_COOKIE, businessContext } from "@/lib/business/data";

const str = (f: FormData, k: string, max = 8000) => String(f.get(k) ?? "").trim().slice(0, max);
const back = (path: string, params: Record<string, string>) => `${path}${path.includes("?") ? "&" : "?"}${new URLSearchParams(params)}`;
const ATTACH_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

async function live() {
  if (!backendReady()) redirect("/business?demo=1");
  const ctx = await businessContext();
  if (ctx.mode !== "live") redirect("/business?demo=1");
  return ctx;
}

export async function signIn(form: FormData) {
  if (!backendReady()) redirect("/business/login?error=offline");
  const email = str(form, "email", 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/business/login?error=email");
  const sb = (await supabaseServer())!;
  const origin = appUrl((await headers()).get("origin") ?? undefined);
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${origin}/auth/callback?next=/business` } });
  if (error) redirect("/business/login?error=send");
  redirect("/business/login?sent=1");
}

export async function signOut() {
  const sb = await supabaseServer();
  await sb?.auth.signOut();
  (await cookies()).delete(BUSINESS_COOKIE);
  redirect("/business/login");
}

export async function selectBusiness(form: FormData) {
  const ctx = await live();
  const id = str(form, "business", 64);
  if (!ctx.businesses.some((b) => b.id === id)) {
    if (!ctx.staff) redirect("/business");
    const { data, error } = await ctx.sb.rpc("staff_switch", { p_business: id });
    if (error || !data || (Array.isArray(data) && data.length === 0)) redirect("/staff/businesses?error=not_found");
  }
  (await cookies()).set(BUSINESS_COOKIE, id, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 365 });
  redirect("/business");
}

export async function createBusiness(form: FormData) {
  const ctx = await live();
  const name = str(form, "name", 120);
  const slug = str(form, "slug", 60).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const directory = str(form, "directory_slug", 80) || null;
  const { data, error } = await ctx.sb.rpc("create_business", { p_name: name, p_slug: slug, p_directory_slug: directory });
  if (error || !data) redirect(back("/business/new", { error: error?.message ?? "failed", name, slug }));
  (await cookies()).set(BUSINESS_COOKIE, String(data), { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 365 });
  redirect("/business?welcome=1");
}

async function attachFiles(ctx: Awaited<ReturnType<typeof live>>, businessId: string, requestId: string, files: File[]) {
  const problems: string[] = [];
  for (const file of files.slice(0, 5)) {
    if (!file.size) continue;
    if (!ATTACH_TYPES.includes(file.type) || file.size > 10 * 1024 * 1024) {
      problems.push(file.name);
      continue;
    }
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-80);
    const path = `${businessId}/${requestId}/${randomUUID()}-${safe}`;
    const up = await ctx.sb.storage.from("request-attachments").upload(path, file, { contentType: file.type, upsert: false });
    if (up.error) {
      problems.push(file.name);
      continue;
    }
    const { error } = await ctx.sb.rpc("add_request_attachment", { p_request: requestId, p_path: path, p_filename: file.name, p_content_type: file.type, p_size: file.size });
    if (error) problems.push(file.name);
  }
  return problems;
}

export async function createRequest(form: FormData) {
  const ctx = await live();
  if (!ctx.business) redirect("/business/new");
  const title = str(form, "title", 140);
  const body = str(form, "body");
  const kind = str(form, "kind", 10) === "feature" ? "feature" : "update";
  const { data, error } = await ctx.sb.rpc("create_update_request", { p_business: ctx.business.id, p_title: title, p_body: body, p_kind: kind });
  if (error || !data) redirect(back("/business/requests/new", { error: error?.message ?? "failed", title, kind }));
  const problems = await attachFiles(ctx, ctx.business.id, String(data), form.getAll("files").filter((f): f is File => f instanceof File));
  revalidatePath("/business");
  redirect(back(`/business/requests/${data}`, problems.length ? { sent: "1", attach: problems.join(", ") } : { sent: "1" }));
}

export async function replyToRequest(form: FormData) {
  const ctx = await live();
  const id = str(form, "request", 64);
  const body = str(form, "body");
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (body) {
    const { error } = await ctx.sb.rpc("add_request_message", { p_request: id, p_body: body, p_internal: false });
    if (error) redirect(back(`/business/requests/${id}`, { error: error.message }));
  }
  let problems: string[] = [];
  if (files.length && ctx.business) problems = await attachFiles(ctx, ctx.business.id, id, files);
  revalidatePath(`/business/requests/${id}`);
  redirect(back(`/business/requests/${id}`, problems.length ? { attach: problems.join(", ") } : { ok: "1" }));
}

export async function customerDecision(form: FormData) {
  const ctx = await live();
  const id = str(form, "request", 64);
  const to = str(form, "to", 20);
  if (!["completed", "in_progress"].includes(to)) redirect(`/business/requests/${id}`);
  const { error } = await ctx.sb.rpc("transition_update_request", { p_request: id, p_to: to, p_note: str(form, "note") || null, p_preview_url: null, p_completion_note: null });
  revalidatePath(`/business/requests/${id}`);
  redirect(back(`/business/requests/${id}`, error ? { error: error.message } : { ok: "1" }));
}
