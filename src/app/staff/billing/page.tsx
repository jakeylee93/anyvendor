import type { Metadata } from "next";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Card, Notice, submitCls } from "@/components/business/ui";
import { businessContext } from "@/lib/business/data";
import { PLANS, SELLER } from "@/lib/business/plans";
import { anyvendorVatRate, resolvePrice, stripeClient, stripeKey } from "@/lib/business/stripe";
import { setUpTestPrices } from "./actions";

export const metadata: Metadata = { title: "Billing setup — AnyVendor staff", robots: { index: false, follow: false } };
type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function StaffBilling({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await businessContext();
  const wrap = (body: React.ReactNode) => <main className="min-h-screen bg-be-mist px-4 py-6"><div className="mx-auto max-w-2xl space-y-4"><Link href="/staff" className="text-sm font-semibold text-be-navy">← Queue</Link><h1 className="text-2xl font-bold text-be-navy">Billing setup</h1>{body}</div></main>;
  if (ctx.mode !== "live" || !ctx.staff) return wrap(<Notice tone="danger">This page is for the AnyVendor team.</Notice>);
  const stripe = stripeClient();
  const key = stripeKey();
  if (!stripe || !key) return wrap(<Notice tone="warning">No Stripe key is set. Add the {SELLER} test-mode secret key as STRIPE_SECRET_KEY in Vercel (Preview).</Notice>);
  const mode = key.startsWith("sk_test_") ? "test" : key.startsWith("sk_live_") ? "live" : "unknown";
  const [prices, vat] = await Promise.all([Promise.all(PLANS.map((p) => resolvePrice(stripe, p.code).catch(() => null))), anyvendorVatRate(stripe).catch(() => null)]);
  const row = (ok: boolean, text: string) => <li className="flex items-center gap-2 text-sm">{ok ? <Check size={16} className="text-emerald-600" /> : <X size={16} className="text-rose-600" />}{text}</li>;
  return wrap(
    <>
      {sp.ok && <Notice tone="success">Test prices and the VAT rate are in place.</Notice>}
      {sp.error && <Notice tone="danger">{sp.error === "test_mode_only" ? "Automatic setup only runs with a test-mode key." : "Not allowed."}</Notice>}
      <Card>
        <p className="text-sm text-be-navy">Stripe key mode: <strong>{mode}</strong> · seller {SELLER}</p>
        <ul className="mt-3 space-y-1.5">
          {PLANS.map((p, i) => row(Boolean(prices[i]), `${p.name} ${p.priceLabel} a month inc. VAT`))}
          {row(Boolean(vat), "Inclusive 20% UK VAT rate on invoices")}
          {row(Boolean(process.env.STRIPE_WEBHOOK_SECRET), "Webhook signing secret set")}
        </ul>
        {mode === "test" && (prices.some((p) => !p) || !vat) && (
          <form action={setUpTestPrices} className="mt-4"><button className={submitCls}>Create AnyVendor test prices</button></form>
        )}
        {mode === "live" && <p className="mt-3 text-sm text-amber-800">Live mode: create products in the Stripe dashboard deliberately; this page never creates live objects.</p>}
      </Card>
    </>,
  );
}
