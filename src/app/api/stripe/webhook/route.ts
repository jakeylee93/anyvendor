import { NextResponse } from "next/server";
import { stripeClient, stripeKey } from "@/lib/business/stripe";
import { handleStripeEvent, modeMatches, priceIdsFromEnv, type MinimalEvent } from "@/lib/business/stripe-logic";
import { supabaseService } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Signed, idempotent Stripe webhook. Paid access is only ever granted from here.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = stripeClient();
  const db = supabaseService();
  if (!secret || !stripe || !db) return NextResponse.json({ error: "billing_not_configured" }, { status: 503 });

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  let event: MinimalEvent;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret) as unknown as MinimalEvent;
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const claim = await db.rpc("claim_stripe_event", {
    p_id: event.id,
    p_type: event.type,
    p_livemode: event.livemode,
    p_created: new Date(event.created * 1000).toISOString(),
  });
  if (claim.error) return NextResponse.json({ error: "ledger_unavailable" }, { status: 500 });
  if (claim.data === "duplicate") return NextResponse.json({ received: true, duplicate: true });
  if (claim.data === "in_flight") return NextResponse.json({ error: "in_flight" }, { status: 409 });

  if (!modeMatches(stripeKey()!, event.livemode)) {
    await db.rpc("finish_stripe_event", { p_id: event.id, p_status: "ignored", p_error: "mode_mismatch" });
    return NextResponse.json({ received: true, ignored: "mode_mismatch" });
  }

  try {
    const outcome = await handleStripeEvent(event, {
      prices: priceIdsFromEnv(process.env),
      retrieveSubscription: async (id) => (await stripe.subscriptions.retrieve(id)) as never,
      businessForCustomer: async (customer) => {
        const { data } = await db.from("billing_customers").select("business_id").eq("stripe_customer_id", customer).maybeSingle();
        return data?.business_id ?? null;
      },
      applySnapshot: async (business, s) => {
        const { data, error } = await db.rpc("upsert_subscription", {
          p_business: business,
          p_subscription: s.subscriptionId,
          p_customer: s.customerId,
          p_plan: s.plan,
          p_price: s.priceId,
          p_status: s.status,
          p_period_end: s.periodEnd,
          p_cancel_at_period_end: s.cancelAtPeriodEnd,
          p_canceled_at: s.canceledAt,
          p_livemode: s.livemode,
          p_event_created: s.eventCreated,
        });
        if (error) throw new Error(error.message);
        return data as "applied" | "stale";
      },
    });
    await db.rpc("finish_stripe_event", { p_id: event.id, p_status: outcome.status, p_error: outcome.status === "ignored" ? outcome.reason : null });
    return NextResponse.json({ received: true, ...outcome });
  } catch (e) {
    await db.rpc("finish_stripe_event", { p_id: event.id, p_status: "failed", p_error: (e as Error).message.slice(0, 500) });
    return NextResponse.json({ error: "processing_failed" }, { status: 500 });
  }
}
