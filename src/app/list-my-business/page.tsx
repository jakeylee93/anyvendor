import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import PricingPlans from "@/components/site/PricingPlans";
import BusinessCard from "@/components/site/BusinessCard";
import { BUSINESSES } from "@/lib/directory";

export const metadata: Metadata = { title: "List My Business — Anyvendor" };

const EXAMPLES = ["the-bar-people", "tony-poole-discos", "grape-fig"];

export default function ListMyBusinessPage() {
  const examples = EXAMPLES.map((s) => BUSINESSES.find((b) => b.slug === s)!).filter(Boolean);
  return (
    <SiteShell>
      <section className="bg-be-mist">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center md:py-20">
          <p className="font-caveat text-3xl text-be-cyan">get booked</p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight text-be-navy md:text-6xl">Grow your events business across the UK</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-be-grey">
            A premium profile with your showreel, photos and collectible directory card, in front of people planning weddings, parties and corporate events.
          </p>
          <div className="mt-10">
            <PricingPlans />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-be-navy md:text-4xl">Your card could look like this</h2>
        <ul className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {examples.map((b) => (
            <li key={b.slug}>
              <BusinessCard business={b} />
            </li>
          ))}
        </ul>
      </section>
    </SiteShell>
  );
}
