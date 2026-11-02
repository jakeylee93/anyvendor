import { test } from "node:test";
import assert from "node:assert/strict";
import { freshDb, addUser, as, one, rows, rejects, U } from "./harness.ts";

async function setup() {
  const db = await freshDb();
  for (const id of [U.alice, U.bob]) await addUser(db, id);
  const A = (await as(db, U.alice, () => one<{ id: string }>(db, "select public.create_business('Alice Bars', 'alice-bars') as id"))).id;
  const B = (await as(db, U.bob, () => one<{ id: string }>(db, "select public.create_business('Bob Discos', 'bob-discos') as id"))).id;
  return { db, A, B };
}

test("profile and brand kit save with versions, only for members", async () => {
  const { db, A, B } = await setup();
  const v1 = await as(db, U.alice, () => one<{ v: number }>(db, `select public.save_vendor_profile($1, '{"tagline":"Bars"}', 0) as v`, [A]));
  assert.equal(v1.v, 1);
  assert.match(await rejects(as(db, U.alice, () => db.query(`select public.save_vendor_profile($1, '{}', 0)`, [A]))), /version_conflict/);
  assert.match(await rejects(as(db, U.alice, () => db.query(`select public.save_brand_kit($1, '{}', 0)`, [B]))), /not_member/);
  await as(db, U.alice, () => db.query(`select public.save_brand_kit($1, '{"colours":[{"name":"Navy","hex":"#212235"}]}', 0)`, [A]));
  assert.equal((await as(db, U.bob, () => rows(db, "select * from public.brand_kits"))).length, 0);
  assert.equal((await as(db, U.alice, () => rows(db, "select * from public.vendor_profiles"))).length, 1);
});

test("brand files must sit in the business's own brand folder and be a safe type; removal is member-only", async () => {
  const { db, A } = await setup();
  const ok = await as(db, U.alice, () => one<{ id: string }>(db, "select public.add_brand_file($1, 'logo', 'Main logo', $2, 'image/svg+xml', 1200) as id", [A, `${A}/brand/logo.svg`]));
  assert.match(await rejects(as(db, U.alice, () => db.query("select public.add_brand_file($1, 'logo', 'x', $2, 'image/svg+xml', 10)", [A, `other/brand/x.svg`]))), /invalid_path/);
  assert.match(await rejects(as(db, U.alice, () => db.query("select public.add_brand_file($1, 'document', 'x', $2, 'text/html', 10)", [A, `${A}/brand/x.html`]))), /unsupported_type/);
  assert.match(await rejects(as(db, U.bob, () => db.query("select public.remove_brand_file($1)", [ok.id]))), /not_member/);
  const path = await as(db, U.alice, () => one<{ p: string }>(db, "select public.remove_brand_file($1) as p", [ok.id]));
  assert.equal(path.p, `${A}/brand/logo.svg`);
});

test("each person's dashboard layout is private to them", async () => {
  const { db, A } = await setup();
  await db.query("insert into public.memberships (business_id, user_id, role) values ($1, $2, 'editor')", [A, U.bob]);
  await as(db, U.alice, () => db.query(`select public.save_dashboard_layout($1, '[{"id":"website","hidden":false}]')`, [A]));
  await as(db, U.bob, () => db.query(`select public.save_dashboard_layout($1, '[{"id":"insights","hidden":true}]')`, [A]));
  const mine = await as(db, U.alice, () => rows<{ layout: { id: string }[] }>(db, "select layout from public.dashboard_layouts"));
  assert.equal(mine.length, 1);
  assert.equal(mine[0].layout[0].id, "website");
});

test("only published insights are visible, and members cannot write them", async () => {
  const { db } = await setup();
  await db.query("insert into public.insights (slug, title, published_at) values ('live-tip', 'A live tip', now() - interval '1 day'), ('draft-tip', 'A draft', null)");
  const seen = await as(db, U.alice, () => rows<{ slug: string }>(db, "select slug from public.insights"));
  assert.deepEqual(seen.map((r) => r.slug), ["live-tip"]);
  assert.match(await rejects(as(db, U.alice, () => db.query("insert into public.insights (slug, title) values ('x-x', 'Sneaky')"))), /permission denied/);
});
