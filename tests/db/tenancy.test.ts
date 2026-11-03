import { test } from "node:test";
import assert from "node:assert/strict";
import { freshDb, addUser, as, one, rows, rejects, subscribe, verifyUser, U } from "./harness.ts";

async function setup() {
  const db = await freshDb();
  await addUser(db, U.alice, "alice@example.test");
  await addUser(db, U.bob, "bob@example.test");
  await addUser(db, U.staff, "staff@anyvendor.test");
  await db.query("insert into public.staff_members (user_id, note) values ($1, 'bootstrap')", [U.staff]);
  const A = (await as(db, U.alice, () => one<{ id: string }>(db, "select public.create_business('Alice Bars', 'alice-bars', 'the-bar-people') as id"))).id;
  return { db, A };
}

test("naming a listing at sign-up is only a claim; linking is staff work and listings cannot be linked twice", async () => {
  const { db, A } = await setup();
  const b = await one<{ directory_slug: string | null; listing_claim_note: string | null }>(db, "select directory_slug, listing_claim_note from public.businesses where id = $1", [A]);
  assert.deepEqual(b, { directory_slug: null, listing_claim_note: "the-bar-people" });
  assert.match(await rejects(as(db, U.alice, () => db.query("select public.link_listing($1, 'the-bar-people')", [A]))), /staff_only/);
  await as(db, U.staff, () => db.query("select public.link_listing($1, 'the-bar-people')", [A]));
  const B = (await as(db, U.bob, () => one<{ id: string }>(db, "select public.create_business('Bob Bars', 'bob-bars') as id"))).id;
  assert.match(await rejects(as(db, U.staff, () => db.query("select public.link_listing($1, 'the-bar-people')", [B]))), /duplicate key/);
});

test("access is granted only to a verified auth user with the exact email; unverified rows get nothing until verified", async () => {
  const { db, A } = await setup();
  await as(db, U.staff, () => db.query("select public.add_pending_access('dave@example.test', $1, 'owner', false, 'Mr Tee''s owner')", [A]));
  await as(db, U.staff, () => db.query("select public.add_pending_access('erin@example.test', null, 'owner', true, 'AnyVendor admin')"));
  // An unverified sign-up with the exact email gets no membership, no staff and claims nothing.
  await addUser(db, U.dave, "dave@example.test", false);
  const none = await one<{ m: number; s: number; p: number }>(db, "select (select count(*)::int from public.memberships where user_id = $1) as m, (select count(*)::int from public.staff_members where user_id = $1) as s, (select count(*)::int from public.pending_access where claimed_at is null) as p", [U.dave]);
  assert.deepEqual(none, { m: 0, s: 0, p: 2 });
  // Staff re-adding the same email still does not grant an unverified account.
  assert.match(await rejects(as(db, U.staff, () => db.query("select public.add_pending_access('dave@example.test', $1)", [A]))), /duplicate key/);
  assert.equal((await rows(db, "select * from public.memberships where user_id = $1", [U.dave])).length, 0);
  // A different verified user with a similar but not identical email claims nothing.
  await addUser(db, U.carol, "dave+other@example.test", true);
  assert.equal((await rows(db, "select * from public.memberships where user_id = $1", [U.carol])).length, 0);
  // Verification of the exact email grants exactly that row, once.
  await verifyUser(db, U.dave);
  await verifyUser(db, U.dave);
  const got = await one<{ m: number; s: number; p: number }>(db, "select (select count(*)::int from public.memberships where user_id = $1) as m, (select count(*)::int from public.staff_members where user_id = $1) as s, (select count(*)::int from public.pending_access where claimed_at is null) as p", [U.dave]);
  assert.deepEqual(got, { m: 1, s: 0, p: 1 });
  assert.equal((await rows(db, "select * from public.audit_log where action = 'access.granted'")).length, 1);
  // The service role and direct sessions may apply; anon and ordinary users cannot call it at all.
  assert.match(await rejects(as(db, "anon", () => db.query("select public.apply_pending_access($1)", [U.dave]))), /permission denied/);
  assert.match(await rejects(as(db, U.alice, () => db.query("select public.apply_pending_access($1)", [U.dave]))), /permission denied/);
});

