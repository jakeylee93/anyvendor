import Link from "next/link";
import { Store, ShoppingBag, Hammer, ArrowRight } from "lucide-react";
import SiteShell from "@/components/site/SiteShell";
import { SupplierCta, Newsletter } from "@/components/site/SiteFooter";
import BusinessCard from "@/components/site/BusinessCard";
import DirectorySearch from "@/components/site/DirectorySearch";
import { BUSINESSES, MARKET_PRODUCTS } from "@/lib/directory";

const PILLARS = [
  {
    icon: Store,
    kicker: "Directory",
    title: "Connect with the Best",
    body: "No middlemen, no markups—just great event professionals at your fingertips. Find and book with confidence.",
    href: "/directory",
  },
  {
    icon: ShoppingBag,
    kicker: "Market",
    title: "Event Signage & Custom Merch",
    body: "From branded signage to bespoke event decor, we help you create and source everything you need to elevate your event.",
    href: "/shop",
  },
  {
    icon: Hammer,
    kicker: "Trade Services",
    title: "Bespoke Builds, Maximum Impact",
    body: "Custom builds, branded activations, and high-impact event spaces. We take care of every detail so you can focus on making connections that count.",
    href: "/trade",
  },
];

export default function Home() {
  return (
    <SiteShell>
      {/* Hero — rebuilt; the live site's hero/logo region failed to render */}
      <section className="relative overflow-hidden bg-be-navy text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 80% at 15% 20%, #33ccff55, transparent 60%), radial-gradient(50% 70% at 85% 30%, #ff69eb44, transparent 60%), radial-gradient(60% 60% at 60% 100%, #9966cc55, transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-14 md:pb-20 md:pt-20">
          <p className="font-caveat text-2xl text-be-cyan md:text-3xl">Find Top Event Professionals</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-6xl">Event Directory</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Unforgettable Events Begin with Unstoppable Vendors – Start Searching!
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/directory" className="inline-flex items-center gap-2 rounded-full bg-be-cyan px-6 py-3 font-semibold text-be-navy hover:brightness-95">
              View all businesses <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href="/plan-my-event" className="inline-flex items-center rounded-full bg-be-amber px-6 py-3 font-semibold text-be-navy hover:brightness-95">
              Plan My Event
            </Link>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {PILLARS.map(({ icon: Icon, ...p }) => (
              <Link key={p.kicker} href={p.href} className="group rounded-2xl bg-white/8 p-6 ring-1 ring-white/15 backdrop-blur hover:bg-white/12">
                <Icon className="text-be-cyan" size={26} aria-hidden />
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-be-amber">{p.kicker}</p>
                <h2 className="mt-1 text-xl font-semibold">{p.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{p.body}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="be-gradient-line relative" />
      </section>

      {/* Directory */}
      <section className="bg-be-mist" aria-labelledby="directory-heading">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="directory-heading" className="text-3xl font-bold text-be-navy md:text-4xl">
                Directory
              </h2>
              <p className="mt-2 text-be-grey">Unforgettable Events Begin with Unstoppable Vendors – Start Searching!</p>
            </div>
            <Link href="/directory" className="inline-flex items-center gap-1.5 font-semibold text-be-navy hover:text-be-cyan">
              View all businesses <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
          <div className="mt-6">
            <DirectorySearch />
          </div>
          <ul className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]" aria-label="Featured businesses">
            {BUSINESSES.map((b) => (
              <li key={b.slug} className="w-[72%] shrink-0 snap-start sm:w-[44%] md:w-[30%] lg:w-[23%]">
                <BusinessCard business={b} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Market */}
      <section aria-labelledby="market-heading">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="market-heading" className="text-3xl font-bold text-be-navy md:text-4xl">
                Market
              </h2>
              <p className="mt-2 text-be-grey">Your event. Your brand. Everything customised, right here.</p>
            </div>
            <Link href="/shop" className="inline-flex items-center gap-1.5 font-semibold text-be-navy hover:text-be-cyan">
              Browse the Marketplace <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {MARKET_PRODUCTS.map((p) => (
              <li key={p.name} className="rounded-xl border border-gray-200 p-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-be-grey">Min Order: {p.min}</p>
                <h3 className="mt-2 font-semibold text-be-navy">{p.name}</h3>
                <p className="text-xs text-be-grey">{p.category}</p>
                <p className="mt-3 font-semibold text-be-navy">{p.price}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-be-grey">Archived catalogue prices (March 2025) shown for reference. Ordering is not active in this preview.</p>
        </div>
      </section>

      <SupplierCta />
      <Newsletter />
    </SiteShell>
  );
}
