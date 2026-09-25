import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, CalendarDays, Tag, Info } from "lucide-react";
import SiteShell from "@/components/site/SiteShell";
import BusinessCard, { Monogram, locationLabel } from "@/components/site/BusinessCard";
import { BUSINESSES, getBusiness, categoriesOf, industryOf, industryName } from "@/lib/directory";

export const dynamicParams = false;

export function generateStaticParams() {
  return BUSINESSES.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const b = getBusiness((await params).slug);
  return { title: b ? `${b.name} — Anyvendor` : "Business not found — Anyvendor" };
}

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const b = getBusiness((await params).slug);
  if (!b) notFound();

  const cats = categoriesOf(b);
  const industry = industryOf(b);
  const related = BUSINESSES.filter((x) => x.slug !== b.slug && industry && industryOf(x) === industry).slice(0, 4);

  return (
    <SiteShell>
      <div className="bg-be-mist">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href="/directory" className="inline-flex items-center gap-1.5 text-sm font-medium text-be-navy hover:text-be-cyan">
            <ArrowLeft size={16} aria-hidden /> Back to Directory
          </Link>
        </div>
      </div>

      <article className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1.1fr_1fr]">
        <Monogram business={b} className="aspect-4/3 w-full rounded-2xl" />

        <div>
          {industry && (
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-be-cyan">
              {industryName(industry)}
              {!b.listedCategories.length && <span className="ml-2 font-medium normal-case tracking-normal text-be-grey">(unconfirmed)</span>}
            </p>
          )}
          <h1 className="mt-2 text-3xl font-bold text-be-navy md:text-5xl">{b.name}</h1>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex gap-3">
              <dt className="flex items-center gap-2 text-be-grey">
                <CalendarDays size={16} aria-hidden /> Established
              </dt>
              <dd className="font-medium text-be-navy">{b.established}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="flex items-center gap-2 text-be-grey">
                <MapPin size={16} aria-hidden /> Location
              </dt>
              <dd className="font-medium text-be-navy">{locationLabel(b)}</dd>
            </div>
            {cats.length > 0 && (
              <div className="flex gap-3">
                <dt className="flex items-center gap-2 text-be-grey">
                  <Tag size={16} aria-hidden /> Categories
                </dt>
                <dd className="font-medium text-be-navy">{cats.join(" · ")}</dd>
              </div>
            )}
          </dl>

          <div className="mt-6 rounded-2xl bg-be-mist p-5">
            <p className="text-xs text-be-grey">Price from:</p>
            <p className="mt-1">
              <strong className="text-3xl font-bold text-be-navy">{b.price.from}</strong>{" "}
              <span className="text-be-grey">{b.price.unit}</span>
            </p>
            {b.note && <p className="mt-2 text-xs text-be-grey">{b.note}</p>}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" disabled className="rounded-full bg-be-amber px-6 py-3 font-semibold text-be-navy disabled:cursor-not-allowed disabled:opacity-50">
              Enquire
            </button>
            <button type="button" disabled className="rounded-full border border-be-navy px-6 py-3 font-semibold text-be-navy disabled:cursor-not-allowed disabled:opacity-50">
              Add to Wishlist
            </button>
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs text-be-grey">
            <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
            Enquiries, wishlist and bookings are not connected in this testing preview. This listing is historical and has not been re-confirmed with the
            business.
          </p>
        </div>
      </article>

      <section className="mx-auto max-w-7xl px-4 pb-4">
        <details className="rounded-xl border border-gray-200 p-4 text-sm text-be-grey">
          <summary className="cursor-pointer font-medium text-be-navy">Listing source</summary>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Booked Events profile: bookedevents.co.uk/businesses/{b.slug}/ (origin offline at time of reconstruction)</li>
            <li>Card details copied from the Wayback Machine capture of 31 March 2025.</li>
            {b.sources.includes("observed-2025-09-25") && <li>Listing seen live on 25 September 2026.</li>}
            {b.inferred && <li>Industry inferred from {b.inferred.basis}; not stated by the business.</li>}
            <li>Original image ({b.originalImage.split("/").pop()}) not yet recovered.</li>
          </ul>
        </details>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="text-2xl font-bold text-be-navy">More in {industryName(industry!)}</h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <li key={r.slug}>
                <BusinessCard business={r} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </SiteShell>
  );
}
