"use server";

import { redirect } from "next/navigation";
import { businessContext } from "@/lib/business/data";
import { PLANS } from "@/lib/business/plans";
import { anyvendorVatRate, stripeClient, stripeKey } from "@/lib/business/stripe";
import { lookupKey } from "@/lib/business/stripe-logic";

// Staff-only, TEST MODE ONLY: creates the three VAT-inclusive AnyVendor prices and the inclusive
// 20% VAT rate in the connected Stripe account if they don't exist yet. Idempotent by lookup key.
export async function setUpTestPrices() {
  const ctx = await businessContext();
  if (ctx.mode !== "live" || !ctx.staff) redirect("/staff/billing?error=staff_only");
  const stripe = stripeClient();
  if (!stripe || !stripeKey()?.startsWith("sk_test_")) redirect("/staff/billing?error=test_mode_only");
  for (const plan of PLANS) {
    let productId: string | null = null;
    for (const interval of ["month", "year"] as const) {
      const key = lookupKey(plan.code, interval);
      const existing = await stripe.prices.list({ lookup_keys: [key], limit: 1 });
      if (existing.data.length) {
        productId = typeof existing.data[0].product === "string" ? existing.data[0].product : existing.data[0].product.id;
        continue;
      }
      productId ??= (await stripe.products.create({ name: `AnyVendor ${plan.name}`, metadata: { app: "anyvendor", plan: plan.code } }, { idempotencyKey: `av-product-v2-${plan.code}` })).id;
      await stripe.prices.create(
        {
          product: productId,
          currency: "gbp",
          unit_amount: interval === "year" ? plan.annualPence : plan.monthlyPence,
          recurring: { interval },
          tax_behavior: "inclusive",
          lookup_key: key,
          metadata: { app: "anyvendor", plan: plan.code, interval, ...(interval === "year" ? { proposal: "two months free; not approved for sale" } : {}) },
        },
        { idempotencyKey: `av-price-v2-${plan.code}-${interval}` },
      );
    }
  }
  if (!(await anyvendorVatRate(stripe))) {
    await stripe.taxRates.create({ display_name: "VAT", percentage: 20, inclusive: true, country: "GB", jurisdiction: "GB", description: "UK VAT (included in AnyVendor prices)", metadata: { app: "anyvendor" } }, { idempotencyKey: "av-vat-20-inclusive" });
  }
  redirect("/staff/billing?ok=1");
}
