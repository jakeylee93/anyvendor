// Pure Stripe mapping used by the webhook. No network calls here.
import type { Interval, PlanCode } from "./plans";

// Kept as a literal so this module stays import-free at runtime (the webhook tests load it directly).
// tests/unit/logic.test.ts asserts it matches PLANS in plans.ts.
export const PLAN_CODES: readonly PlanCode[] = ["listing", "website", "marketing", "social", "ai"];
const isPlanCode = (v: unknown): v is PlanCode => typeof v === "string" && (PLAN_CODES as readonly string[]).includes(v);

/** Optional fixed Stripe price ids per plan (monthly), from STRIPE_PRICE_<PLAN> env vars. Lookup keys are the normal route. */
export type PriceIds = Partial<Record<PlanCode, string>>;

export function priceIdsFromEnv(env: Record<string, string | undefined>): PriceIds {
  const out: PriceIds = {};
  for (const code of PLAN_CODES) {
    const v = env[`STRIPE_PRICE_${code.toUpperCase()}`];
    if (v) out[code] = v;
  }
  return out;
}

/** Stripe lookup key for a plan and billing interval (VAT-inclusive, GBP). Annual prices are a proposal until approved. */
export function lookupKey(plan: PlanCode, interval: Interval = "month") {
  return `anyvendor_${plan}_${interval === "year" ? "annual" : "monthly"}`;
}

/** Monthly lookup keys, kept for callers that only know the plan. */
export const LOOKUP_KEYS: Record<PlanCode, string> = Object.fromEntries(PLAN_CODES.map((c) => [c, lookupKey(c)])) as Record<PlanCode, string>;

const KEY_RE = /^anyvendor_([a-z]+)_(monthly|annual)$/;

export function planFromLookupKey(lookupKey: string | null | undefined): { plan: PlanCode; interval: Interval } | null {
  const m = lookupKey ? KEY_RE.exec(lookupKey) : null;
  if (!m || !isPlanCode(m[1])) return null;
  return { plan: m[1], interval: m[2] === "annual" ? "year" : "month" };
}

export function planForPrice(priceId: string | null | undefined, prices: PriceIds, lookupKey?: string | null): PlanCode | null {
  if (priceId) for (const code of PLAN_CODES) if (prices[code] && prices[code] === priceId) return code;
  return planFromLookupKey(lookupKey)?.plan ?? null;
}

export function priceForPlan(plan: PlanCode, prices: PriceIds): string | null {
  return prices[plan] ?? null;
}

interface SubLike {
  id: string;
  customer: string | { id: string };
  status: string;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  livemode: boolean;
  items: { data: { price: { id: string; lookup_key?: string | null }; current_period_end?: number }[] };
}

export interface SubscriptionSnapshot {
  subscriptionId: string;
  customerId: string;
  priceId: string | null;
  plan: PlanCode | null;
  status: string;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  livemode: boolean;
  eventCreated: string;
}

const iso = (s: number | null | undefined) => (s ? new Date(s * 1000).toISOString() : null);

/** Snapshot of a subscription as of the event. In this API version the billing period lives on the item. */
export function snapshotFromSubscription(sub: SubLike, eventCreatedSeconds: number, prices: PriceIds): SubscriptionSnapshot {
  const item = sub.items?.data?.[0];
  const priceId = item?.price?.id ?? null;
  return {
    subscriptionId: sub.id,
    customerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    priceId,
    plan: planForPrice(priceId, prices, item?.price?.lookup_key ?? null),
    status: sub.status,
    periodEnd: iso(item?.current_period_end),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    canceledAt: iso(sub.canceled_at),
    livemode: sub.livemode,
    eventCreated: new Date(eventCreatedSeconds * 1000).toISOString(),
  };
}

export const SUBSCRIPTION_EVENTS = [
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
];
export const INVOICE_EVENTS = ["invoice.paid", "invoice.payment_failed", "invoice.payment_action_required"];
export const HANDLED_EVENTS = [...SUBSCRIPTION_EVENTS, ...INVOICE_EVENTS, "checkout.session.completed"];

/** Test-mode keys must never accept live events, and vice versa. */
export function modeMatches(secretKey: string, livemode: boolean) {
  return secretKey.startsWith("sk_live_") || secretKey.startsWith("rk_live_") ? livemode : !livemode;
}

// ------------------------------------------------------------------ webhook handling
// The webhook never trusts metadata to decide which business a payment belongs to:
// the customer id must already be mapped to a business (we create that mapping when
// the owner starts checkout). Subscription state is always re-read from Stripe so a
// late or reordered event cannot roll access backwards.

export interface MinimalEvent {
  id: string;
  type: string;
  created: number;
  livemode: boolean;
  data: { object: Record<string, unknown> };
}

export interface WebhookDeps {
  prices: PriceIds;
  retrieveSubscription: (id: string) => Promise<SubLike>;
  businessForCustomer: (customerId: string) => Promise<string | null>;
  applySnapshot: (businessId: string, snap: SubscriptionSnapshot) => Promise<"applied" | "stale">;
  now?: () => number;
}

export type WebhookOutcome = { status: "processed" | "ignored"; reason: string };

function subscriptionIdOf(event: MinimalEvent): string | null {
  const o = event.data.object as Record<string, unknown>;
  if (event.type.startsWith("customer.subscription.")) return typeof o.id === "string" ? o.id : null;
  if (event.type.startsWith("checkout.session.")) return o.mode === "subscription" && typeof o.subscription === "string" ? o.subscription : null;
  if (event.type.startsWith("invoice.")) {
    const parent = o.parent as { subscription_details?: { subscription?: string } } | undefined;
    const legacy = o.subscription;
    return parent?.subscription_details?.subscription ?? (typeof legacy === "string" ? legacy : null);
  }
  return null;
}

export const ASYNC_CHECKOUT_EVENTS = ["checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed"];

export async function handleStripeEvent(event: MinimalEvent, deps: WebhookDeps): Promise<WebhookOutcome> {
  if (![...HANDLED_EVENTS, ...ASYNC_CHECKOUT_EVENTS].includes(event.type)) return { status: "ignored", reason: "unhandled_type" };
  const subId = subscriptionIdOf(event);
  if (!subId) return { status: "ignored", reason: "no_subscription" };
  const sub = await deps.retrieveSubscription(subId);
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const businessId = await deps.businessForCustomer(customerId);
  if (!businessId) return { status: "ignored", reason: "unknown_customer" };
  // Fresh state from Stripe is "as of now", which is newer than any earlier event.
  const nowSeconds = Math.floor((deps.now ? deps.now() : Date.now()) / 1000);
  const snap = snapshotFromSubscription(sub, Math.max(event.created, nowSeconds), deps.prices);
  const r = await deps.applySnapshot(businessId, snap);
  return { status: "processed", reason: r };
}
