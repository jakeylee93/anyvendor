"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const LISTING = [
  "Premium profile page with video showreel",
  "Collectible directory card with your logo",
  "Photo gallery, services, FAQs and events",
  "Found by smart search across the UK",
  "Receive enquiries from event planners",
];

const WEBSITE = [
  "Everything in Listing",
  "A professionally designed website for your business",
  "Unlimited updates, whenever you need them",
  "Hosting included",
  "Full access to the Anyvendor directory",
];

export default function PricingPlans() {
  const [yearly, setYearly] = useState(false);

  return (
    <div>
      <div className="flex justify-center">
        <div role="radiogroup" aria-label="Billing period" className="inline-flex items-center gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-gray-200">
          {[
            { v: false, label: "Monthly" },
            { v: true, label: "Yearly" },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              role="radio"
              aria-checked={yearly === o.v}
              onClick={() => setYearly(o.v)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${yearly === o.v ? "bg-be-navy text-white" : "text-be-navy hover:bg-be-mist"}`}
            >
              {o.label}
            </button>
          ))}
          <span className="ml-1 mr-2 rounded-full bg-be-amber/90 px-2.5 py-1 text-[11px] font-bold text-be-navy">Listing: save £20 a year</span>
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2">
        <article className="flex flex-col rounded-3xl bg-white p-7 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-xl font-bold text-be-navy">Listing</h2>
          <p className="mt-1 text-sm text-be-grey">Get discovered and start receiving enquiries.</p>
          <p className="mt-6 flex items-baseline gap-1.5">
            <span className="text-5xl font-bold tracking-tight text-be-navy">{yearly ? "£100" : "£10"}</span>
            <span className="text-be-grey">{yearly ? "/ year" : "/ month"}</span>
          </p>
          <p className="mt-1 text-xs text-be-grey">{yearly ? "Equivalent to £8.33 a month" : "or £100 a year"}</p>
          <ul className="mt-6 space-y-3 text-[15px] text-gray-700">
            {LISTING.map((f) => (
              <li key={f} className="flex gap-2.5">
                <Check size={18} className="mt-0.5 shrink-0 text-be-cyan" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
          <button type="button" disabled className="mt-8 rounded-full border-2 border-be-navy px-6 py-3 font-semibold text-be-navy disabled:cursor-not-allowed disabled:opacity-60">
            Start listing
          </button>
        </article>

        <article className="relative flex flex-col rounded-3xl bg-be-navy p-7 text-white shadow-xl ring-2 ring-be-cyan">
          <span className="absolute -top-3 left-7 rounded-full bg-be-cyan px-3 py-1 text-xs font-bold text-be-navy">Most popular</span>
          <h2 className="text-xl font-bold">Website+</h2>
          <p className="mt-1 text-sm text-white/70">Your listing plus a website we design and look after.</p>
          <p className="mt-6 flex items-baseline gap-1.5">
            <span className="text-5xl font-bold tracking-tight">£50</span>
            <span className="text-white/70">/ month</span>
          </p>
          <p className="mt-1 text-xs text-white/60">{yearly ? "Billed monthly" : "Includes your directory listing"}</p>
          <ul className="mt-6 space-y-3 text-[15px] text-white/85">
            {WEBSITE.map((f) => (
              <li key={f} className="flex gap-2.5">
                <Check size={18} className="mt-0.5 shrink-0 text-be-cyan" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
          <button type="button" disabled className="mt-8 rounded-full bg-be-amber px-6 py-3 font-semibold text-be-navy disabled:cursor-not-allowed disabled:opacity-70">
            Get Website+
          </button>
        </article>
      </div>
      <p className="mt-6 text-center text-sm text-be-grey">
        Sign-ups and payments are not open yet in this testing preview. More tiers, including featured placement, are on the way.
      </p>
    </div>
  );
}
