import Link from "next/link";
import Planner from "./Planner";
import { BrandLockup } from "./BrandMark";
import FloatingIcons from "./FloatingIcons";

/** Homepage hero: headline and planner first, a small lockup above, and the event pictograms drifting quietly behind. */
export default function HomeHero() {
  return (
    <section aria-label="Plan your event" className="relative isolate overflow-hidden bg-white text-be-navy">
      <FloatingIcons />
      <div className="relative mx-auto flex min-h-[calc(100svh-72px)] max-w-4xl flex-col items-center justify-center px-4 py-12 text-center">
        <div className="origin-bottom scale-90 md:scale-100"><BrandLockup layout="row" /></div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-be-navy md:text-5xl">Find your vendors in seconds</h1>
        <p className="mt-3 max-w-xl text-base text-be-navy/70 md:text-lg">Tell us about your event. We’ll suggest the right people for each thing you need.</p>
        <div className="mt-8 w-full text-left">
          <Planner />
        </div>
        <p className="mt-5 text-sm text-be-navy/70">
          Or{" "}
          <Link href="/swipe" className="font-semibold text-be-navy underline decoration-be-cyan decoration-2 underline-offset-4">
            swipe through vendors
          </Link>
          : right to save, left to skip.
        </p>
      </div>
    </section>
  );
}
