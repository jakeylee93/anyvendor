import { test } from "node:test";
import assert from "node:assert/strict";
import { freshDb, addUser, as, one, rows, rejects, subscribe, U } from "./harness.ts";

async function setup() {
  const db = await freshDb();
  for (const id of [U.alice, U.bob, U.staff]) await addUser(db, id);
  await db.query("insert into public.staff_members (user_id) values ($1)", [U.staff]);
  const A = (await as(db, U.alice, () => one<{ id: string }>(db, "select public.create_business('Alice Bars', 'alice-bars') as id"))).id;
  await subscribe(db, A, "website");
  const create = (title = "New menu", body = "Please add the winter cocktails") =>
    as(db, U.alice, () => one<{ id: string }>(db, "select public.create_update_request($1, $2, $3) as id", [A, title, body])).then((r) => r.id);
  const move = (actor: string, id: string, to: string, extra: { note?: string; preview?: string; evidence?: string } = {}) =>
    as(db, actor, () =>
      db.query("select public.transition_update_request($1, $2::public.request_status, $3, $4, $5)", [
        id, to, extra.note ?? null, extra.preview ?? null, extra.evidence ?? null,
      ]),
    );
  const status = (id: string) => one<{ status: string }>(db, "select status from public.update_requests where id = $1", [id]).then((r) => r.status);
  return { db, A, create, move, status };
}

test("the 24-hour due time is set at submission and cannot be moved", async () => {
  const { db, create } = await setup();
  const id = await create();
  const r = await one<{ hours: number; ref: number; status: string }>(
    db,
    "select extract(epoch from (due_at - submitted_at)) / 3600 as hours, ref, status from public.update_requests where id = $1",
    [id],
  );
  assert.equal(Number(r.hours), 24);
  assert.equal(r.ref, 1);
  assert.equal(r.status, "received");
  assert.match(await rejects(db.query("update public.update_requests set due_at = due_at + interval '1 day' where id = $1", [id])), /immutable_request_fields/);
  assert.equal((await one<{ ref: number }>(db, "select ref from public.update_requests where id = $1", [await create("Second one")])).ref, 2);
});

test("customers cannot run the work; staff move it through the stages", async () => {
  const { create, move, status } = await setup();
  const id = await create();
  assert.match(await rejects(move(U.alice, id, "in_progress", { note: "go" })), /transition_not_allowed/);
  assert.match(await rejects(move(U.alice, id, "completed")), /transition_not_allowed/);
  await move(U.staff, id, "in_progress");
  assert.equal(await status(id), "in_progress");
});

test("ready to review needs a preview link; staff completion needs evidence", async () => {
  const { create, move, status } = await setup();
  const id = await create();
  await move(U.staff, id, "in_progress");
  assert.match(await rejects(move(U.staff, id, "ready_to_review")), /preview_required/);
  await move(U.staff, id, "ready_to_review", { preview: "https://preview.example.test/menu" });
  assert.match(await rejects(move(U.staff, id, "completed")), /completion_evidence_required/);
  await move(U.staff, id, "completed", { evidence: "Published winter menu, screenshot attached" });
  assert.equal(await status(id), "completed");
});

test("the customer approves a ready item, or asks for changes with a note", async () => {
  const { db, create, move, status } = await setup();
  const id = await create();
  await move(U.staff, id, "ready_to_review", { preview: "https://preview.example.test/a" });
  assert.match(await rejects(move(U.alice, id, "in_progress")), /note_required/);
  await move(U.alice, id, "in_progress", { note: "Make the prices bigger" });
  await move(U.staff, id, "ready_to_review");
  await move(U.alice, id, "completed");
  assert.equal(await status(id), "completed");
  const r = await one<{ completion_note: string; completed_by: string }>(db, "select completion_note, completed_by from public.update_requests where id = $1", [id]);
  assert.match(r.completion_note, /Approved by customer after reviewing https:\/\/preview\.example\.test\/a/);
  assert.equal(r.completed_by, U.alice);
});

test("asking for information needs a question; the customer's reply puts it back in progress", async () => {
  const { db, create, move, status } = await setup();
  const id = await create();
  assert.match(await rejects(move(U.staff, id, "needs_information")), /note_required/);
  await move(U.staff, id, "needs_information", { note: "Which photo should lead?" });
  await as(db, U.alice, () => db.query("select public.add_request_message($1, 'The bar at night one', false)", [id]));
  assert.equal(await status(id), "in_progress");
});

test("internal staff notes stay hidden from the customer", async () => {
  const { db, create } = await setup();
  const id = await create();
  await as(db, U.staff, () => db.query("select public.add_request_message($1, 'Needs a new section template', true)", [id]));
  await as(db, U.staff, () => db.query("select public.add_request_message($1, 'Working on it now', false)", [id]));
  const customer = await as(db, U.alice, () => rows<{ body: string }>(db, "select body from public.request_events where request_id = $1", [id]));
  assert.equal(customer.some((e) => e.body === "Needs a new section template"), false);
  assert.equal(customer.some((e) => e.body === "Working on it now"), true);
  const staff = await as(db, U.staff, () => rows(db, "select body from public.request_events where request_id = $1", [id]));
  assert.equal(staff.length, customer.length + 1);
  assert.match(await rejects(as(db, U.alice, () => db.query("select public.add_request_message($1, 'sneaky', true)", [id]))), /internal_notes_are_staff_only/);
});

test("larger features are flagged openly with a note, by staff only", async () => {
  const { db, create } = await setup();
  const id = await create("Online booking", "Can we take deposits on the site?");
  assert.match(await rejects(as(db, U.alice, () => db.query("select public.flag_request_scope($1, 'larger_feature', 'x')", [id]))), /staff_only/);
  assert.match(await rejects(as(db, U.staff, () => db.query("select public.flag_request_scope($1, 'larger_feature', '')", [id]))), /note_required/);
  await as(db, U.staff, () => db.query("select public.flag_request_scope($1, 'external_dependency', 'Needs a Stripe account from you')", [id]));
  const seen = await as(db, U.alice, () => rows<{ body: string }>(db, "select body from public.request_events where request_id = $1", [id]));
  assert.ok(seen.some((e) => /Waiting on an external dependency: Needs a Stripe account from you/.test(e.body)));
});

test("another business cannot read, message or move the request", async () => {
  const { db, create, move } = await setup();
  const id = await create();
  await as(db, U.bob, async () => {
    assert.equal((await rows(db, "select * from public.update_requests where id = $1", [id])).length, 0);
    assert.match(await rejects(db.query("select public.add_request_message($1, 'hi', false)", [id])), /not_member/);
  });
  assert.match(await rejects(move(U.bob, id, "completed")), /not_member/);
});

test("attachments must live under the request's own storage folder and be a safe type", async () => {
  const { db, A, create } = await setup();
  const id = await create();
  const ok = `${A}/${id}/a1-menu.pdf`;
  await as(db, U.alice, () => db.query("select public.add_request_attachment($1, $2, 'menu.pdf', 'application/pdf', 1000)", [id, ok]));
  assert.match(
    await rejects(as(db, U.alice, () => db.query("select public.add_request_attachment($1, $2, 'x.pdf', 'application/pdf', 10)", [id, `other/${id}/x.pdf`]))),
    /invalid_path/,
  );
  assert.match(
    await rejects(as(db, U.alice, () => db.query("select public.add_request_attachment($1, $2, 'x.html', 'text/html', 10)", [id, `${A}/${id}/x.html`]))),
    /unsupported_type/,
  );
});
