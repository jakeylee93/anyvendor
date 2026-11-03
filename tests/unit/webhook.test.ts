import { test } from "node:test";
import assert from "node:assert/strict";
import { handleStripeEvent, type MinimalEvent, type SubscriptionSnapshot } from "../../src/lib/business/stripe-logic.ts";

const prices = { website: "price_w", marketing: "price_s", social: "price_x" };
const sub = (status: string, price = "price_s") => ({
  id: "sub_1", customer: "cus_1", status, cancel_at_period_end: false, canceled_at: null, livemode: false,
  items: { data: [{ price: { id: price }, current_period_end: 1767225600 }] },
});
const ev = (type: string, object: Record<string, unknown>, created = 1762000000): MinimalEvent => ({ id: "evt", type, created, livemode: false, data: { object } });

function deps(state: { status: string; price?: string }, mapped: string | null = "biz_1") {
  const applied: { business: string; snap: SubscriptionSnapshot }[] = [];
  return {
    applied,
    d: {
      prices,
      now: () => 1762000100_000,
      retrieveSubscription: async () => sub(state.status, state.price),
      businessForCustomer: async () => mapped,
      applySnapshot: async (business: string, snap: SubscriptionSnapshot) => (applied.push({ business, snap }), "applied" as const),
    },
  };
}

test("checkout completion re-reads the subscription from Stripe; the success URL grants nothing", async () => {
  const { d, applied } = deps({ status: "active" });
  const r = await handleStripeEvent(ev("checkout.session.completed", { mode: "subscription", subscription: "sub_1" }), d);
  assert.equal(r.status, "processed");
  assert.equal(applied[0].business, "biz_1");
  assert.equal(applied[0].snap.plan, "marketing");
  assert.equal(applied[0].snap.status, "active");
});

test("a payment failure records past_due from Stripe's current state", async () => {
  const { d, applied } = deps({ status: "past_due" });
  await handleStripeEvent(ev("invoice.payment_failed", { parent: { subscription_details: { subscription: "sub_1" } } }), d);
  assert.equal(applied[0].snap.status, "past_due");
});

test("cancellation and delayed (async) payments are applied from fresh state", async () => {
  for (const [type, status] of [["customer.subscription.deleted", "canceled"], ["checkout.session.async_payment_failed", "incomplete_expired"]]) {
    const { d, applied } = deps({ status });
    const obj = type.startsWith("checkout") ? { mode: "subscription", subscription: "sub_1" } : { id: "sub_1" };
    await handleStripeEvent(ev(type, obj), d);
    assert.equal(applied[0].snap.status, status);
  }
});

test("customers we never mapped to a business are ignored, whatever their metadata says", async () => {
  const { d, applied } = deps({ status: "active" }, null);
  const r = await handleStripeEvent(ev("customer.subscription.updated", { id: "sub_1", metadata: { business_id: "victim" } }), d);
  assert.deepEqual(r, { status: "ignored", reason: "unknown_customer" });
  assert.equal(applied.length, 0);
});

test("unrelated events and one-off checkouts are ignored", async () => {
  const { d } = deps({ status: "active" });
  assert.equal((await handleStripeEvent(ev("charge.refunded", {}), d)).reason, "unhandled_type");
  assert.equal((await handleStripeEvent(ev("checkout.session.completed", { mode: "payment" }), d)).reason, "no_subscription");
});

test("an unknown price records no plan, so no paid modules are granted", async () => {
  const { d, applied } = deps({ status: "active", price: "price_someone_elses" });
  await handleStripeEvent(ev("customer.subscription.created", { id: "sub_1" }), d);
  assert.equal(applied[0].snap.plan, null);
});

test("plans are also recognised by AnyVendor lookup keys, so prices created in the Bar People account map correctly", async () => {
  const { planForPrice, snapshotFromSubscription } = await import("../../src/lib/business/stripe-logic.ts");
  assert.equal(planForPrice("price_new", {}, "anyvendor_social_monthly"), "social");
  assert.equal(planForPrice("price_new", {}, "someone_else"), null);
  const snap = snapshotFromSubscription(
    { id: "s", customer: "c", status: "active", cancel_at_period_end: false, canceled_at: null, livemode: false, items: { data: [{ price: { id: "price_new", lookup_key: "anyvendor_marketing_monthly" } }] } },
    1762000000,
    {},
  );
  assert.equal(snap.plan, "marketing");
});
