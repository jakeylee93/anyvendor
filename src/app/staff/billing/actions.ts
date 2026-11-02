"use server";

import { redirect } from "next/navigation";
import { businessContext } from "@/lib/business/data";
import { PLANS } from "@/lib/business/plans";
import { anyvendorVatRate, stripeClient, stripeKey } from "@/lib/business/stripe";
import { LOOKUP_KEYS } from "@/lib/business/stripe-logic";

// Staff-only, TEST MODE ONLY: creates the three VAT-inclusive AnyVendor prices and the inclusive
// 20% VAT rate in the connected Stripe account if they don't exist yet. Idempotent by lookup key.
export async function setUpTestPrices() {
  const ctx = await businessContext();
  if (ctx.mode !== "live" || !ctx.staff) redirect("/staff/billing?error=staff_only");
  const stripe = stripeClient();
  if (!stripe || !stripeKey()?.startsWith("sk_test_")) redirect("/staff/billing?error=test_mode_only");
  for (const plan of PLANS) {
    const existing = await stripe.prices.list({ lookup_keys: [LOOKUP_KEYS[plan.code]], limit: 1 });
    if (existing.data.length) continue;
    const product = await stripe.products.create({ name: `AnyVendor ${plan.name}`, metadata: { app: "anyvendor", plan: plan.code } }, { idempotencyKey: `av-product-${plan.code}` });
    await stripe.prices.create(
      { product: product.id, currency: "gbp", unit_amount: plan.pricePence, recurring: { interval: "month" }, tax_behavior: "inclusive", lookup_key: LOOKUP_KEYS[plan.code], metadata: { app: "anyvendor", plan: plan.code } },
      { idempotencyKey: `av-price-${plan.code}` },
    );
  }
  if (!(await anyvendorVatRate(stripe))) {
    await stripe.taxRates.create({ display_name: "VAT", percentage: 20, inclusive: true, country: "GB", jurisdiction: "GB", description: "UK VAT (included in AnyVendor prices)", metadata: { app: "anyvendor" } }, { idempotencyKey: "av-vat-20-inclusive" });
  }
  redirect("/staff/billing?ok=1");
}
