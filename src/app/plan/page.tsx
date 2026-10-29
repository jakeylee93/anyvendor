import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import SiteShell from "@/components/site/SiteShell";
import BusinessCard from "@/components/site/BusinessCard";
import Planner from "@/components/site/Planner";
import SaveEvent from "@/components/site/SaveEvent";
import { NeedIcon } from "@/components/site/icons";
import { NEEDS, needByKey, planFromParams, suggestFor } from "@/lib/plan";

export const metadata: Metadata = { title: "Your event plan — Anyvendor" };

type SP = Promise<{ [key: string]: string | string[] | undefined }>;

function niceDate(d: string | null) {
  if (!d) return null;
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return d;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export default async function PlanPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const req = planFromParams(sp);
  const needs = req.needs.map(needByKey).filter(Boolean) as typeof NEEDS;
  const summary = [req.event, req.location, niceDate(req.date), req.guests ? `${req.guests} guests` : null].filter(Boolean).join(" · ");

  return (
    <SiteShell>
      <SaveEvent event={{ ask: req.ask, needs: req.needs, location: req.location, date: req.date, guests: req.guests, event: req.event }} />
      <section className="bg-be-mist">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
          <p className="flex flex-wrap items-center gap-2 text-sm text-be-navy">
            <Sparkles size={16} className="text-be-cyan" aria-hidden />
            <span className="font-semibold">Your plan</span>
            {summary && <span className="text-be-grey">· {summary}</span>}
            {req.ask && <span className="text-be-grey">· “{req.ask}”</span>}
          </p>
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-semibold text-be-navy underline decoration-be-cyan decoration-2 underline-offset-4">Edit my event</summary>
            <div className="mt-3">
              <Planner compact initial={{ ask: req.ask, needs: req.needs, location: req.location, date: req.date, guests: req.guests }} />
            </div>
          </details>
        </div>
      </section>

      {needs.length === 0 ? (
        <section className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-be-navy md:text-4xl">Tell us a little more</h1>
          <p className="mt-3 text-be-grey">Tick what you need above, or describe the party: the bar, the food, the music, the photos.</p>
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="text-2xl font-bold text-be-navy md:text-4xl">Our suggestions for you</h1>
          <p className="mt-2 max-w-2xl text-be-grey">Two or three vendors for each thing you need, so you can shortlist without messaging everyone. Tap the heart to add a vendor to your plan.</p>
          <div className="mt-10 space-y-14">
            {needs.map((n) => {
              const picks = suggestFor(n, req.location, req.event);
              const more = n.industry ? `/directory?industry=${n.industry}${req.location ? `&location=${req.location}` : ""}` : `/directory?category=${encodeURIComponent(n.categories![0])}`;
              return (
                <div key={n.key}>
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-be-navy md:text-2xl">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-be-cyan-pale text-be-navy">
                        <NeedIcon name={n.icon} size={18} aria-hidden />
                      </span>
                      {n.heading}
                    </h2>
                    <Link href={more} className="inline-flex items-center gap-1 text-sm font-semibold text-be-navy hover:text-be-cyan">
                      See more <ArrowRight size={14} aria-hidden />
                    </Link>
                  </div>
                  {picks.length ? (
                    <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {picks.map((s) => (
                        <li key={s.business.slug}>
                          <BusinessCard business={s.business} need={n.key} reasons={s.best ? ["Best match", ...s.reasons] : s.reasons} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 rounded-xl border border-dashed border-gray-300 p-6 text-sm text-be-grey">
                      No vendors for this yet{req.location ? ` near ${req.location}` : ""}. We’re adding more businesses every week.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-14 rounded-2xl bg-be-navy p-6 text-white md:p-8">
            <h2 className="text-xl font-bold md:text-2xl">Happy with your shortlist?</h2>
            <p className="mt-2 text-white/75">Your plan collects each vendor’s details and website in one place. Sending one enquiry to everyone on it is coming once vendors have accounts.</p>
            <Link href="/plan/my" className="mt-5 inline-flex rounded-full bg-be-amber px-6 py-3 font-semibold text-be-navy">
              View my plan
            </Link>
          </div>
        </section>
      )}
    </SiteShell>
  );
}
