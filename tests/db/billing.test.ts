import { test } from "node:test";
import assert from "node:assert/strict";
import { freshDb, addUser, as, one, rows, rejects, subscribe, U } from "./harness.ts";

async function setup() {
  const db = await freshDb();
  await addUser(db, U.alice);
  const a = await as(db, U.alice, () => one<{ id: string }>(db, "select public.create_business('Alice Bars', 'alice-bars') as id"));
  return { db, A: a.id };
}
const mod = (db: Awaited<ReturnType<typeof freshDb>>, A: string, m: string) =>
  as(db, U.alice, () => one<{ h: boolean }>(db, "select public.has_module($1, $2) as h", [A, m])).then((r) => r.h);

test("no subscription means no paid modules", async () => {
  const { db, A } = await setup();
  for (const m of ["listing", "website", "requests", "seo", "social"]) assert.equal(await mod(db, A, m), false, m);
  await as(db, U.alice, async () => {
    assert.match(await rejects(db.query("select public.create_update_request($1, 'Hero', 'Change it')", [A])), /plan_required/);
  });
});

test("£50 website plan, £75 adds SEO, £100 adds social", async () => {
  const { db, A } = await setup();
  await subscribe(db, A, "website", "active", new Date("2026-11-01T10:00:00Z"));
  assert.deepEqual([await mod(db, A, "requests"), await mod(db, A, "seo"), await mod(db, A, "social")], [true, false, false]);
  await subscribe(db, A, "seo", "active", new Date("2026-11-01T11:00:00Z"));
  assert.deepEqual([await mod(db, A, "seo"), await mod(db, A, "social")], [true, false]);
  await subscribe(db, A, "social", "active", new Date("2026-11-01T12:00:00Z"));
  assert.equal(await mod(db, A, "social"), true);
});

test("past_due keeps access while Stripe retries; unpaid and canceled remove it but keep history readable", async () => {
  const { db, A } = await setup();
  await subscribe(db, A, "website", "active", new Date("2026-11-01T10:00:00Z"));
  const req = await as(db, U.alice, () => one<{ id: string }>(db, "select public.create_update_request($1, 'Menu', 'Update prices') as id", [A]));
  await subscribe(db, A, "website", "past_due", new Date("2026-11-02T10:00:00Z"));
  assert.equal(await mod(db, A, "requests"), true);
  await subscribe(db, A, "website", "unpaid", new Date("2026-11-03T10:00:00Z"));
  assert.equal(await mod(db, A, "requests"), false);
  await subscribe(db, A, "website", "canceled", new Date("2026-11-04T10:00:00Z"));
  await as(db, U.alice, async () => {
    assert.equal((await rows(db, "select id from public.update_requests where id = $1", [req.id])).length, 1);
    assert.match(await rejects(db.query("select public.create_update_request($1, 'Another', 'x')", [A])), /plan_required/);
  });
});

test("incomplete checkout grants nothing", async () => {
  const { db, A } = await setup();
  await subscribe(db, A, "social", "incomplete");
  assert.equal(await mod(db, A, "website"), false);
});

test("an older Stripe event never overwrites a newer state", async () => {
  const { db, A } = await setup();
  assert.equal((await subscribe(db, A, "website", "canceled", new Date("2026-11-05T10:00:00Z"))).r, "applied");
  assert.equal((await subscribe(db, A, "website", "active", new Date("2026-11-04T10:00:00Z"))).r, "stale");
  assert.equal(await mod(db, A, "website"), false);
});

test("a subscription cannot be moved to another business by a later event", async () => {
  const { db, A } = await setup();
  await addUser(db, U.bob);
  const B = (await as(db, U.bob, () => one<{ id: string }>(db, "select public.create_business('Bob Discos', 'bob-discos') as id"))).id;
  await subscribe(db, A, "social", "active", new Date("2026-11-01T10:00:00Z"));
  const moved = await as(db, "service", () =>
    one<{ r: string }>(
      db,
      "select public.upsert_subscription($1, $2, 'cus_x', 'social', 'price_social', 'active', null, false, null, false, '2026-11-02T10:00:00Z') as r",
      [B, `sub_${A.slice(-6)}`],
    ),
  );
  assert.equal(moved.r, "stale");
  assert.equal(await mod(db, A, "social"), true);
});

test("webhook ledger: claim once, duplicates acknowledged, failed events retried", async () => {
  const { db } = await setup();
  const claim = () => as(db, "service", () => one<{ r: string }>(db, "select public.claim_stripe_event('evt_1', 'invoice.paid', false, now()) as r"));
  assert.equal((await claim()).r, "claimed");
  assert.equal((await claim()).r, "in_flight");
  await as(db, "service", () => db.query("select public.finish_stripe_event('evt_1', 'failed', 'db timeout')"));
  assert.equal((await claim()).r, "claimed");
  await as(db, "service", () => db.query("select public.finish_stripe_event('evt_1', 'processed')"));
  assert.equal((await claim()).r, "duplicate");
  const e = await one<{ attempts: number; status: string }>(db, "select attempts, status from public.stripe_events where id = 'evt_1'");
  assert.deepEqual(e, { attempts: 2, status: "processed" });
});

test("members cannot call service-only billing functions", async () => {
  const { db, A } = await setup();
  await as(db, U.alice, async () => {
    assert.match(await rejects(db.query("select public.claim_stripe_event('evt_x', 't', false, now())")), /permission denied/);
    assert.match(
      await rejects(
        db.query("select public.upsert_subscription($1, 'sub_h', 'cus_h', 'social', 'p', 'active', null, false, null, false, now())", [A]),
      ),
      /permission denied/,
    );
  });
});
