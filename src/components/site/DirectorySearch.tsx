"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { INDUSTRIES, LOCATIONS, EVENT_TYPES, type Filters } from "@/lib/directory";

const field =
  "w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-be-navy focus:border-be-cyan focus:outline-none focus:ring-2 focus:ring-be-cyan/30";

/** Native GET form to /directory, so it works before hydration too. */
export default function DirectorySearch({ initial = {} }: { initial?: Filters }) {
  const [industry, setIndustry] = useState(initial.industry ?? "");
  const cats = INDUSTRIES.find((i) => i.slug === industry)?.categories ?? [];

  return (
    <form action="/directory" method="get" role="search" aria-label="Search businesses" className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 md:p-5">
      <label className="relative block">
        <span className="sr-only">What are you looking for?</span>
        <Sparkles size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-be-cyan" aria-hidden />
        <input
          name="ask"
          defaultValue={initial.ask ?? initial.q ?? ""}
          placeholder="What are you looking for? e.g. cocktail bar for 120 guests in Essex on 14 June"
          className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-4 text-[15px] text-be-navy placeholder:text-gray-400 focus:border-be-cyan focus:outline-none focus:ring-2 focus:ring-be-cyan/30"
        />
      </label>
      <p className="mb-3 mt-2 text-xs text-be-grey">Type anything — a service, place, event, date or guest numbers — or refine below.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <label className="grid gap-1 text-xs font-medium text-be-grey">
          Industry
          <select name="industry" className={field} value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="">All industries</option>
            {INDUSTRIES.map((i) => (
              <option key={i.slug} value={i.slug}>
                {i.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-medium text-be-grey">
          Category
          <select name="category" className={field} defaultValue={initial.category ?? ""} disabled={!industry} key={industry}>
            <option value="">{industry ? "All categories" : "Choose an industry first"}</option>
            {cats.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-medium text-be-grey">
          Location
          <select name="location" className={field} defaultValue={initial.location ?? ""}>
            <option value="">All locations</option>
            {LOCATIONS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-medium text-be-grey">
          Type of Event
          <select name="event" className={field} defaultValue={initial.event ?? ""}>
            <option value="">Any event</option>
            {EVENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 self-end rounded-lg bg-be-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-be-deep"
        >
          <Search size={16} aria-hidden /> Search
        </button>
      </div>
    </form>
  );
}
