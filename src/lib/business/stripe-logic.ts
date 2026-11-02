// Pure Stripe mapping used by the webhook. No network calls here.
import type { PlanCode } from "./plans";

export interface PriceIds {
  website?: string;
  seo?: string;
  social?: string;
}

export function priceIdsFromEnv(env: Record<string, string | undefined>): PriceIds {
  return { website: env.STRIPE_PRICE_WEBSITE, seo: env.STRIPE_PRICE_SEO, social: env.STRIPE_PRICE_SOCIAL };
}

/** Stripe lookup keys for the three AnyVendor prices (VAT-inclusive, GBP, monthly). */
export const LOOKUP_KEYS: Record<PlanCode, string> = { website: "anyvendor_website_monthly", seo: "anyvendor_seo_monthly", social: "anyvendor_social_monthly" };

export function planForPrice(priceId: string | null | undefined, prices: PriceIds, lookupKey?: string | null): PlanCode | null {
  if (priceId) for (const code of ["website", "seo", "social"] as const) if (prices[code] && prices[code] === priceId) return code;
  if (lookupKey) for (const code of ["website", "seo", "social"] as const) if (LOOKUP_KEYS[code] === lookupKey) return code;
  return null;
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
