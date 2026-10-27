import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";
import { SupplierCta } from "@/components/site/SiteFooter";
import BusinessCard from "@/components/site/BusinessCard";
import DirectorySearch from "@/components/site/DirectorySearch";
import { BUSINESSES, filterBusinesses, industryName, type Filters } from "@/lib/directory";
import { understand, smartMatch } from "@/lib/smartSearch";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = { title: "Directory — Anyvendor" };

type SP = Promise<{ [key: string]: string | string[] | undefined }>;

function one(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v) || undefined;
}

export default async function DirectoryPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const filters: Filters = {
    industry: one(sp.industry),
    category: one(sp.category),
    location: one(sp.location),
    event: one(sp.event),
    q: one(sp.q),
    ask: one(sp.ask),
  };
  // Plain-English request first (ranked), then any explicit filters narrow it.
  const ask = filters.ask?.trim();
  const u = ask ? understand(ask) : null;
  const base = u ? smartMatch({ ...u, place: filters.location ? null : u.place, event: filters.event ? null : u.event }) : BUSINESSES;
  const narrowed = filterBusinesses({ ...filters, ask: undefined });
  const results = base.filter((b) => narrowed.includes(b));
  const chips = u
    ? ([
        ...u.services.map((s) => s.label),
        u.place,
        u.event,
        u.guests ? `${u.guests} guests` : null,
        u.date,
        u.time,
      ].filter(Boolean) as string[])
    : [];
  const active = [
    filters.industry && industryName(filters.industry),
    filters.category,
    filters.location,
    filters.event,
    filters.q && `“${filters.q}”`,
    ask && `“${ask}”`,
  ].filter(Boolean) as string[];

  return (
    <SiteShell>
      <section className="bg-be-mist">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <h1 className="text-3xl font-bold text-be-navy md:text-5xl">Directory</h1>
          <p className="mt-2 text-be-grey">Unforgettable Events Begin with Unstoppable Vendors – Start Searching!</p>
          <div className="mt-6">
            <DirectorySearch initial={filters} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10" aria-live="polite">
        {u && (
          <div className="mb-6 rounded-2xl bg-be-cyan-pale px-4 py-3 text-sm text-be-navy">
            <p className="flex flex-wrap items-center gap-2">
              <Sparkles size={16} className="text-be-cyan" aria-hidden />
              <span className="font-semibold">We understood:</span>
              {chips.length ? (
                chips.map((c) => (
                  <span key={c} className="rounded-full bg-white px-3 py-1 text-xs font-medium ring-1 ring-be-cyan/40">
                    {c}
                  </span>
                ))
              ) : (
                <span>nothing specific yet. Try a service, place or event, e.g. “DJ for a wedding in Essex”.</span>
              )}
            </p>
            {(u.date || u.time || u.guests) && (
              <p className="mt-1.5 text-xs text-be-grey">
                Date, time and guest numbers are passed on when you enquire; availability is confirmed by each business.
              </p>
            )}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-be-navy">
            <strong>{results.length}</strong> of {BUSINESSES.length} businesses
            {active.length > 0 && <span className="text-be-grey"> · {active.join(" · ")}</span>}
          </p>
          {active.length > 0 && (
            <Link href="/directory" className="text-sm font-semibold text-be-navy underline decoration-be-cyan decoration-2 underline-offset-4">
              Clear filters
            </Link>
          )}
        </div>

        {results.length > 0 ? (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((b) => (
              <li key={b.slug}>
                <BusinessCard business={b} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-10 text-center">
            <h2 className="text-lg font-semibold text-be-navy">No businesses match these filters yet</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-be-grey">
              {filters.event
                ? "Type of Event only matches businesses whose own website or social channels say they cover that kind of event. Try another event type or view every business."
                : "Try a different industry or location, or view every business."}
            </p>
            <Link href="/directory" className="mt-5 inline-flex rounded-full bg-be-cyan px-5 py-2.5 text-sm font-semibold text-be-navy">
              View all businesses
            </Link>
          </div>
        )}
        <p className="mt-8 text-xs text-be-grey">
          Profiles are built from each business’s own public website and social channels (checked October 2026), starting from the Booked Events
          directory. Where a business publishes no current price, its card shows the 2025 Booked Events listing price, which may be out of date.
        </p>
      </section>
      <SupplierCta />
    </SiteShell>
  );
}
