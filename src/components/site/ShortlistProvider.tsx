"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface PlanEvent {
  ask: string | null;
  needs: string[];
  location: string | null;
  date: string | null;
  guests: number | null;
  event: string | null;
}

export interface ShortlistItem {
  slug: string;
  need: string | null;
}

/** What the visitor tells vendors: their name and the party in their own words. */
export interface Brief {
  name: string;
  message: string;
}

interface Ctx {
  /** False until the saved plan has been read from this device. */
  ready: boolean;
  items: ShortlistItem[];
  /** Vendors passed over in the swipe deck; they come back with "start again". */
  skipped: string[];
  event: PlanEvent | null;
  brief: Brief;
  has: (slug: string) => boolean;
  toggle: (slug: string, need?: string | null) => void;
  remove: (slug: string) => void;
  clear: () => void;
  skip: (slug: string) => void;
  unskip: (slug: string) => void;
  resetSkipped: () => void;
  setEvent: (e: PlanEvent) => void;
  setBrief: (b: Partial<Brief>) => void;
}

const KEY = "anyvendor.plan.v1";
const EMPTY_BRIEF: Brief = { name: "", message: "" };
const ShortlistContext = createContext<Ctx | null>(null);

/** Guest shortlist, skips, event details and enquiry brief, kept on this device only (localStorage). */
export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [event, setEventState] = useState<PlanEvent | null>(null);
  const [brief, setBriefState] = useState<Brief>(EMPTY_BRIEF);
  const [ready, setReady] = useState(false);

  // Load after hydration (deferred a tick so the server and first client render match).
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const d = JSON.parse(raw);
          if (Array.isArray(d.items)) setItems(d.items);
          if (Array.isArray(d.skipped)) setSkipped(d.skipped.filter((s: unknown) => typeof s === "string"));
          if (d.event) setEventState(d.event);
          if (d.brief && typeof d.brief === "object") setBriefState({ name: String(d.brief.name ?? ""), message: String(d.brief.message ?? "") });
        }
      } catch {
        /* storage unavailable: shortlist works for this page view only */
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ items, skipped, event, brief }));
    } catch {
      /* ignore */
    }
  }, [items, skipped, event, brief, ready]);

  const has = useCallback((slug: string) => items.some((i) => i.slug === slug), [items]);
  const toggle = useCallback((slug: string, need: string | null = null) => {
    setItems((cur) => (cur.some((i) => i.slug === slug) ? cur.filter((i) => i.slug !== slug) : [...cur, { slug, need }]));
    setSkipped((cur) => cur.filter((s) => s !== slug));
  }, []);
  const remove = useCallback((slug: string) => setItems((cur) => cur.filter((i) => i.slug !== slug)), []);
  const clear = useCallback(() => setItems([]), []);
  const skip = useCallback((slug: string) => setSkipped((cur) => (cur.includes(slug) ? cur : [...cur, slug])), []);
  const unskip = useCallback((slug: string) => setSkipped((cur) => cur.filter((s) => s !== slug)), []);
  const resetSkipped = useCallback(() => setSkipped([]), []);
  const setEvent = useCallback((e: PlanEvent) => setEventState(e), []);
  const setBrief = useCallback((b: Partial<Brief>) => setBriefState((cur) => ({ ...cur, ...b })), []);

  const value = useMemo(
    () => ({ ready, items, skipped, event, brief, has, toggle, remove, clear, skip, unskip, resetSkipped, setEvent, setBrief }),
    [ready, items, skipped, event, brief, has, toggle, remove, clear, skip, unskip, resetSkipped, setEvent, setBrief],
  );
  return <ShortlistContext.Provider value={value}>{children}</ShortlistContext.Provider>;
}

export function useShortlist() {
  const ctx = useContext(ShortlistContext);
  if (!ctx) throw new Error("useShortlist must be used inside ShortlistProvider");
  return ctx;
}
