import Stripe from "stripe";
import type { Interval, PlanCode } from "./plans";
import { lookupKey, priceIdsFromEnv } from "./stripe-logic";

export function stripeKey() {
  return process.env.STRIPE_SECRET_KEY ?? null;
}

export function stripeClient() {
  const key = stripeKey();
  return key ? new Stripe(key) : null;
}

export function billingReady() {
  return Boolean(stripeKey());
}


/** Price for a plan and interval: a fixed STRIPE_PRICE_* id wins for monthly, otherwise the AnyVendor lookup key. */
export async function resolvePrice(stripe: Stripe, plan: PlanCode, interval: Interval = "month") {
  const fixed = interval === "month" ? priceIdsFromEnv(process.env)[plan] : undefined;
  if (fixed) return fixed;
  const found = await stripe.prices.list({ lookup_keys: [lookupKey(plan, interval)], active: true, limit: 1 });
  return found.data[0]?.id ?? null;
}

/** The inclusive 20% UK VAT rate created for AnyVendor (so invoices show the VAT inside the price). */
export async function anyvendorVatRate(stripe: Stripe) {
  if (process.env.STRIPE_VAT_RATE_ID) return process.env.STRIPE_VAT_RATE_ID;
  const rates = await stripe.taxRates.list({ active: true, inclusive: true, limit: 100 });
  return rates.data.find((r) => r.metadata?.app === "anyvendor" && r.percentage === 20)?.id ?? null;
}
