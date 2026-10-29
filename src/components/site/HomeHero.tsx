import Planner from "./Planner";

/** Homepage hero: the wordmark, one line, and the planner. The background is a
 *  placeholder foil until Jake chooses the header image. */
export default function HomeHero() {
  return (
    <section aria-label="Plan your event" className="be-hero-foil relative isolate overflow-hidden text-be-navy">
      <div className="relative mx-auto flex min-h-[calc(100svh-72px)] max-w-5xl flex-col items-center justify-center px-4 py-14 text-center">
        <p className="select-none text-5xl font-bold tracking-tight md:text-7xl" aria-hidden>
          <span className="be-gradient-text">any</span>
          <span className="text-be-navy">vendor</span>
        </p>
        <h1 className="mt-5 text-2xl font-semibold text-be-navy md:text-4xl">Find your vendors in seconds</h1>
        <p className="mt-2 text-base text-be-navy/70 md:text-lg">Tell us about your event. We’ll suggest the right people for each thing you need.</p>
        <div className="mt-8 w-full text-left">
          <Planner />
        </div>
      </div>
    </section>
  );
}
