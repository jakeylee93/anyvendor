import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SiteShell from "@/components/site/SiteShell";
import { SupplierCta } from "@/components/site/SiteFooter";
import BusinessCard from "@/components/site/BusinessCard";
import HomeHero from "@/components/site/HomeHero";
import { NeedIcon } from "@/components/site/icons";
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

export default function Home() {
  return (
    <SiteShell>
      <HomeHero />

      <section className="mx-auto max-w-7xl px-4 py-14 md:py-20" aria-labelledby="featured-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-caveat text-2xl text-be-cyan">hand-picked</p>
            <h2 id="featured-heading" className="text-3xl font-bold text-be-navy md:text-5xl">
              Featured vendors
            </h2>
          </div>
          <Link href="/directory" className="inline-flex items-center gap-1.5 font-semibold text-be-navy hover:text-be-cyan">
            View all <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {BUSINESSES.map((b) => (
            <li key={b.slug}>
              <BusinessCard business={b} />
            </li>
          ))}
        </ul>
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
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-be-cyan-pale text-be-navy">
                    <NeedIcon name={b.icon} size={22} aria-hidden />
                  </span>
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
