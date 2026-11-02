import { test } from "node:test";
import assert from "node:assert/strict";
import { freshDb, addUser, as, rows, one, rejects, subscribe, U } from "./harness.ts";

async function setup() {
  const db = await freshDb();
  for (const id of Object.values(U)) await addUser(db, id);
  const a = await as(db, U.alice, () => one<{ id: string }>(db, "select public.create_business('Alice Bars', 'alice-bars') as id"));
  const b = await as(db, U.bob, () => one<{ id: string }>(db, "select public.create_business('Bob Discos', 'bob-discos') as id"));
  return { db, A: a.id, B: b.id };
}

test("a member sees only their own business, memberships, website and subscription", async () => {
  const { db, A, B } = await setup();
  await subscribe(db, B, "social");
  await as(db, U.alice, async () => {
    assert.deepEqual((await rows(db, "select id from public.businesses")).map((r) => r.id), [A]);
    assert.equal((await rows(db, "select * from public.memberships")).length, 1);
    assert.equal((await rows(db, "select * from public.websites where business_id = $1", [B])).length, 0);
    assert.equal((await rows(db, "select * from public.subscriptions")).length, 0);
  });
});

test("another company's business id is refused by every write function", async () => {
  const { db, B } = await setup();
  await subscribe(db, B, "social");
  await as(db, U.alice, async () => {
    assert.match(await rejects(db.query("select public.create_update_request($1, 'Change hero', 'Please')", [B])), /not_member/);
    assert.match(await rejects(db.query("select public.save_website_draft($1, '{}'::jsonb, 0)", [B])), /not_member/);
    assert.match(await rejects(db.query("select public.publish_website($1, 0)", [B])), /not_member/);
    assert.match(
      await rejects(db.query("select public.save_social_post($1, null, 'hi', '[]'::jsonb, '{}'::uuid[], null, 'Europe/London', false)", [B])),
      /not_member/,
    );
  });
});

test("anonymous visitors cannot read tables or call business functions", async () => {
  const { db, A } = await setup();
  await as(db, "anon", async () => {
    assert.match(await rejects(db.query("select * from public.businesses")), /permission denied/);
    assert.match(await rejects(db.query("select public.create_business('X Co', 'x-co')")), /permission denied/);
    assert.match(await rejects(db.query("select public.create_update_request($1, 'abc', 'x')", [A])), /permission denied/);
  });
});

test("signing up never grants staff access; staff is an explicit row", async () => {
  const { db, A } = await setup();
  await subscribe(db, A, "website");
  await as(db, U.alice, () => db.query("select public.create_update_request($1, 'New photos', 'Swap the gallery')", [A]));
  await as(db, U.staff, async () => {
    assert.equal((await one<{ s: boolean }>(db, "select public.is_staff() as s")).s, false);
    assert.equal((await rows(db, "select * from public.update_requests")).length, 0);
  });
  await db.query("insert into public.staff_members (user_id, note) values ($1, 'AnyVendor team')", [U.staff]);
  await as(db, U.staff, async () => {
    assert.equal((await rows(db, "select * from public.update_requests")).length, 1);
  });
  await as(db, U.alice, async () => {
    assert.match(await rejects(db.query("insert into public.staff_members (user_id) values ($1)", [U.alice])), /permission denied/);
  });
});

test("provider tokens and the Stripe ledger are unreadable to members", async () => {
  const { db, A } = await setup();
  const c = await one<{ id: string }>(
    db,
    "insert into public.provider_connections (business_id, provider, external_account_id) values ($1, 'linkedin', 'urn:li:person:1') returning id",
    [A],
  );
  await db.query("insert into public.provider_tokens (connection_id, access_ciphertext) values ($1, 'v1:x')", [c.id]);
  await as(db, U.alice, async () => {
    assert.equal((await rows(db, "select * from public.provider_connections")).length, 1);
    assert.match(await rejects(db.query("select * from public.provider_tokens")), /permission denied/);
    assert.match(await rejects(db.query("select * from public.stripe_events")), /permission denied/);
    assert.match(await rejects(db.query("select * from public.billing_customers")), /permission denied/);
  });
});

test("a member can be added to a second business and sees both, nothing else", async () => {
  const { db, A, B } = await setup();
  await db.query("insert into public.memberships (business_id, user_id, role) values ($1, $2, 'editor')", [B, U.carol]);
  await db.query("insert into public.memberships (business_id, user_id, role) values ($1, $2, 'editor')", [A, U.carol]);
  await as(db, U.carol, async () => {
    assert.equal((await rows(db, "select id from public.businesses")).length, 2);
    assert.equal((await one<{ o: boolean }>(db, "select public.is_owner($1) as o", [A])).o, false);
  });
});
