import { test } from "node:test";
import assert from "node:assert/strict";
import { freshDb, addUser, as, one, rows, rejects, verifyUser, U } from "./harness.ts";

/** Preloads a business and its trusted owner email the way provisioning does (direct session). */
async function preload(db: Awaited<ReturnType<typeof freshDb>>, name: string, slug: string, email: string) {
  const { id } = await one<{ id: string }>(db, "insert into public.businesses (name, slug, directory_slug, created_by) values ($1, $2, $2, null) returning id", [name, slug]);
  await db.query("insert into public.websites (business_id) values ($1)", [id]);
  await db.query("insert into public.pending_access (email, business_id, role, note) values ($1, $2, 'owner', 'trusted owner')", [email, id]);
  return id;
}

test("an existing verified user is matched to the preloaded listing at provisioning time, by exact normalised email only", async () => {
  const db = await freshDb();
  await addUser(db, U.alice, "Jake@TheBarPeople.co.uk", true);
  const bar = await preload(db, "The Bar People", "the-bar-people", "jake@thebarpeople.co.uk");
  await preload(db, "Someone Else", "someone-else", "jake@otherdomain.co.uk");
  assert.equal((await one<{ n: number }>(db, "select public.apply_pending_access($1) as n", [U.alice])).n, 1);
  assert.deepEqual(await as(db, U.alice, () => rows<{ slug: string; role: string }>(db, "select b.slug, m.role from public.memberships m join public.businesses b on b.id = m.business_id where m.user_id = auth.uid()")), [{ slug: "the-bar-people", role: "owner" }]);
  // running it again changes nothing
  assert.equal((await one<{ n: number }>(db, "select public.apply_pending_access($1) as n", [U.alice])).n, 0);
  assert.equal((await rows(db, "select * from public.memberships where business_id = $1", [bar])).length, 1);
});

test("a newly verified user is matched by the trigger; an unverified sign-up and a near-miss email get nothing", async () => {
  const db = await freshDb();
  await preload(db, "Floriography Studio", "floriography-studio", "owner@floriography.test");
  await addUser(db, U.bob, "owner@floriography.test", false);
  assert.equal((await rows(db, "select * from public.memberships where user_id = $1", [U.bob])).length, 0);
  await addUser(db, U.carol, "owner+1@floriography.test", true);
  await addUser(db, U.dave, "info@floriography.test", true);
  assert.equal((await rows(db, "select * from public.memberships")).length, 0);
  await verifyUser(db, U.bob);
  assert.deepEqual((await rows<{ user_id: string }>(db, "select user_id from public.memberships")).map((r) => r.user_id), [U.bob]);
  assert.equal((await rows(db, "select * from public.pending_access where claimed_at is null")).length, 0);
});

test("the same trusted email on two listings grants both (one person, two businesses); the same email twice on one listing is refused", async () => {
  const db = await freshDb();
  const a = await preload(db, "A Co", "a-co", "jake@thebarpeople.co.uk");
  const b = await preload(db, "B Co", "b-co", "jake@thebarpeople.co.uk");
  await assert.rejects(db.query("insert into public.pending_access (email, business_id) values ('jake@thebarpeople.co.uk', $1)", [a]), /duplicate key/);
  await assert.rejects(db.query("insert into public.pending_access (email, business_id) values ('Jake@TheBarPeople.co.uk ', $1)", [b]), /violates check constraint/);
  await addUser(db, U.alice, "jake@thebarpeople.co.uk", true);
  assert.deepEqual((await rows<{ slug: string }>(db, "select b.slug from public.memberships m join public.businesses b on b.id = m.business_id where m.user_id = $1 order by b.slug", [U.alice])).map((r) => r.slug), ["a-co", "b-co"]);
});

test("cross-tenant denial holds for matched owners, and unmatched users only get a review request", async () => {
  const db = await freshDb();
  const bar = await preload(db, "The Bar People", "the-bar-people", "jake@thebarpeople.co.uk");
  const flo = await preload(db, "Floriography Studio", "floriography-studio", "owner@floriography.test");
  await addUser(db, U.alice, "jake@thebarpeople.co.uk", true);
  await addUser(db, U.bob, "owner@floriography.test", true);
  await addUser(db, U.carol, "stranger@example.test", true);
  // alice sees only her business; bob only his; carol none
  assert.deepEqual((await as(db, U.alice, () => rows<{ slug: string }>(db, "select slug from public.businesses order by slug"))).map((r) => r.slug), ["the-bar-people"]);
  assert.deepEqual((await as(db, U.bob, () => rows<{ slug: string }>(db, "select slug from public.businesses order by slug"))).map((r) => r.slug), ["floriography-studio"]);
  assert.equal((await as(db, U.carol, () => rows(db, "select slug from public.businesses"))).length, 0);
  // bob cannot touch the bar people draft; nobody can read the trusted-email table
  assert.match(await rejects(as(db, U.bob, () => db.query(`select public.save_website_draft($1, '{"x":1}', 0)`, [bar]))), /not_member/);
  const aliceSees = await as(db, U.alice, () => rows(db, "select * from public.pending_access")).catch((e: Error) => e.message);
  assert.ok(Array.isArray(aliceSees) ? aliceSees.length === 0 : /permission denied/.test(aliceSees), "owners never see the trusted-email table");
  assert.match(await rejects(as(db, "anon", () => db.query("select * from public.pending_access"))), /permission denied/);
  // carol can only ask for access; it grants nothing and she cannot open two requests
  await as(db, U.carol, () => db.query("select public.request_listing_access('The Bar People', 'the-bar-people', 'I run it')"));
  assert.match(await rejects(as(db, U.carol, () => db.query("select public.request_listing_access('The Bar People')"))), /request_open/);
  assert.equal((await as(db, U.carol, () => rows(db, "select slug from public.businesses"))).length, 0);
  assert.equal((await as(db, U.carol, () => rows<{ status: string; email: string }>(db, "select status, email from public.claim_requests")))[0].email, "stranger@example.test");
  assert.equal((await as(db, U.alice, () => rows(db, "select * from public.claim_requests"))).length, 0);
  assert.match(await rejects(as(db, "anon", () => db.query("select public.request_listing_access('X')"))), /permission denied|not_authenticated/);
  void flo;
});
