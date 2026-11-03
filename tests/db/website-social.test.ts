import { test } from "node:test";
import assert from "node:assert/strict";
import { freshDb, addUser, as, one, rows, rejects, subscribe, U } from "./harness.ts";

async function setup(plan: "listing" | "website" | "marketing" | "social" | "ai" | null = "social") {
  const db = await freshDb();
  for (const id of [U.alice, U.bob]) await addUser(db, id);
  const A = (await as(db, U.alice, () => one<{ id: string }>(db, "select public.create_business('Alice Bars', 'alice-bars') as id"))).id;
  const B = (await as(db, U.bob, () => one<{ id: string }>(db, "select public.create_business('Bob Discos', 'bob-discos') as id"))).id;
  if (plan) await subscribe(db, A, plan);
  const conn = async (business: string, provider = "linkedin") =>
    (await one<{ id: string }>(
      db,
      "insert into public.provider_connections (business_id, provider, external_account_id, display_name) values ($1, $2::public.provider_kind, $3, 'Acct') returning id",
      [business, provider, `ext-${provider}-${business.slice(-4)}`],
    )).id;
  return { db, A, B, conn };
}

test("website drafts use optimistic versions; publishing needs a plan; the public site shows only published content", async () => {
  const { db, A } = await setup(null);
  const save = (content: object, v: number) => as(db, U.alice, () => one<{ v: number }>(db, "select public.save_website_draft($1, $2::jsonb, $3) as v", [A, JSON.stringify(content), v]));
  assert.equal((await save({ hero: "Cocktails" }, 0)).v, 1);
  assert.match(await rejects(save({ hero: "Stale tab" }, 0)), /version_conflict/);
  assert.match(await rejects(as(db, U.alice, () => db.query("select public.publish_website($1, 1)", [A]))), /plan_required/);
  assert.equal((await as(db, "anon", () => rows(db, "select * from public.public_site('alice-bars')"))).length, 0);
  await subscribe(db, A, "website");
  await as(db, U.alice, () => db.query("select public.publish_website($1, 1)", [A]));
  await save({ hero: "Unpublished change" }, 1);
  const site = await as(db, "anon", () => one<{ content: { hero: string } }>(db, "select content from public.public_site('alice-bars')"));
  assert.equal(site.content.hero, "Cocktails");
});

test("restoring a revision becomes a new draft version and keeps history", async () => {
  const { db, A } = await setup("website");
  await as(db, U.alice, () => db.query(`select public.save_website_draft($1, '{"hero":"One"}', 0)`, [A]));
  await as(db, U.alice, () => db.query(`select public.save_website_draft($1, '{"hero":"Two"}', 1)`, [A]));
  const first = await one<{ id: string }>(db, "select id from public.website_revisions where business_id = $1 and version = 1", [A]);
  const v = await as(db, U.alice, () => one<{ v: number }>(db, "select public.restore_website_revision($1, $2, 2) as v", [A, first.id]));
  assert.equal(v.v, 3);
  const w = await one<{ draft: { hero: string } }>(db, "select draft from public.websites where business_id = $1", [A]);
  assert.equal(w.draft.hero, "One");
  assert.equal((await rows(db, "select * from public.website_revisions where business_id = $1", [A])).length, 3);
});

test("social scheduling needs the £100 plan, a future time and the business's own connected account", async () => {
  const { db, A, B, conn } = await setup("marketing");
  const mine = await conn(A);
  const theirs = await conn(B);
  const schedule = (conns: string[], when: string) =>
    as(db, U.alice, () =>
      one<{ id: string }>(db, "select public.save_social_post($1, null, 'Winter menu is live', '[]'::jsonb, $2::uuid[], $3::timestamptz, 'Europe/London', true) as id", [A, conns, when]),
    );
  assert.match(await rejects(schedule([mine], "2030-01-01T10:00:00Z")), /plan_required/);
  await subscribe(db, A, "social", "active", new Date(Date.now() + 1000));
  assert.match(await rejects(schedule([mine], new Date(Date.now() - 60_000).toISOString())), /schedule_in_future/);
  assert.match(await rejects(schedule([theirs], "2030-01-01T10:00:00Z")), /connection_not_found/);
  await db.query("update public.provider_connections set status = 'needs_reconnect' where id = $1", [mine]);
  assert.match(await rejects(schedule([mine], "2030-01-01T10:00:00Z")), /connection_needs_reconnect/);
  await db.query("update public.provider_connections set status = 'connected' where id = $1", [mine]);
  const post = await schedule([mine], "2030-01-01T10:00:00Z");
  assert.equal((await one<{ status: string }>(db, "select status from public.social_posts where id = $1", [post.id])).status, "scheduled");
});

