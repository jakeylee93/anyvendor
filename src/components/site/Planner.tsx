"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Search, Sparkles, Users } from "lucide-react";
import { NEEDS } from "@/lib/plan";
import { LOCATIONS } from "@/lib/directory";
import { NeedIcon } from "./icons";

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
    <form id="plan" action="/plan" method="get" className={`rounded-[28px] bg-white text-be-navy shadow-2xl ring-1 ring-black/5 ${compact ? "p-4" : "p-4 md:p-6"}`}>
      <label className="block">
        <span className="sr-only">Tell us about your event</span>
        <div className="flex items-start gap-3">
          <Sparkles size={22} className="mt-1 shrink-0 text-be-cyan" aria-hidden />
          <textarea
            name="ask"
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={compact ? 2 : 3}
            placeholder={EXAMPLES[ex]}
            className="w-full resize-none bg-transparent text-[17px] leading-relaxed placeholder:text-gray-400 focus:outline-none md:text-lg"
          />
        </div>
      </label>

      <fieldset className="mt-3 border-t border-gray-100 pt-3">
        <legend className="sr-only">What do you need?</legend>
        <ul className="flex flex-wrap gap-2">
          {NEEDS.map((n) => {
            const on = needs.has(n.key);
            return (
              <li key={n.key}>
                <label
                  className={`inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium ring-1 transition ${
                    on ? "bg-be-navy text-white ring-be-navy" : "bg-white text-be-navy ring-gray-300 hover:bg-be-mist"
                  }`}
                >
                  <input type="checkbox" name="needs" value={n.key} checked={on} onChange={() => toggleNeed(n.key)} className="sr-only" />
                  <NeedIcon name={n.icon} size={15} className={on ? "text-be-cyan" : "text-be-grey"} aria-hidden />
                  {n.label}
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="flex items-center gap-2 rounded-xl bg-be-mist px-3 py-2.5 text-sm">
          <MapPin size={16} className="shrink-0 text-be-grey" aria-hidden />
          <span className="sr-only">Location</span>
          <select name="location" defaultValue={initial.location ?? ""} className="w-full bg-transparent focus:outline-none">
            <option value="">Where?</option>
            {LOCATIONS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-xl bg-be-mist px-3 py-2.5 text-sm">
          <CalendarDays size={16} className="shrink-0 text-be-grey" aria-hidden />
          <span className="sr-only">Date</span>
          <input type="date" name="date" defaultValue={initial.date ?? ""} className="w-full bg-transparent focus:outline-none" />
        </label>
        <label className="flex items-center gap-2 rounded-xl bg-be-mist px-3 py-2.5 text-sm">
          <Users size={16} className="shrink-0 text-be-grey" aria-hidden />
          <span className="sr-only">Guests</span>
          <input type="number" name="guests" min={1} max={5000} defaultValue={initial.guests ?? ""} placeholder="Guests" className="w-full bg-transparent focus:outline-none" />
        </label>
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-be-amber px-6 py-2.5 font-semibold text-be-navy hover:brightness-95">
          <Search size={18} aria-hidden /> Find my vendors
        </button>
      </div>
    </form>
  );
}
