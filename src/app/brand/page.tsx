import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import BrandShowcase from "@/components/site/BrandShowcase";
import { AvTile, BrandLockup, BRAND } from "@/components/site/BrandMark";

export const metadata: Metadata = { title: "Brand — Anyvendor" };

const FILES = [
  { href: "/brand/anyvendor-tile.svg", label: "Tile (app icon), SVG" },
  { href: "/brand/anyvendor-mark-navy.svg", label: "Mark, navy on transparent, SVG" },
  { href: "/brand/anyvendor-mark-white.svg", label: "Mark, white on transparent, SVG" },
  { href: "/brand/anyvendor-animation.mp4", label: "Build-in animation, MP4" },
  { href: "/brand/anyvendor-animation.gif", label: "Build-in animation, GIF" },
];

export default function BrandPage() {
  return (
    <SiteShell>
      <section className="bg-be-mist">
        <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
          <p className="font-caveat text-3xl text-be-cyan">the mark</p>
          <h1 className="mt-1 text-3xl font-bold text-be-navy md:text-5xl">Anyvendor brand</h1>
          <p className="mt-3 max-w-2xl text-be-grey">
            A heavy A and V sharing a stroke, cut in white from a navy tile, with the name in a cyan pill. Drawn as geometry so it is identical at every size.
          </p>
          <div className="mt-8">
            <BrandShowcase />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <h2 className="text-2xl font-bold text-be-navy">In the header</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex h-24 items-center justify-center rounded-2xl bg-white ring-1 ring-gray-200">
            <BrandLockup layout="row" />
          </div>
          <div className="flex h-24 items-center justify-center rounded-2xl bg-be-navy">
            <BrandLockup layout="row" />
          </div>
        </div>

        <h2 className="mt-12 text-2xl font-bold text-be-navy">The tile at every size</h2>
        <div className="mt-4 flex flex-wrap items-end gap-6 rounded-2xl bg-white p-6 ring-1 ring-gray-200">
          {[16, 24, 32, 48, 64, 96, 128, 180].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <AvTile className="block" title={`Anyvendor tile ${s}px`} style={{ width: s, height: s }} />
              <span className="text-xs text-be-grey">{s}</span>
            </div>
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-bold text-be-navy">Colours</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            ["Navy", BRAND.navy, "text-white"],
            ["Cyan", BRAND.cyan, "text-be-navy"],
            ["White", BRAND.white, "text-be-navy ring-1 ring-gray-200"],
          ].map(([name, hex, cls]) => (
            <li key={name} className={`rounded-2xl p-5 ${cls}`} style={{ background: hex }}>
              <p className="font-bold">{name}</p>
              <p className="text-sm opacity-80">{hex}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-12 text-2xl font-bold text-be-navy">Files</h2>
        <ul className="mt-4 divide-y divide-gray-100 rounded-2xl border border-gray-200">
          {FILES.map((f) => (
            <li key={f.href}>
              <a href={f.href} className="flex items-center justify-between px-5 py-3 text-be-navy hover:bg-be-mist" download>
                <span>{f.label}</span>
                <span className="text-sm text-be-grey">{f.href.split("/").pop()}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-be-grey">The pill uses the site typeface (Lexend Deca Bold); a lockup with the word outlined as paths comes with the final vector files.</p>
      </section>
    </SiteShell>
  );
}
