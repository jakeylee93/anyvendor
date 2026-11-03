"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Search, Sparkles, Users } from "lucide-react";
import { NEEDS } from "@/lib/plan";
import { LOCATIONS } from "@/lib/directory";
import { EventIcon, eventIconFor } from "./EventIcons";

const EXAMPLES = [
  "I'm planning a 40th birthday in London on 20 December for 80 guests and need a mobile bar, a DJ, food and a photographer",
  "Wedding in Essex on 14 June, 120 guests: bar, band or DJ, photographer and a marquee",
  "Office Christmas party in Hertfordshire for 60 people, I need cocktails, street food and a magician",
];

interface Props {
  initial?: { ask?: string | null; needs?: string[]; location?: string | null; date?: string | null; guests?: number | null };
  compact?: boolean;
}

/** The AI planner box: describe the party, tick what you need, get a shortlist. */
export default function Planner({ initial = {}, compact = false }: Props) {
  const [ask, setAsk] = useState(initial.ask ?? "");
  const [needs, setNeeds] = useState<Set<string>>(new Set(initial.needs ?? []));
  const [focused, setFocused] = useState(false);
  const [ex, setEx] = useState(0);

  // Rotate the example while the box is empty and not focused.
  useEffect(() => {
    if (ask || focused) return;
    const t = setInterval(() => setEx((n) => (n + 1) % EXAMPLES.length), 4500);
    return () => clearInterval(t);
  }, [ask, focused]);

  const toggleNeed = (k: string) =>
    setNeeds((cur) => {
      const next = new Set(cur);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  return (
    <form id="plan" action="/plan" method="get" className={`rounded-[28px] bg-white text-be-navy shadow-2xl ring-1 ring-black/5 ${compact ? "p-3" : "p-3 md:p-4"}`}>
      <div className="grid gap-2 md:grid-cols-[1.6fr_1fr_1fr_auto]">
        <label className="flex items-center gap-2 rounded-2xl bg-be-mist px-3.5 py-3">
          <Sparkles size={18} className="shrink-0 text-be-cyan" aria-hidden />
          <span className="sr-only">What’s the occasion?</span>
          <input
            name="ask"
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={EXAMPLES[ex]}
            className="w-full bg-transparent text-[15px] placeholder:text-gray-400 focus:outline-none md:text-base"
          />
        </label>
        <label className="flex items-center gap-2 rounded-2xl bg-be-mist px-3.5 py-3 text-sm">
          <MapPin size={16} className="shrink-0 text-be-grey" aria-hidden />
          <span className="sr-only">Where</span>
          <select name="location" defaultValue={initial.location ?? ""} className="w-full bg-transparent focus:outline-none">
            <option value="">Where?</option>
            {LOCATIONS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-2xl bg-be-mist px-3.5 py-3 text-sm">
          <CalendarDays size={16} className="shrink-0 text-be-grey" aria-hidden />
          <span className="sr-only">When</span>
          <input type="date" name="date" defaultValue={initial.date ?? ""} className="w-full bg-transparent focus:outline-none" />
        </label>
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-be-cyan px-6 py-3 font-semibold text-be-navy hover:brightness-95">
          <Search size={18} aria-hidden /> Plan my event
        </button>
      </div>

      <fieldset className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
        <legend className="sr-only">What do you need?</legend>
        {NEEDS.map((n) => {
          const on = needs.has(n.key);
          return (
            <label
              key={n.key}
              className={`inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium ring-1 transition ${
                on ? "bg-be-navy text-white ring-be-navy" : "bg-white text-be-navy ring-gray-300 hover:bg-be-mist"
              }`}
            >
              <input type="checkbox" name="needs" value={n.key} checked={on} onChange={() => toggleNeed(n.key)} className="sr-only" />
              <EventIcon name={eventIconFor(n.label)} size={15} className={on ? "text-be-cyan" : "text-be-grey"} />
              {n.label}
            </label>
          );
        })}
        <label className="ml-auto flex items-center gap-2 rounded-full bg-be-mist px-3 py-1.5 text-[13px]">
          <Users size={15} className="shrink-0 text-be-grey" aria-hidden />
          <span className="sr-only">Guests</span>
          <input type="number" name="guests" min={1} max={5000} defaultValue={initial.guests ?? ""} placeholder="Guests" className="w-16 bg-transparent focus:outline-none" />
        </label>
      </fieldset>
    </form>
  );
}
