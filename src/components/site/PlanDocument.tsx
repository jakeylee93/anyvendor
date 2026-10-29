"use client";

import Link from "next/link";
import { ArrowUpRight, Mail, Printer, Trash2 } from "lucide-react";
import { useShortlist } from "./ShortlistProvider";
import { NEEDS } from "@/lib/plan";

export interface PlanVendor {
  slug: string;
  name: string;
  categories: string[];
  place: string | null;
  price: { from: string; unit: string } | null;
  logo: { src: string; plate: string } | null;
  photo: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
}

function niceDate(d: string | null) {
  if (!d) return null;
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return d;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/** The plan as a document: event details plus every shortlisted vendor with links. */
export default function PlanDocument({ vendors }: { vendors: Record<string, PlanVendor> }) {
  const { items, event, remove, clear } = useShortlist();
  const groups = new Map<string, PlanVendor[]>();
  for (const it of items) {
    const v = vendors[it.slug];
    if (!v) continue;
    const label = NEEDS.find((n) => n.key === it.need)?.label ?? "Shortlisted";
    groups.set(label, [...(groups.get(label) ?? []), v]);
  }
  const details = event ? [event.event, event.location, niceDate(event.date), event.guests ? `${event.guests} guests` : null].filter(Boolean) : [];

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <p className="font-caveat text-2xl text-be-cyan">your plan</p>
          <h1 className="text-3xl font-bold text-be-navy md:text-5xl">My event plan</h1>
          {details.length > 0 && <p className="mt-2 text-be-grey">{details.join(" · ")}</p>}
          {event?.ask && <p className="mt-1 text-sm text-be-grey">“{event.ask}”</p>}
        </div>
        <div className="flex gap-2 print:hidden">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-be-navy px-4 py-2 text-sm font-semibold text-be-navy hover:bg-be-mist">
            <Printer size={16} aria-hidden /> Print / save as PDF
          </button>
          {items.length > 0 && (
            <button type="button" onClick={clear} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-be-grey hover:text-red-600">
              <Trash2 size={16} aria-hidden /> Clear
            </button>
          )}
        </div>
      </header>

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <h2 className="text-xl font-semibold text-be-navy">Nothing shortlisted yet</h2>
          <p className="mt-2 text-be-grey">Tell us about your event and tap the heart on the vendors you like.</p>
          <Link href="/#plan" className="mt-6 inline-flex rounded-full bg-be-amber px-6 py-3 font-semibold text-be-navy">
            Plan my event
          </Link>
        </div>
      ) : (
        <>
          {[...groups.entries()].map(([label, list]) => (
            <section key={label} className="mt-8">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-be-grey">{label}</h2>
              <ul className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-200">
                {list.map((v) => (
                  <li key={v.slug} className="flex flex-wrap items-center gap-4 p-4">
                    {v.logo ? (
                      <span className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-gray-200 ${v.logo.plate === "dark" ? "bg-be-deep" : "bg-white"}`}>
                        <img src={v.logo.src} alt="" className="h-[76%] w-[76%] object-contain" />
                      </span>
                    ) : v.photo ? (
                      <img src={v.photo} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <Link href={`/businesses/${v.slug}`} className="font-bold text-be-navy hover:text-be-cyan">
                        {v.name}
                      </Link>
                      <p className="truncate text-sm text-be-grey">
                        {v.categories.join(" · ")}
                        {v.place ? ` · ${v.place}` : ""}
                        {v.price ? ` · from ${v.price.from} ${v.price.unit}` : ""}
                      </p>
                      {v.website && (
                        <a href={v.website} target="_blank" rel="noopener noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-sm text-be-navy underline decoration-gray-300 underline-offset-2 hover:decoration-be-cyan print:no-underline">
                          {v.website.replace(/^https?:\/\//, "").replace(/\/$/, "")} <ArrowUpRight size={13} aria-hidden className="print:hidden" />
                        </a>
                      )}
                      {v.phone && <p className="text-sm text-be-navy">{v.phone}</p>}
                    </div>
                    <div className="flex gap-2 print:hidden">
                      {v.email ? (
                        <a href={`mailto:${v.email}?subject=${encodeURIComponent("Event enquiry via Anyvendor")}`} className="inline-flex items-center gap-1.5 rounded-full bg-be-amber px-4 py-2 text-sm font-semibold text-be-navy">
                          <Mail size={15} aria-hidden /> Email
                        </a>
                      ) : v.website ? (
                        <a href={v.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-be-navy px-4 py-2 text-sm font-semibold text-be-navy">
                          Enquire on their site <ArrowUpRight size={14} aria-hidden />
                        </a>
                      ) : null}
                      <button type="button" onClick={() => remove(v.slug)} aria-label={`Remove ${v.name}`} className="rounded-full p-2 text-be-grey hover:text-red-600">
                        <Trash2 size={16} aria-hidden />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <section className="mt-10 rounded-2xl bg-be-mist p-5 text-sm text-be-grey print:hidden">
            <p>
              <strong className="text-be-navy">Coming next:</strong> one enquiry to everyone on this plan, replies in one inbox, and a free account that keeps your plan on every device. Until vendors have accounts, this plan is saved on this device only.
            </p>
          </section>
        </>
      )}
    </article>
  );
}
