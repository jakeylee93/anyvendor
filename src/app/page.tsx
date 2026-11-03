import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import SiteShell from "@/components/site/SiteShell";
import { SupplierCta } from "@/components/site/SiteFooter";
import BusinessCard from "@/components/site/BusinessCard";
import HomeHero from "@/components/site/HomeHero";
import { cookies } from "next/headers";
import { EventIcon, eventIconFor } from "@/components/site/EventIcons";
import SpotlightCarousel, { type SpotlightItem } from "@/components/site/SpotlightCarousel";
import { DEFAULT_TYPE, TYPE_STYLE, cardFacts } from "@/components/site/BusinessCard";
import { getProfile } from "@/lib/profiles";
import { covers, parseLocation } from "@/lib/location";
import { categoriesOf, industryOf } from "@/lib/directory";
import { BUSINESSES, INDUSTRIES } from "@/lib/directory";
import { NEEDS } from "@/lib/plan";

const BROWSE = [
  ...NEEDS.filter((n) => n.key !== "extras").map((n) => ({
    label: n.label,
    icon: n.icon,
    href: n.industry ? `/directory?industry=${n.industry}` : `/directory?category=${encodeURIComponent(n.categories![0])}`,
  })),
  ...INDUSTRIES.flatMap((i) => i.categories.slice(0, 2).map((c) => ({ label: c, icon: "Star", href: `/directory?industry=${i.slug}&category=${encodeURIComponent(c)}` }))),
];

function spotlightItems() {
  return BUSINESSES.map((b): SpotlightItem | null => {
    const p = getProfile(b.slug);
    if (!p) return null;
    const reel = p.reelQuality === "high" ? p.reel?.outputs.desktop : undefined;
    const poster = reel?.posterWebp ?? p.card?.src ?? p.gallery[0]?.src ?? null;
    if (!poster) return null;
    const cats = categoriesOf(b);
    const industry = industryOf(b);
    const type = (industry && TYPE_STYLE[industry]) || DEFAULT_TYPE;
    const facts = cardFacts(b);
    const price = p.cardPrice ?? b.price;
    return {
      slug: b.slug, name: p.displayName ?? b.name, href: `/businesses/${b.slug}`, category: cats[0] ?? null, icon: eventIconFor(cats[0] ?? industry ?? ""),
      place: facts.place, year: facts.year, priceFrom: price.from, priceUnit: price.unit, video: reel?.video ?? null, poster, alt: p.card?.alt ?? "",
      logo: p.logo ? { src: p.logo.src, plate: p.logo.plate === "dark" ? "dark" : "light", wide: p.logo.width / p.logo.height > 1.8 } : null,
      tint: type.tint, textColor: type.text,
    };
  }).filter((x): x is SpotlightItem => x !== null);
}

export default async function Home() {
  const loc = parseLocation((await cookies()).get("av_loc")?.value);
  const all = spotlightItems();
  const local = loc ? all.filter((it) => covers(getProfile(it.slug)?.coverage, loc)) : all;
  const items = local.length ? local : all.filter((it) => ["nationwide", "international"].includes(getProfile(it.slug)?.coverage.travels ?? ""));
  return (
    <SiteShell>
      <HomeHero />

      <section id="featured" className="mx-auto max-w-7xl px-4 py-14 md:py-20" aria-labelledby="featured-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-caveat text-2xl text-be-cyan">hand-picked</p>
            <h2 id="featured-heading" className="text-3xl font-bold text-be-navy md:text-5xl">Featured vendors</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <form action="/api/location" method="get" className="flex items-center gap-2 rounded-full bg-be-cyan-pale px-3 py-1.5 text-sm text-be-navy ring-1 ring-be-cyan/40">
              <MapPin size={15} className="shrink-0 text-be-navy" aria-hidden />
              <label className="sr-only" htmlFor="loc">Your town, county or postcode</label>
              <input id="loc" name="q" defaultValue={loc?.label ?? ""} placeholder="Town, county or postcode" className="w-40 bg-transparent placeholder:text-be-navy/50 focus:outline-none" />
              <button className="font-semibold underline decoration-be-cyan decoration-2 underline-offset-2">{loc ? "Change" : "Set"}</button>
            </form>
            <Link href="/directory" className="inline-flex items-center gap-1.5 font-semibold text-be-navy hover:text-be-cyan">
              View all <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
        <p className="mt-2 text-sm text-be-grey">
          {loc && local.length > 0 && `Showing ${local.length} hand-picked vendor${local.length === 1 ? "" : "s"} who cover ${loc.label}.`}
          {loc && local.length === 0 && items.length > 0 && `None of our hand-picked vendors list ${loc.label} yet. These travel UK-wide.`}
          {loc && local.length === 0 && items.length === 0 && `None of our hand-picked vendors cover ${loc.label} yet. Try the full directory.`}
          {!loc && "Hand-picked by the AnyVendor team. Set your location to see who covers your area."}
        </p>
        <div className="mt-8">
          {items.length > 0 ? <SpotlightCarousel items={items} label="Featured vendors" /> : <p className="rounded-2xl bg-be-mist p-6 text-center text-be-navy">No featured vendors for this area yet. <Link href="/directory" className="font-semibold underline">Browse the full directory</Link>.</p>}
        </div>
      </section>

      <section className="border-y border-gray-100 bg-be-mist py-10" aria-label="Browse by what you need">
        <h2 className="text-center text-2xl font-bold text-be-navy md:text-3xl">What are you looking for?</h2>
        <div className="marquee mt-6" style={{ "--dur": "70s" } as React.CSSProperties}>
          <ul className="marquee-track items-stretch">
            {[...BROWSE, ...BROWSE].map((b, n) => (
              <li key={`${b.label}-${n}`} className="shrink-0" aria-hidden={n >= BROWSE.length}>
                <Link
                  href={b.href}
                  tabIndex={n >= BROWSE.length ? -1 : 0}
                  className="flex h-full w-32 flex-col items-center gap-2 rounded-2xl bg-white px-3 py-4 text-center text-sm font-medium text-be-navy shadow-sm ring-1 ring-gray-200 hover:ring-be-cyan"
                >
                  <EventIcon name={eventIconFor(b.label)} size={48} className="shadow-sm" />
                  <span className="line-clamp-2 leading-tight">{b.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SupplierCta />
    </SiteShell>
  );
}
