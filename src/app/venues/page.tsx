import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";

export const metadata: Metadata = { title: "Venues — Anyvendor" };

const TYPES = ["Halls & barns", "Rooftops", "Gardens & marquee lawns", "Bars & restaurants", "Townhouses", "Warehouses", "Country houses"];

export default function VenuesPage() {
  return (
    <SiteShell>
      <section className="bg-be-mist">
        <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
          <p className="font-caveat text-3xl text-be-cyan">the setting</p>
          <h1 className="mt-1 text-4xl font-bold text-be-navy md:text-6xl">Venues</h1>
          <p className="mt-4 max-w-2xl text-lg text-be-grey">
            Places that fit your date and guest count, suggested alongside the bar, food and music that work there. Capacity, licensing and whether outside suppliers are welcome, up front.
          </p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <li key={t} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-be-navy ring-1 ring-gray-200">
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-gray-200">
            <h2 className="text-xl font-semibold text-be-navy">Opening soon</h2>
            <p className="mt-2 text-be-grey">Venue listings are next. If you run a venue and want to be among the first, register your interest.</p>
            <Link href="/list-my-business" className="mt-5 inline-flex rounded-full bg-be-cyan px-6 py-3 font-semibold text-be-navy">
              Register interest
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
