"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Car, Globe, Heart, MapPin, Plane, RotateCcw, Undo2, X } from "lucide-react";
import { useShortlist } from "./ShortlistProvider";
import { NeedIcon } from "./icons";

export interface SwipeCard {
  slug: string;
  name: string;
  categories: string[];
  year: string | null;
  place: string | null;
  travels: "local" | "regional" | "nationwide" | "international" | null;
  travelLabel: string | null;
  price: { from: string; unit: string } | null;
  cover: string | null;
  /** Only the business's own full-resolution showreel; low-res reels stay off the deck. */
  video: string | null;
  logo: { src: string; plate: string } | null;
  need: string | null;
  icon: string;
  tint: [string, string];
  text: string;
}

const THRESHOLD = 90;

function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(prefers-reduced-motion: reduce)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

function TravelIcon({ travels, size }: { travels: SwipeCard["travels"]; size: number }) {
  const I = travels === "international" ? Globe : travels === "nationwide" ? Plane : travels === "regional" ? Car : MapPin;
  return <I size={size} className="shrink-0 text-be-cyan" aria-hidden />;
}

function Face({ c, motion }: { c: SwipeCard; motion: boolean }) {
  return (
    <>
      <div className="relative flex-1 overflow-hidden bg-be-mist">
        {c.video && motion ? (
          <video src={c.video} poster={c.cover ?? undefined} muted loop autoPlay playsInline preload="metadata" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        ) : c.cover ? (
          <img src={c.cover} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${c.tint[0]}, ${c.tint[1]})` }} aria-hidden />
        )}
        {c.logo && (
          <span className={`absolute left-4 top-4 flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full shadow-lg ring-[3px] ring-white/90 ${c.logo.plate === "dark" ? "bg-be-deep" : "bg-white"}`}>
            <img src={c.logo.src} alt="" draggable={false} className="h-[78%] w-[78%] object-contain" />
          </span>
        )}
        {c.categories[0] && (
          <span className="absolute right-4 top-4 inline-flex max-w-[55%] items-center gap-1.5 truncate rounded-full bg-be-deep/75 px-3 py-1.5 text-[11px] font-semibold text-white ring-1 ring-white/25 backdrop-blur">
            <NeedIcon name={c.icon} size={13} className="text-be-cyan" aria-hidden />
            {c.categories[0]}
          </span>
        )}
        <Link
          href={`/businesses/${c.slug}`}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-be-navy shadow ring-1 ring-black/5 backdrop-blur"
        >
          View profile <ArrowUpRight size={13} aria-hidden />
        </Link>
      </div>
      <div className="px-5 pb-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold leading-tight text-be-navy">{c.name}</h2>
            <p className="mt-0.5 text-xs text-be-grey">{c.year ? `Est. ${c.year}` : " "}</p>
          </div>
          {c.price && (
            <p className="shrink-0 text-right leading-tight">
              <span className="block text-[10px] font-medium uppercase tracking-wider text-be-grey">From</span>
              <strong className="text-be-navy">{c.price.from}</strong> <span className="text-xs text-be-grey">{c.price.unit}</span>
            </p>
          )}
        </div>
        {c.categories.length > 0 && (
          <p className="mt-1 truncate text-[13px] font-semibold" style={{ color: c.text }}>
            {c.categories.join(" · ")}
          </p>
        )}
        <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-be-grey">
          <MapPin size={14} className="shrink-0" aria-hidden />
          {c.place ?? "Location on request"}
          {c.travelLabel && (
            <>
              <span aria-hidden>·</span>
              <TravelIcon travels={c.travels} size={14} />
              {c.travelLabel}
            </>
          )}
        </p>
      </div>
    </>
  );
}

/** Tinder-style deck: drag or swipe right to save a vendor to the plan, left to skip. Keyboard and buttons do the same. */
export default function SwipeDeck({ cards, context }: { cards: SwipeCard[]; context: string | null }) {
  const { ready, items, has, toggle, remove, skipped, skip, unskip, resetSkipped } = useShortlist();
  const reduced = useReducedMotion();
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [leaving, setLeaving] = useState<{ slug: string; dir: 1 | -1 } | null>(null);
  const [history, setHistory] = useState<{ slug: string; dir: 1 | -1 }[]>([]);
  const [live, setLive] = useState("");
  const start = useRef<{ x: number; y: number; id: number } | null>(null);

  const deck = cards.filter((c) => !has(c.slug) && !skipped.includes(c.slug));
  const top = deck[0];
  const decided = cards.length - deck.length;
  const skippedHere = cards.filter((c) => skipped.includes(c.slug)).length;

  function commit(dir: 1 | -1) {
    if (!top || leaving) return;
    const card = top;
    const finish = () => {
      if (dir === 1) toggle(card.slug, card.need);
      else skip(card.slug);
      setHistory((h) => [...h, { slug: card.slug, dir }].slice(-30));
      setLive(dir === 1 ? `${card.name} saved to your plan` : `${card.name} skipped`);
      setLeaving(null);
      setDrag(null);
    };
    if (reduced) finish();
    else {
      setLeaving({ slug: card.slug, dir });
      window.setTimeout(finish, 260);
    }
  }

  function undo() {
    const last = history[history.length - 1];
    if (!last) return;
    if (last.dir === 1) remove(last.slug);
    else unskip(last.slug);
    setHistory((h) => h.slice(0, -1));
    setLive("Last card brought back");
  }

  const handlers = {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
      e.currentTarget.setPointerCapture(e.pointerId);
      setDrag({ x: 0, y: 0 });
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      const s = start.current;
      if (!s || s.id !== e.pointerId) return;
      setDrag({ x: e.clientX - s.x, y: e.clientY - s.y });
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      const s = start.current;
      if (!s) return;
      start.current = null;
      const dx = e.clientX - s.x;
      if (dx > THRESHOLD) commit(1);
      else if (dx < -THRESHOLD) commit(-1);
      else setDrag(null);
    },
    onPointerCancel: () => {
      start.current = null;
      setDrag(null);
    },
    onDragStart: (e: React.DragEvent) => e.preventDefault(),
  };

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      commit(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      commit(-1);
    } else if (e.key === "Backspace" || e.key === "z") {
      e.preventDefault();
      undo();
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 pt-6 md:pt-10">
      <header className="mx-auto max-w-lg text-center">
        <p className="font-caveat text-2xl text-be-cyan">swipe to shortlist</p>
        <h1 className="text-2xl font-bold text-be-navy md:text-4xl">Right to save, left to skip</h1>
        <p className="mt-2 text-sm text-be-grey">
          {context ? (
            <>
              {context} ·{" "}
              <Link href="/#plan" className="font-semibold text-be-navy underline decoration-be-cyan decoration-2 underline-offset-4">
                change
              </Link>
            </>
          ) : (
            "Every vendor on Anyvendor. Saved ones go straight into your plan."
          )}
        </p>
      </header>
      <p aria-live="polite" className="sr-only">
        {live}
      </p>

      <div className="mx-auto mt-6 max-w-sm md:max-w-md">
        <p className="mb-3 flex justify-between text-xs font-medium text-be-grey">
          <span>{ready ? `${decided} of ${cards.length} decided` : " "}</span>
          <span>{ready ? `${items.length} in my plan` : ""}</span>
        </p>
        <div
          tabIndex={0}
          role="group"
          aria-label="Vendor cards. Press the right arrow to save a vendor to your plan, the left arrow to skip it, and Backspace to undo."
          onKeyDown={onKey}
          className="relative h-[min(64svh,600px)] rounded-[28px] outline-none focus-visible:ring-4 focus-visible:ring-be-cyan/40"
        >
          {!ready ? (
            <div className="absolute inset-0 animate-pulse rounded-[28px] bg-be-mist" aria-hidden />
          ) : deck.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[28px] bg-be-mist px-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-be-amber text-be-navy">
                <Heart size={30} fill="currentColor" aria-hidden />
              </span>
              <h2 className="mt-5 text-xl font-bold text-be-navy">{cards.length ? "That’s everyone" : "No vendors for this yet"}</h2>
              <p className="mt-2 text-sm text-be-grey">
                {cards.length ? `${cards.filter((c) => has(c.slug)).length} of these are in your plan.` : "We’re adding more businesses every week."}
              </p>
              <div className="mt-6 grid w-full gap-2">
                <Link href="/plan/my" className="rounded-full bg-be-navy px-5 py-3 text-sm font-semibold text-white">
                  View my plan
                </Link>
                {skippedHere > 0 && (
                  <button type="button" onClick={resetSkipped} className="inline-flex items-center justify-center gap-2 rounded-full border border-be-navy px-5 py-3 text-sm font-semibold text-be-navy">
                    <RotateCcw size={15} aria-hidden /> Go through the {skippedHere} I skipped again
                  </button>
                )}
                <Link href="/directory" className="text-sm font-semibold text-be-navy underline decoration-be-cyan decoration-2 underline-offset-4">
                  Browse the directory
                </Link>
              </div>
            </div>
          ) : (
            deck.slice(0, 3).map((c, i) => {
              const isTop = i === 0;
              const lv = leaving && leaving.slug === c.slug ? leaving.dir : 0;
              const x = isTop && drag ? drag.x : 0;
              const y = isTop && drag ? drag.y : 0;
              const transform = lv
                ? `translateX(${lv * 130}%) rotate(${lv * 18}deg)`
                : isTop
                  ? `translate(${x}px, ${y * 0.25}px) rotate(${x / 18}deg)`
                  : `translateY(${i * 14}px) scale(${1 - i * 0.05})`;
              return (
                <article
                  key={c.slug}
                  data-dragging={isTop && drag !== null && !lv ? "true" : undefined}
                  aria-hidden={!isTop}
                  className="swipe-card absolute inset-0 flex select-none flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-black/5"
                  style={{ transform, zIndex: 10 - i, touchAction: "pan-y", opacity: lv ? 0 : 1 }}
                  {...(isTop && !lv ? handlers : {})}
                >
                  {isTop && (
                    <>
                      <span
                        className="pointer-events-none absolute left-5 top-24 z-10 -rotate-12 rounded-xl border-4 border-emerald-500 px-3 py-1 text-2xl font-black uppercase tracking-wider text-emerald-500"
                        style={{ opacity: Math.min(Math.max(x / THRESHOLD, 0), 1) }}
                        aria-hidden
                      >
                        Save
                      </span>
                      <span
                        className="pointer-events-none absolute right-5 top-24 z-10 rotate-12 rounded-xl border-4 border-rose-500 px-3 py-1 text-2xl font-black uppercase tracking-wider text-rose-500"
                        style={{ opacity: Math.min(Math.max(-x / THRESHOLD, 0), 1) }}
                        aria-hidden
                      >
                        Skip
                      </span>
                    </>
                  )}
                  <Face c={c} motion={!reduced} />
                </article>
              );
            })
          )}
        </div>

        <div className="mt-5 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => commit(-1)}
            disabled={!top}
            aria-label="Skip this vendor"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-rose-500 shadow-lg ring-1 ring-gray-200 transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            <X size={30} aria-hidden />
          </button>
          <button
            type="button"
            onClick={undo}
            disabled={!history.length}
            aria-label="Undo the last swipe"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-be-navy shadow ring-1 ring-gray-200 disabled:opacity-40"
          >
            <Undo2 size={22} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => commit(1)}
            disabled={!top}
            aria-label="Save this vendor to my plan"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-be-amber text-be-navy shadow-lg transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            <Heart size={30} fill="currentColor" aria-hidden />
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-be-grey">Saved vendors go into My plan. Skipped ones stay out of the way until you choose to see them again.</p>
      </div>
    </section>
  );
}