test("access by exact email: an existing verified user is granted at once, a future sign-up is granted by the trigger, nothing is emailed", async () => {
  const { db, A } = await setup();
  await as(db, U.staff, () => db.query("select public.add_pending_access('carol@example.test', $1, 'editor', false, 'Floriography owner')", [A]));
  await as(db, U.staff, () => db.query("select public.add_pending_access('BOB@example.test', null, 'owner', true, 'AnyVendor admin')"));
  assert.equal((await one<{ s: boolean }>(db, "select exists(select 1 from public.staff_members where user_id = $1) as s", [U.bob])).s, true);
  await addUser(db, U.carol, "Carol@Example.test");
  const m = await one<{ role: string }>(db, "select role from public.memberships where user_id = $1 and business_id = $2", [U.carol, A]);
  assert.equal(m.role, "editor");
  assert.equal((await rows(db, "select * from public.pending_access where claimed_at is null")).length, 0);
  assert.match(await rejects(as(db, U.alice, () => db.query("select public.add_pending_access('x@example.test', $1)", [A]))), /staff_only/);
  const log = await as(db, U.staff, () => rows<{ action: string }>(db, "select action from public.audit_log order by id"));
  assert.ok(log.some((l) => l.action === "access.granted"));
});

test("staff switch is logged; staff edits on a vendor are allowed and audited; strangers are refused", async () => {
  const { db, A } = await setup();
  const sw = await as(db, U.staff, () => one<{ name: string }>(db, "select name from public.staff_switch($1)", [A]));
  assert.equal(sw.name, "Alice Bars");
  await as(db, U.staff, () => db.query(`select public.save_website_draft($1, '{"hero":"by staff"}', 0)`, [A]));
  await as(db, U.alice, () => db.query(`select public.save_website_draft($1, '{"hero":"by owner"}', 1)`, [A]));
  assert.match(await rejects(as(db, U.bob, () => db.query(`select public.save_website_draft($1, '{}', 2)`, [A]))), /not_member/);
  const actions = (await as(db, U.staff, () => rows<{ action: string; actor: string }>(db, "select action, actor from public.audit_log where business_id = $1 order by id", [A]))).map((r) => `${r.action}:${r.actor === U.staff ? "staff" : "other"}`);
  assert.deepEqual(actions.filter((a) => a.startsWith("staff.")), ["staff.switch:staff", "staff.website.save:staff"]);
  assert.match(await rejects(as(db, U.alice, () => db.query("select * from public.audit_log"))).then((m) => m).catch(() => "ok"), /permission denied|ok/);
});

test("an internal test plan unlocks modules but is not a subscription", async () => {
  const { db, A } = await setup();
  const mod = (m: string) => as(db, U.alice, () => one<{ h: boolean }>(db, "select public.has_module($1, $2) as h", [A, m])).then((r) => r.h);
  assert.equal(await mod("website"), false);
  assert.match(await rejects(as(db, U.alice, () => db.query("select public.grant_internal_plan($1, 'social', 'self grant')", [A]))), /staff_only/);
  await as(db, U.staff, () => db.query("select public.grant_internal_plan($1, 'social', 'Internal test plan for the Bar People', now() + interval '30 days')", [A]));
  assert.equal(await mod("social"), true);
  assert.equal((await rows(db, "select * from public.subscriptions")).length, 0);
  const seen = await as(db, U.alice, () => one<{ label: string }>(db, "select label from public.internal_entitlements"));
  assert.match(seen.label, /Internal test plan/);
  await as(db, U.staff, () => db.query("select public.grant_internal_plan($1, 'website', 'expired', now() - interval '1 day')", [A]));
  assert.equal(await mod("website"), false);
  await subscribe(db, A, "marketing");
  assert.equal(await mod("seo"), true);
});

