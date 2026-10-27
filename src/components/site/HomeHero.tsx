"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Search, Sparkles } from "lucide-react";

export interface HeroVendor {
  slug: string;
  name: string;
  category: string;
  place: string | null;
  logo: { src: string; plate: string; wide: boolean } | null;
  desktop: { video: string; poster: string };
  mobile: { video: string; poster: string };
}

const CHIPS = [
  ["Weddings", "Weddings"],
  ["Corporate", "Corporate Events"],
  ["Birthdays", "Birthday Parties"],
  ["Festivals", "Festivals"],
  ["Private parties", "Private Parties"],
] as const;

const SLIDE_MS = 9000;

/**
 * Homepage hero: vendors' own showreels play full-bleed one at a time and
 * cross-fade to the next vendor, with the smart search over the top. Only the
 * active vendor's video is loaded; reduced motion shows posters and does not
 * auto-advance; the visitor can pause, step, or pick a vendor.
 */
export default function HomeHero({ vendors }: { vendors: HeroVendor[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const [reduced, setReduced] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const railRef = useRef<HTMLUListElement>(null);
  const v = vendors[i];

  useEffect(() => {
    const p = window.matchMedia("(orientation: portrait)");
    const r = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setPortrait(p.matches);
      setReduced(r.matches);
    };
    sync();
    p.addEventListener("change", sync);
    r.addEventListener("change", sync);
    return () => {
      p.removeEventListener("change", sync);
      r.removeEventListener("change", sync);
    };
  }, []);

  const go = useCallback((n: number) => setI((n + vendors.length) % vendors.length), [vendors.length]);

  // Auto-advance unless paused or reduced motion.
  useEffect(() => {
    if (paused || reduced) return;
    const t = setTimeout(() => go(i + 1), SLIDE_MS);
    return () => clearTimeout(t);
  }, [i, paused, reduced, go]);

  // Play the active vendor's reel.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (paused || reduced) {
      el.pause();
      return;
    }
    el.play().catch(() => {});
  }, [i, paused, reduced, portrait]);

  // Keep the active thumbnail in view.
  useEffect(() => {
    railRef.current?.children[i]?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest", inline: "center" });
  }, [i, reduced]);

  const src = portrait ? v.mobile : v.desktop;

  return (
    <section aria-label="Featured vendor showreels" className="relative isolate overflow-hidden bg-be-deep text-white">
      {/* Backdrop: poster of every vendor stacked, active one visible; video only for the active vendor. */}
      <div className="absolute inset-0">
        {vendors.map((x, n) => (
          <img
            key={x.slug}
            src={portrait ? x.mobile.poster : x.desktop.poster}
            alt=""
            aria-hidden
            loading={n === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${n === i ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        {!reduced && (
          <video
            key={`${v.slug}-${portrait ? "m" : "d"}`}
            ref={videoRef}
            src={src.video}
            poster={src.poster}
            muted
            loop
            playsInline
            autoPlay={!paused}
            preload="auto"
            aria-hidden
            tabIndex={-1}
            className="absolute inset-0 h-full w-full animate-[fadein_1s_ease] object-cover"
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,0,48,0.22)_0%,rgba(8,0,48,0.5)_75%),linear-gradient(180deg,rgba(8,0,48,0.2)_0%,rgba(8,0,48,0)_40%,rgba(8,0,48,0.85)_100%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100svh-196px)] max-w-7xl flex-col px-4 pt-14 lg:min-h-[calc(100svh-150px)] lg:pt-20">
        <div className="mx-auto w-full max-w-4xl text-center">
          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight [text-shadow:0_2px_24px_rgba(8,0,48,0.55)] md:text-7xl">
            Find the perfect vendors for <span className="font-caveat text-[1.15em] font-semibold text-be-cyan">any</span> event
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/90 [text-shadow:0_1px_12px_rgba(8,0,48,0.6)] md:text-xl">Bars, caterers, DJs, marquees, photographers and more — starting across Essex, London and Hertfordshire.</p>

          <form action="/directory" method="get" role="search" aria-label="Find vendors" className="mx-auto mt-8 flex max-w-3xl items-center gap-2 rounded-full bg-white p-1.5 pl-5 text-be-navy shadow-2xl">
            <Sparkles size={20} className="shrink-0 text-be-cyan" aria-hidden />
            <label className="min-w-0 flex-1">
              <span className="sr-only">What are you looking for?</span>
              <input
                name="ask"
                placeholder="What are you looking for? e.g. cocktail bar for 120 guests in Essex on 14 June"
                className="w-full bg-transparent py-3 text-[15px] placeholder:text-gray-400 focus:outline-none"
              />
            </label>
            <button type="submit" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-be-amber px-5 py-3 font-semibold text-be-navy hover:brightness-95 md:px-7">
              <Search size={18} aria-hidden />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          <ul className="mt-5 flex flex-wrap justify-center gap-2">
            {CHIPS.map(([label, event]) => (
              <li key={label}>
                <Link href={`/directory?event=${encodeURIComponent(event)}`} className="inline-flex rounded-full bg-white/12 px-4 py-2 text-sm font-medium ring-1 ring-white/25 backdrop-blur hover:bg-white/20">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto pb-6 pt-10">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Link href={`/businesses/${v.slug}`} className="min-w-0 text-sm text-white/85 hover:text-white">
              Now showing: <strong className="font-semibold text-white">{v.name}</strong>
              <span className="hidden sm:inline"> · {v.category}</span>
            </Link>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => go(i - 1)} aria-label="Previous vendor" className="rounded-full bg-white/15 p-2.5 ring-1 ring-white/30 hover:bg-white/25">
                <ChevronLeft size={18} />
              </button>
              <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play showreels" : "Pause showreels"} className="rounded-full bg-white/15 p-2.5 ring-1 ring-white/30 hover:bg-white/25">
                {paused ? <Play size={18} /> : <Pause size={18} />}
              </button>
              <button type="button" onClick={() => go(i + 1)} aria-label="Next vendor" className="rounded-full bg-white/15 p-2.5 ring-1 ring-white/30 hover:bg-white/25">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <ul ref={railRef} className="flex snap-x gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
            {vendors.map((x, n) => (
              <li key={x.slug} className="w-40 shrink-0 snap-start sm:w-48">
                <button
                  type="button"
                  onClick={() => setI(n)}
                  aria-pressed={n === i}
                  aria-label={`Show ${x.name}`}
                  className={`group relative block w-full overflow-hidden rounded-2xl text-left ring-2 transition ${n === i ? "ring-be-cyan" : "ring-transparent hover:ring-white/50"}`}
                >
                  <img src={x.desktop.poster} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  <span className="absolute inset-0 bg-gradient-to-t from-be-deep/90 via-be-deep/20 to-transparent" />
                  {x.logo && (
                    <span className={`absolute left-2 top-2 flex items-center justify-center rounded-full shadow ring-2 ring-white/80 ${x.logo.plate === "dark" ? "bg-be-deep" : "bg-white"} ${x.logo.wide ? "h-8 max-w-[75%] px-2" : "h-10 w-10 p-1"}`}>
                      <img src={x.logo.src} alt="" className={x.logo.wide ? "h-4 w-auto" : "h-full w-full object-contain"} />
                    </span>
                  )}
                  <span className="absolute bottom-2 left-2.5 right-2 text-left">
                    <span className="block truncate text-sm font-semibold">{x.name}</span>
                    <span className="block truncate text-[11px] text-white/75">
                      {x.category}
                      {x.place ? ` · ${x.place}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
