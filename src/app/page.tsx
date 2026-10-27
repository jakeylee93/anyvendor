import Link from "next/link";
import { Store, ShoppingBag, Hammer, ArrowRight } from "lucide-react";
import SiteShell from "@/components/site/SiteShell";
import { SupplierCta, Newsletter } from "@/components/site/SiteFooter";
import BusinessCard from "@/components/site/BusinessCard";
import DirectorySearch from "@/components/site/DirectorySearch";
import { BUSINESSES, MARKET_PRODUCTS, categoriesOf } from "@/lib/directory";
import { getProfile } from "@/lib/profiles";
import HomeHero, { type HeroVendor } from "@/components/site/HomeHero";

// Vendors with a showreel, in a varied order for the hero slider.
const HERO_ORDER = ["the-bar-people", "tony-poole-discos", "grape-fig", "cj-sax", "natalie-max", "meatstop", "harry-de-cruz", "tm-event-hire", "calleo", "lucy-jane-cakes", "ozzy-stix", "ray-johnson", "magpie-catering", "paint-and-pour", "toot-sweet-candy-cart", "jamie-roche"];
const heroVendors: HeroVendor[] = HERO_ORDER.flatMap((slug) => {
  const b = BUSINESSES.find((x) => x.slug === slug);
  const p = getProfile(slug);
  if (!b || !p?.reel) return [];
  const o = p.reel.outputs;
  return [
    {
      slug,
      name: p.displayName,
      category: categoriesOf(b)[0] ?? "",
      place: p.basedIn?.text.split(/[,(]/)[0].trim() ?? b.region,
      logo: p.logo ? { src: p.logo.src, plate: p.logo.plate, wide: p.logo.width / p.logo.height > 1.8 } : null,
      desktop: { video: o.desktop.video, poster: o.desktop.posterWebp },
      mobile: { video: o.mobile.video, poster: o.mobile.posterWebp },
    },
  ];
});

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
      <HomeHero vendors={heroVendors} />

      {/* What Anyvendor does (the original three pillars) */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:grid-cols-3">
          {PILLARS.map(({ icon: Icon, ...p }) => (
            <Link key={p.kicker} href={p.href} className="group flex gap-4 rounded-2xl p-4 hover:bg-be-mist">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-be-cyan-pale text-be-navy">
                <Icon size={22} aria-hidden />
              </span>
              <span>
                <span className="block text-xs font-bold uppercase tracking-[0.18em] text-be-cyan">{p.kicker}</span>
                <span className="mt-0.5 block text-lg font-semibold text-be-navy">{p.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-be-grey">{p.body}</span>
              </span>
            </Link>
          ))}
        </div>
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
