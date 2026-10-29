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

interface Ctx {
  items: ShortlistItem[];
  event: PlanEvent | null;
  has: (slug: string) => boolean;
  toggle: (slug: string, need?: string | null) => void;
  remove: (slug: string) => void;
  clear: () => void;
  setEvent: (e: PlanEvent) => void;
}

const KEY = "anyvendor.plan.v1";
const ShortlistContext = createContext<Ctx | null>(null);

/** Guest shortlist and event details, kept on this device only (localStorage). */
export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [event, setEventState] = useState<PlanEvent | null>(null);
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
          if (d.event) setEventState(d.event);
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
      localStorage.setItem(KEY, JSON.stringify({ items, event }));
    } catch {
      /* ignore */
    }
  }, [items, event, ready]);

  const has = useCallback((slug: string) => items.some((i) => i.slug === slug), [items]);
  const toggle = useCallback((slug: string, need: string | null = null) => {
    setItems((cur) => (cur.some((i) => i.slug === slug) ? cur.filter((i) => i.slug !== slug) : [...cur, { slug, need }]));
  }, []);
  const remove = useCallback((slug: string) => setItems((cur) => cur.filter((i) => i.slug !== slug)), []);
  const clear = useCallback(() => setItems([]), []);
  const setEvent = useCallback((e: PlanEvent) => setEventState(e), []);

  const value = useMemo(() => ({ items, event, has, toggle, remove, clear, setEvent }), [items, event, has, toggle, remove, clear, setEvent]);
  return <ShortlistContext.Provider value={value}>{children}</ShortlistContext.Provider>;
}

export function useShortlist() {
  const ctx = useContext(ShortlistContext);
  if (!ctx) throw new Error("useShortlist must be used inside ShortlistProvider");
  return ctx;
}
