import Link from "next/link";
import Planner from "./Planner";
import { BrandLockup } from "./BrandMark";

/** Homepage hero: the wordmark, one line, and the planner. The background is a
 *  placeholder foil until Jake chooses the header image. */
export default function HomeHero() {
  return (
    <section aria-label="Plan your event" className="be-hero-foil relative isolate overflow-hidden text-be-navy">
      <div className="relative mx-auto flex min-h-[calc(100svh-72px)] max-w-5xl flex-col items-center justify-center px-4 py-14 text-center">
        <BrandLockup animate />
        <h1 className="mt-5 text-2xl font-semibold text-be-navy md:text-4xl">Find your vendors in seconds</h1>
        <p className="mt-2 text-base text-be-navy/70 md:text-lg">Tell us about your event. We’ll suggest the right people for each thing you need.</p>
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