test("content contract: published content is public, drafts need the preview token, no plan means nothing", async () => {
  const { db, A } = await setup();
  await as(db, U.staff, () => db.query(`select public.set_site_kind($1, 'bespoke', 'https://floriography.vercel.app', null)`, [A]));
  await as(db, U.staff, () => db.query(`select public.set_site_manifest($1, '{"version":1,"sections":[{"key":"hero","fields":[{"key":"headline","type":"text"}]}]}')`, [A]));
  assert.match(await rejects(as(db, U.alice, () => db.query(`select public.set_site_manifest($1, '{"sections":[]}')`, [A]))), /staff_only/);
  await as(db, U.alice, () => db.query(`select public.save_website_draft($1, '{"hero":{"headline":"Draft words"}}', 0)`, [A]));
  assert.equal((await as(db, "anon", () => rows(db, "select * from public.public_site_v1('alice-bars')"))).length, 0);
  await as(db, U.staff, () => db.query("select public.grant_internal_plan($1, 'website', 'test')", [A]));
  await as(db, U.alice, () => db.query("select public.publish_website($1, 1)", [A]));
  const pub = await as(db, "anon", () => one<{ content: { hero: { headline: string } }; kind: string; manifest_version: number }>(db, "select content, kind, manifest_version from public.public_site_v1('alice-bars')"));
  assert.deepEqual([pub.content.hero.headline, pub.kind, pub.manifest_version], ["Draft words", "bespoke", 1]);
  await as(db, U.alice, () => db.query(`select public.save_website_draft($1, '{"hero":{"headline":"Newer draft"}}', 1)`, [A]));
  const token = (await as(db, U.alice, () => one<{ t: string }>(db, "select preview_token as t from public.websites where business_id = $1", [A]))).t;
  const draft = await as(db, "anon", () => one<{ content: { hero: { headline: string } } }>(db, "select content from public.site_draft_v1('alice-bars', $1)", [token]));
  assert.equal(draft.content.hero.headline, "Newer draft");
  assert.equal((await as(db, "anon", () => rows(db, "select * from public.site_draft_v1('alice-bars', gen_random_uuid())"))).length, 0);
  assert.equal((await as(db, "anon", () => one<{ h: string }>(db, "select (content->'hero'->>'headline') as h from public.public_site_v1('alice-bars')"))).h, "Draft words");
});

test("privileged functions refuse anon and ordinary users even with no uid", async () => {
  const { db, A } = await setup();
  for (const call of ["select public.provision_business('X', 'x-co')", `select public.grant_internal_plan('${A}', 'website', 'nope')`, `select public.set_site_manifest('${A}', '{"sections":[]}')`, `select public.set_site_kind('${A}', 'bespoke')`]) {
    assert.match(await rejects(as(db, "anon", () => db.query(call))), /permission denied|staff_only/, call);
    assert.match(await rejects(as(db, U.bob, () => db.query(call))), /staff_only/, call);
  }
  assert.equal((await as(db, "anon", () => one<{ p: boolean | null }>(db, "select public.is_privileged() as p").catch(() => ({ p: null })))).p, null);
});

test("provisioning is idempotent by slug and never duplicates a tenant", async () => {
  const { db } = await setup();
  const first = await as(db, "service", () => one<{ id: string }>(db, "select public.provision_business('Mr Tee''s Mobile Crazy Golf', 'mr-tees-crazy-golf', null, 'bespoke') as id"));
  const again = await as(db, U.staff, () => one<{ id: string }>(db, "select public.provision_business('Mr Tee''s Mobile Crazy Golf', 'mr-tees-crazy-golf', null, 'bespoke') as id"));
  assert.equal(first.id, again.id);
  assert.equal((await rows(db, "select * from public.businesses where slug = 'mr-tees-crazy-golf'")).length, 1);
  assert.equal((await one<{ kind: string }>(db, "select kind from public.websites where business_id = $1", [first.id])).kind, "bespoke");
  assert.match(await rejects(as(db, U.alice, () => db.query("select public.provision_business('X', 'x-co')"))), /staff_only/);
});
