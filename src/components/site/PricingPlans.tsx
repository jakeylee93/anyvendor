"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { ANNUAL_PROPOSAL_NOTE, PLANS, PLAN_TERMS_NOTE, gbp, monthlyEquivalent, type Interval, type PlanCode } from "@/lib/business/plans";

const CTA: Partial<Record<PlanCode, string>> = { listing: "Start listing", website: "Get a website" };

/** Links a plan choice into onboarding with the plan and interval carried through sign-in. */
export function planHref(plan: PlanCode, interval: Interval) {
  return `/business/start?plan=${plan}&interval=${interval}`;
}

export default function PricingPlans({ compact = false }: { compact?: boolean }) {
  const [interval, setInterval] = useState<Interval>("month");
  const yearly = interval === "year";

  return (
    <div>
      <div className="flex flex-col items-center gap-2">
        <div role="radiogroup" aria-label="Billing period" className="inline-flex items-center gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-gray-200">
          {([["month", "Monthly"], ["year", "Annual · 2 months free"]] as const).map(([v, label]) => (
            <button key={v} type="button" role="radio" aria-checked={interval === v} onClick={() => setInterval(v)} className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${interval === v ? "bg-be-navy text-white" : "text-be-navy hover:bg-be-mist"}`}>
              {label}
            </button>
          ))}
        </div>
        {yearly && <p className="text-xs font-semibold text-be-grey">{ANNUAL_PROPOSAL_NOTE}</p>}
      </div>

      <div className={`mx-auto mt-10 grid gap-5 ${compact ? "max-w-5xl md:grid-cols-2" : "max-w-7xl md:grid-cols-2 xl:grid-cols-5"}`}>
        {(compact ? PLANS.slice(0, 2) : PLANS).map((p) => {
          const dark = p.popular;
          return (
            <article key={p.code} className={`relative flex flex-col rounded-3xl p-6 ${dark ? "bg-be-navy text-white shadow-xl ring-2 ring-be-cyan" : "bg-white text-be-navy shadow-sm ring-1 ring-gray-200"}`}>
              {p.popular && <span className="absolute -top-3 left-6 rounded-full bg-be-cyan px-3 py-1 text-xs font-bold text-be-navy">Most popular</span>}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <p className={`mt-1 text-sm ${dark ? "text-white/70" : "text-be-grey"}`}>{p.summary}</p>
              <p className="mt-5 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold tracking-tight">{yearly ? gbp(p.annualPence) : gbp(p.monthlyPence)}</span>
                <span className={dark ? "text-white/70" : "text-be-grey"}>{yearly ? "/ year" : "/ month"}</span>
              </p>
              <p className={`mt-1 text-xs ${dark ? "text-white/60" : "text-be-grey"}`}>{yearly ? `Equivalent to ${monthlyEquivalent(p)} a month, proposed` : `or ${gbp(p.annualPence)} a year (proposed)`}</p>
              <ul className={`mt-5 space-y-2.5 text-sm ${dark ? "text-white/85" : "text-gray-700"}`}>
                {p.adds.map((f) => (
                  <li key={f} className="flex gap-2.5"><Check size={17} className="mt-0.5 shrink-0 text-be-cyan" aria-hidden />{f}</li>
                ))}
              </ul>
              {p.notes?.map((n) => <p key={n} className={`mt-3 text-xs ${dark ? "text-white/60" : "text-be-grey"}`}>{n}</p>)}
              <Link href={planHref(p.code, interval)} className={`mt-6 inline-flex items-center justify-center rounded-full px-6 py-3 font-semibold ${dark ? "bg-be-amber text-be-navy" : p.code === "listing" ? "bg-be-cyan text-be-navy" : "border-2 border-be-navy text-be-navy hover:bg-be-mist"}`}>
                {CTA[p.code] ?? "Choose plan"}
              </Link>
            </article>
          );
        })}
      </div>
      <p className="mt-6 text-center text-sm text-be-grey">{PLAN_TERMS_NOTE}</p>
      {compact && <p className="mt-2 text-center text-sm"><Link href="/pricing" className="font-semibold text-be-navy underline decoration-be-cyan decoration-2 underline-offset-4">See all five plans, including Marketing Plus, Social Media Plus and AI Plus</Link></p>}
    </div>
  );
}
