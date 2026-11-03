"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { EventIcon, type EventIconName } from "./EventIcons";

export interface SpotlightItem {
  slug: string;
  name: string;
  href: string;
  category: string | null;
  icon: EventIconName;
  place: string | null;
  year: string | null;
  priceFrom: string;
  priceUnit: string;
  /** Muted showreel, when the business has one of usable quality. */
  video: string | null;
  poster: string | null;
  alt: string;
  logo: { src: string; plate: "dark" | "light"; wide: boolean } | null;
  tint: [string, string];
  textColor: string;
}

const mod = (n: number, m: number) => ((n % m) + m) % m;

function Card({ item, active, visible, soundOn, onSound }: { item: SpotlightItem; active: boolean; visible: boolean; soundOn: boolean; onSound: () => void }) {
  return (
    <div className="h-full rounded-[24px] p-[3px]" style={{ background: `linear-gradient(135deg, ${item.tint[0]}, ${item.tint[1]})` }}>
      <div className="flex h-full flex-col gap-2 rounded-[21px] bg-white p-2">
        <div className="relative aspect-4/3 overflow-hidden rounded-[16px] bg-be-mist">
          {item.poster && <img src={item.poster} alt={item.alt} loading={visible ? "eager" : "lazy"} decoding={visible ? "sync" : "async"} className="absolute inset-0 h-full w-full object-cover" />}
          {active && item.video && (
            <video key={item.slug} src={item.video} poster={item.poster ?? undefined} autoPlay muted={!soundOn} loop playsInline preload="metadata" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          )}
          {item.logo && (
            <span className={`absolute left-3 top-3 z-[2] flex items-center justify-center overflow-hidden rounded-full shadow-lg ring-[3px] ring-white/90 ${item.logo.plate === "dark" ? "bg-be-deep" : "bg-white"} ${item.logo.wide ? "h-[76px] w-[76px]" : "h-16 w-16"}`}>
              <img src={item.logo.src} alt="" className={`object-contain ${item.logo.wide ? "h-[88%] w-[88%]" : "h-[78%] w-[78%]"}`} />
            </span>
          )}
          {item.category && (
            <span className="absolute right-3 top-3 z-[2] inline-flex max-w-[55%] items-center gap-1.5 truncate rounded-full bg-be-deep/75 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm ring-1 ring-white/25 backdrop-blur">
              <EventIcon name={item.icon} size={16} />
              {item.category}
            </span>
          )}
          {active && item.video && (
            <button type="button" onClick={onSound} aria-pressed={soundOn} aria-label={soundOn ? "Mute video" : "Play video sound"} className="absolute bottom-3 right-3 z-[2] inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-be-navy shadow ring-1 ring-black/10 hover:bg-white">
              {soundOn ? <Volume2 size={16} aria-hidden /> : <VolumeX size={16} aria-hidden />}
            </button>
          )}
        </div>
        <div className="flex flex-1 flex-col px-3 pb-2 pt-2">
          <h3 className="truncate text-lg font-bold leading-tight text-be-navy">{item.name}</h3>
          <p className="mt-0.5 text-xs text-be-grey">{item.year ? `Est. ${item.year}` : " "}</p>
          {item.category && <p className="mt-1 truncate text-[13px] font-semibold" style={{ color: item.textColor }}>{item.category}</p>}
          <div className="my-2 h-px bg-be-navy/10" />
          <p className="flex items-start gap-1.5 text-xs text-be-grey"><MapPin size={14} className="mt-px shrink-0" aria-hidden /><span className="truncate">{item.place ?? "Location on request"}</span></p>
          <div className="mt-auto flex items-baseline justify-between gap-2 pt-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-be-grey">From</span>
            <span className="truncate text-right"><strong className="text-base font-bold text-be-navy">{item.priceFrom}</strong> <span className="text-xs text-be-grey">{item.priceUnit}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Spotlight carousel: five cards visible at the normal card size, the centre one plays its
 * showreel, and the row rotates on its own. Pauses on hover, focus, when off screen, under
 * reduced motion, or with the pause button. Arrows, dots, keyboard and swipe all work.
 */
export default function SpotlightCarousel({ items, label, intervalMs = 6000 }: { items: SpotlightItem[]; label: string; intervalMs?: number }) {
  const n = items.length;
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; t: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    const el = rootRef.current;
    const io = el ? new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting && e.intersectionRatio >= 0.5), { threshold: [0, 0.5] }) : null;
    if (el && io) io.observe(el);
    return () => { mq.removeEventListener("change", sync); io?.disconnect(); };
  }, []);

  const go = useCallback((delta: number) => { setIndex((i) => mod(i + delta, n)); setSoundOn(false); }, [n]);

  const rotating = n > 1 && !userPaused && !hovering && onScreen && !reduced;
  useEffect(() => {
    if (!rotating) return;
    const t = window.setInterval(() => go(1), intervalMs);
    return () => window.clearInterval(t);
  }, [rotating, intervalMs, go]);

  if (n === 0) return null;
  const offsets = n >= 7 ? [-3, -2, -1, 0, 1, 2, 3] : Array.from({ length: Math.min(7, n + 2) }, (_, k) => k - Math.floor(Math.min(7, n + 2) / 2));
  const current = items[mod(index, n)];

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); } if (e.key === "ArrowRight") { e.preventDefault(); go(1); } }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovering(false); }}
      onPointerDown={(e) => { pointer.current = { x: e.clientX, t: Date.now() }; }}
      onPointerUp={(e) => { const p = pointer.current; pointer.current = null; if (p && Date.now() - p.t < 700 && Math.abs(e.clientX - p.x) > 40) go(e.clientX < p.x ? 1 : -1); }}
      className="relative outline-none focus-visible:ring-2 focus-visible:ring-be-cyan"
      style={{ "--card": "clamp(250px, 78vw, 300px)", "--gap": "16px" } as React.CSSProperties}
    >
      <p className="sr-only" aria-live="polite">{current.name}{current.category ? `, ${current.category}` : ""}</p>
      <div className="relative h-[470px] overflow-hidden" aria-hidden>
        {offsets.map((o) => {
          const p = index + o;
          const item = items[mod(p, n)];
          const centre = o === 0;
          return (
            <div
              key={p}
              className={`absolute left-1/2 top-0 h-full w-[var(--card)] ${reduced ? "" : "transition-[transform,opacity] duration-500 ease-out"}`}
              style={{ transform: `translateX(calc(-50% + ${o} * (var(--card) + var(--gap)))) scale(${centre ? 1 : 0.94})`, opacity: centre ? 1 : Math.abs(o) >= 3 ? 0 : 0.85, zIndex: centre ? 2 : 1 }}
            >
              <Card item={item} active={centre} visible={Math.abs(o) <= 2} soundOn={soundOn && centre} onSound={() => setSoundOn((s) => !s)} />
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-center gap-3">
        <button type="button" onClick={() => go(-1)} aria-label="Previous vendor" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-be-navy shadow ring-1 ring-gray-200 hover:ring-be-cyan"><ChevronLeft size={20} aria-hidden /></button>
        <ol className="flex items-center gap-1.5" aria-label="Choose vendor">
          {items.map((it, i) => (
            <li key={it.slug}>
              <button type="button" onClick={() => { setIndex(i); setSoundOn(false); }} aria-label={`Show ${it.name}`} aria-current={mod(index, n) === i ? "true" : undefined} className={`h-2.5 rounded-full transition-all ${mod(index, n) === i ? "w-6 bg-be-navy" : "w-2.5 bg-be-navy/25 hover:bg-be-navy/50"}`} />
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => go(1)} aria-label="Next vendor" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-be-navy shadow ring-1 ring-gray-200 hover:ring-be-cyan"><ChevronRight size={20} aria-hidden /></button>
        {n > 1 && !reduced && (
          <button type="button" onClick={() => setUserPaused((p) => !p)} aria-pressed={userPaused} aria-label={userPaused ? "Resume rotation" : "Pause rotation"} className="ml-1 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-be-navy shadow ring-1 ring-gray-200 hover:ring-be-cyan">
            {userPaused ? <Play size={18} aria-hidden /> : <Pause size={18} aria-hidden />}
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-sm text-be-grey"><Link href={current.href} className="font-semibold text-be-navy underline decoration-be-cyan decoration-2 underline-offset-4">Open {current.name}</Link></p>
    </div>
  );
}
