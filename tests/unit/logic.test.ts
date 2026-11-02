import { test } from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";
import { accessFor, PLANS } from "../../src/lib/business/plans.ts";
import { canTransition, dueInfo } from "../../src/lib/business/requests.ts";
import { planForPrice, snapshotFromSubscription, modeMatches } from "../../src/lib/business/stripe-logic.ts";
import { encryptToken, decryptToken, signState, verifyState } from "../../src/lib/security/tokens.ts";

const prices = { website: "price_w", seo: "price_s", social: "price_x" };

test("plans are £50, £75 and £100 and each includes the one below", () => {
  assert.deepEqual(PLANS.map((p) => p.pricePence), [5000, 7500, 10000]);
  for (let i = 1; i < PLANS.length; i++) for (const m of PLANS[i - 1].modules) assert.ok(PLANS[i].modules.includes(m));
});

test("access mirrors the database: past_due keeps access with a warning, canceled removes it", () => {
  const row = (plan: "website" | "seo" | "social", status: string, updated = "2026-11-01") =>
    ({ plan, status, current_period_end: "2026-12-01T00:00:00Z", cancel_at_period_end: false, updated_at: updated });
  assert.deepEqual(accessFor([]).modules, []);
  assert.deepEqual(accessFor([row("seo", "active")]).modules, ["listing", "website", "requests", "seo"]);
  const pd = accessFor([row("website", "past_due")]);
  assert.equal(pd.plan, "website");
  assert.equal(pd.notice?.tone, "warning");
  const gone = accessFor([row("social", "canceled")]);
  assert.deepEqual([gone.plan, gone.modules.length, gone.notice?.tone], [null, 0, "danger"]);
  assert.equal(accessFor([row("social", "incomplete")]).modules.length, 0);
});

test("request moves match the database rules", () => {
  assert.equal(canTransition("customer", "received", "in_progress"), false);
  assert.equal(canTransition("customer", "ready_to_review", "completed"), true);
  assert.equal(canTransition("staff", "completed", "in_progress"), true);
  assert.equal(canTransition("staff", "completed", "received"), false);
});

test("due labels count from the original 24 hours", () => {
  const now = new Date("2026-11-02T12:00:00Z");
  assert.deepEqual(dueInfo("2026-11-02T17:00:00Z", "in_progress", null, now), { overdue: false, label: "Due in 5h" });
  assert.deepEqual(dueInfo("2026-11-02T10:00:00Z", "received", null, now), { overdue: true, label: "Overdue by 2h" });
  assert.equal(dueInfo("2026-11-02T10:00:00Z", "completed", "2026-11-02T09:00:00Z", now).label, "Completed within 24 hours");
});

test("subscription snapshots read the price and period from the item", () => {
  const snap = snapshotFromSubscription(
    {
      id: "sub_1", customer: "cus_1", status: "active", cancel_at_period_end: true, canceled_at: null, livemode: false,
      items: { data: [{ price: { id: "price_s" }, current_period_end: 1767225600 }] },
    },
    1762000000,
    prices,
  );
  assert.equal(snap.plan, "seo");
  assert.equal(snap.periodEnd, "2026-01-01T00:00:00.000Z");
  assert.equal(snap.cancelAtPeriodEnd, true);
  assert.equal(planForPrice("price_unknown", prices), null);
});

test("test-mode keys reject live events and live keys reject test events", () => {
  assert.equal(modeMatches("sk_test_x", false), true);
  assert.equal(modeMatches("sk_test_x", true), false);
  assert.equal(modeMatches("sk_live_x", false), false);
});

test("Stripe signatures: genuine payload verifies, tampered or wrong-secret payload is rejected", () => {
  const stripe = new Stripe("sk_test_dummy");
  const secret = "whsec_test_secret";
  const payload = JSON.stringify({ id: "evt_1", object: "event", type: "invoice.paid", data: { object: {} } });
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
  assert.equal(stripe.webhooks.constructEvent(payload, header, secret).id, "evt_1");
  assert.throws(() => stripe.webhooks.constructEvent(payload.replace("invoice.paid", "invoice.payment_failed"), header, secret));
  assert.throws(() => stripe.webhooks.constructEvent(payload, header, "whsec_other"));
  const old = stripe.webhooks.generateTestHeaderString({ payload, secret, timestamp: Math.floor(Date.now() / 1000) - 3600 });
  assert.throws(() => stripe.webhooks.constructEvent(payload, old, secret));
});

test("tokens are encrypted with authentication; tampering is detected", () => {
  const k = Buffer.alloc(32, 7).toString("base64");
  const sealed = encryptToken("li-access-token", k);
  assert.notEqual(sealed.includes("li-access-token"), true);
  assert.equal(decryptToken(sealed, k), "li-access-token");
  const parts = sealed.split(":");
  parts[3] = Buffer.from("tampered").toString("base64url");
  assert.throws(() => decryptToken(parts.join(":"), k));
});

test("OAuth state is signed, expires, and cannot be forged", () => {
  const s = signState({ businessId: "b1", userId: "u1", provider: "linkedin", exp: Date.now() + 60_000 }, "state-secret");
  assert.equal(verifyState(s, "state-secret")?.businessId, "b1");
  assert.equal(verifyState(s, "other-secret"), null);
  const [body, mac] = s.split(".");
  const forged = Buffer.from(JSON.stringify({ businessId: "b2", userId: "u1", provider: "linkedin", exp: Date.now() + 60_000 })).toString("base64url");
  assert.equal(verifyState(`${forged}.${mac}`, "state-secret"), null);
  assert.equal(verifyState(signState({ businessId: "b1", userId: "u1", provider: "x", exp: Date.now() - 1 }, "k"), "k"), null);
  assert.ok(body);
});
