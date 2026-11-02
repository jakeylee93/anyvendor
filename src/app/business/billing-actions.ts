"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { businessContext } from "@/lib/business/data";
import { anyvendorVatRate, resolvePrice, stripeClient } from "@/lib/business/stripe";
import { supabaseService } from "@/lib/supabase/server";
import { appUrl } from "@/lib/supabase/env";
import type { PlanCode } from "@/lib/business/plans";

async function ownerContext() {
  const ctx = await businessContext();
  if (ctx.mode !== "live" || !ctx.business) redirect("/business/account?demo=1");
  if (ctx.business.role !== "owner") redirect("/business/account?error=owner_only");
  return ctx as typeof ctx & { business: NonNullable<typeof ctx.business> };
}

async function customerFor(ctx: Awaited<ReturnType<typeof ownerContext>>) {
  const stripe = stripeClient();
  const db = supabaseService();
  if (!stripe || !db) return null;
  const existing = await db.from("billing_customers").select("stripe_customer_id").eq("business_id", ctx.business.id).maybeSingle();
  if (existing.data) return existing.data.stripe_customer_id as string;
  const customer = await stripe.customers.create(
    { name: ctx.business.name, email: ctx.email ?? undefined, metadata: { business_id: ctx.business.id } },
    { idempotencyKey: `av-customer-${ctx.business.id}` },
  );
  const { error } = await db.from("billing_customers").insert({ business_id: ctx.business.id, stripe_customer_id: customer.id, livemode: customer.livemode });
  if (error) {
    const again = await db.from("billing_customers").select("stripe_customer_id").eq("business_id", ctx.business.id).maybeSingle();
    return (again.data?.stripe_customer_id as string) ?? null;
  }
  return customer.id;
}

export async function startCheckout(form: FormData) {
  const ctx = await ownerContext();
  const plan = String(form.get("plan")) as PlanCode;
  const stripe = stripeClient();
  if (!stripe || !["website", "seo", "social"].includes(plan)) redirect("/business/account?error=billing_not_configured");
  const [price, vat] = await Promise.all([resolvePrice(stripe, plan), anyvendorVatRate(stripe)]);
  if (!price) redirect("/business/account?error=billing_not_configured");
  // One subscription per business: changes to an existing plan go through the billing portal.
  const { data: subs } = await ctx.sb.from("subscriptions").select("status").eq("business_id", ctx.business.id).in("status", ["active", "trialing", "past_due", "incomplete"]);
  if (subs && subs.length) redirect("/business/account?error=already_subscribed");
  const customer = await customerFor(ctx);
  if (!customer) redirect("/business/account?error=billing_not_configured");
  const origin = appUrl((await headers()).get("origin") ?? undefined);
  const minute = Math.floor(Date.now() / 60000);
  const session = await stripe.checkout.sessions.create(
    {
      mode: "subscription",
      customer,
      client_reference_id: ctx.business.id,
      line_items: [{ price, quantity: 1 }],
      metadata: { business_id: ctx.business.id, plan },
      subscription_data: { metadata: { business_id: ctx.business.id, plan }, ...(vat ? { default_tax_rates: [vat] } : {}) },
      success_url: `${origin}/business/account?checkout=returned`,
      cancel_url: `${origin}/business/account?checkout=cancelled`,
    },
    { idempotencyKey: `av-checkout-${ctx.business.id}-${plan}-${minute}` },
  );
  if (!session.url) redirect("/business/account?error=checkout_failed");
  redirect(session.url);
}

export async function openPortal() {
  const ctx = await ownerContext();
  const stripe = stripeClient();
  const db = supabaseService();
  if (!stripe || !db) redirect("/business/account?error=billing_not_configured");
  const { data } = await db.from("billing_customers").select("stripe_customer_id").eq("business_id", ctx.business.id).maybeSingle();
  if (!data) redirect("/business/account?error=no_billing_yet");
  const origin = appUrl((await headers()).get("origin") ?? undefined);
  const portal = await stripe.billingPortal.sessions.create({ customer: data.stripe_customer_id as string, return_url: `${origin}/business/account` });
  redirect(portal.url);
}