async function scheduledTarget() {
  const ctx = await setup("social");
  const c = await ctx.conn(ctx.A);
  const post = await as(ctx.db, U.alice, () =>
    one<{ id: string }>(ctx.db, "select public.save_social_post($1, null, 'Hello', '[]'::jsonb, $2::uuid[], '2030-01-01T10:00:00Z', 'Europe/London', true) as id", [ctx.A, [c]]),
  );
  await ctx.db.query("update public.social_post_targets set next_attempt_at = now() - interval '1 minute' where post_id = $1", [post.id]);
  const claim = () => as(ctx.db, "service", () => rows<{ id: string; attempts: number }>(ctx.db, "select id, attempts from public.claim_due_social_targets(10)"));
  const record = (target: string, outcome: string, err: string | null = null) =>
    as(ctx.db, "service", () => one<{ r: string }>(ctx.db, "select public.record_social_target_result($1, $2, 'ext-1', 'https://x.test/p/1', $3) as r", [target, outcome, err])).then((r) => r.r);
  const postStatus = () => one<{ status: string }>(ctx.db, "select status from public.social_posts where id = $1", [post.id]).then((r) => r.status);
  return { ...ctx, connection: c, post: post.id, claim, record, postStatus };
}

test("a due target is claimed exactly once and a duplicate result is ignored", async () => {
  const { claim, record, postStatus } = await scheduledTarget();
  const first = await claim();
  assert.equal(first.length, 1);
  assert.equal((await claim()).length, 0);
  assert.equal(await record(first[0].id, "published"), "recorded");
  assert.equal(await record(first[0].id, "published"), "stale");
  assert.equal(await postStatus(), "published");
});

test("retryable errors back off and stop after three attempts", async () => {
  const { db, claim, record, postStatus } = await scheduledTarget();
  for (let i = 1; i <= 3; i++) {
    const [t] = await claim();
    assert.equal(t.attempts, i);
    await record(t.id, "retryable_error", "Provider timeout");
    await db.query("update public.social_post_targets set next_attempt_at = now() - interval '1 second' where id = $1 and status = 'scheduled'", [t.id]);
  }
  assert.equal((await claim()).length, 0);
  assert.equal(await postStatus(), "failed");
});

test("an expired token marks the account for reconnection", async () => {
  const { db, claim, record, connection } = await scheduledTarget();
  const [t] = await claim();
  await record(t.id, "auth_error", "Token expired");
  assert.equal((await one<{ status: string }>(db, "select status from public.provider_connections where id = $1", [connection])).status, "needs_reconnect");
});

test("a target stuck mid-publish is failed, never re-posted automatically", async () => {
  const { db, claim, postStatus } = await scheduledTarget();
  const [t] = await claim();
  await db.query("update public.social_post_targets set claimed_at = now() - interval '11 minutes' where id = $1", [t.id]);
  assert.equal((await claim()).length, 0);
  const row = await one<{ status: string; last_error: string }>(db, "select status, last_error from public.social_post_targets where id = $1", [t.id]);
  assert.equal(row.status, "failed");
  assert.match(row.last_error, /outcome unknown/);
  assert.equal(await postStatus(), "failed");
});

test("if the plan lapses before the post is due, nothing is published", async () => {
  const { db, A, claim } = await scheduledTarget();
  await subscribe(db, A, "social", "canceled", new Date(Date.now() + 5000));
  assert.equal((await claim()).length, 0);
  const row = await one<{ status: string; last_error: string }>(db, "select status, last_error from public.social_post_targets");
  assert.deepEqual([row.status, /not on the current plan/.test(row.last_error)], ["failed", true]);
});

test("posts can be cancelled before publishing but not after a claim", async () => {
  const { db, post, claim } = await scheduledTarget();
  await claim();
  assert.match(await rejects(as(db, U.alice, () => db.query("select public.cancel_social_post($1)", [post]))), /post_locked/);
});

test("disconnecting an account cancels its scheduled posts and deletes its tokens", async () => {
  const { db, connection, post } = await scheduledTarget();
  await db.query("insert into public.provider_tokens (connection_id, access_ciphertext) values ($1, 'v1:x')", [connection]);
  await as(db, U.alice, () => db.query("select public.disconnect_provider($1)", [connection]));
  assert.equal((await one<{ status: string }>(db, "select status from public.social_post_targets where post_id = $1", [post])).status, "cancelled");
  assert.equal((await rows(db, "select * from public.provider_tokens")).length, 0);
});

test("a member can choose only a Search Console property the connected Google account actually has", async () => {
  const { db, A, B } = await setup("marketing");
  const c = await one<{ id: string }>(
    db,
    `insert into public.provider_connections (business_id, provider, external_account_id, settings)
     values ($1, 'google_search_console', 'google:x', '{"sites":["sc-domain:alice.test"]}') returning id`,
    [A],
  );
  await as(db, U.alice, () => db.query("select public.choose_seo_site($1, 'sc-domain:alice.test')", [c.id]));
  assert.match(await rejects(as(db, U.alice, () => db.query("select public.choose_seo_site($1, 'sc-domain:someone-else.test')", [c.id]))), /site_not_available/);
  assert.match(await rejects(as(db, U.bob, () => db.query("select public.choose_seo_site($1, 'sc-domain:alice.test')", [c.id]))), /not_member/);
  const row = await one<{ settings: { site: string } }>(db, "select settings from public.provider_connections where id = $1", [c.id]);
  assert.equal(row.settings.site, "sc-domain:alice.test");
  assert.ok(B);
});
