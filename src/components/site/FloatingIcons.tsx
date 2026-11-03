import { EventIcon, EVENT_ICON_NAMES, type EventIconName } from "./EventIcons";

// Position, size and drift for each pictogram; kept to the edges so the headline and planner stay clear.
const SPOTS: { name: EventIconName; left: string; top: string; size: number; dur: number; delay: number; dx: number; dy: number; mobile?: boolean }[] = [
  { name: "photography", left: "5%", top: "16%", size: 40, dur: 16, delay: 0, dx: 12, dy: -16, mobile: true },
  { name: "catering", left: "13%", top: "6%", size: 32, dur: 19, delay: -4, dx: -10, dy: 12 },
  { name: "flowers", left: "3%", top: "48%", size: 36, dur: 21, delay: -9, dx: 14, dy: 10, mobile: true },
  { name: "marquee", left: "9%", top: "74%", size: 38, dur: 18, delay: -2, dx: -12, dy: -14 },
  { name: "bar", left: "4%", top: "90%", size: 30, dur: 15, delay: -6, dx: 10, dy: -10 },
  { name: "dj", left: "82%", top: "8%", size: 40, dur: 17, delay: -3, dx: -14, dy: 12, mobile: true },
  { name: "music", left: "93%", top: "26%", size: 32, dur: 20, delay: -8, dx: 10, dy: -12 },
  { name: "transport", left: "90%", top: "50%", size: 38, dur: 22, delay: -5, dx: -12, dy: 14, mobile: true },
  { name: "videography", left: "94%", top: "72%", size: 34, dur: 16, delay: -11, dx: -10, dy: -10 },
  { name: "desserts", left: "86%", top: "90%", size: 34, dur: 19, delay: -1, dx: 12, dy: 10 },
  { name: "lighting", left: "28%", top: "93%", size: 30, dur: 23, delay: -7, dx: -8, dy: -12 },
  { name: "entertainment", left: "68%", top: "94%", size: 32, dur: 18, delay: -12, dx: 10, dy: -8 },
  { name: "photobooth", left: "30%", top: "3%", size: 28, dur: 20, delay: -10, dx: 8, dy: 10 },
  { name: "styling", left: "66%", top: "2%", size: 30, dur: 17, delay: -13, dx: -8, dy: 12 },
  { name: "hire", left: "50%", top: "96%", size: 26, dur: 21, delay: -15, dx: 10, dy: -8 },
];

/** Small monoline pictograms drifting gently behind the hero. Decorative only; still under reduced motion. */
export default function FloatingIcons() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {SPOTS.filter((s) => EVENT_ICON_NAMES.includes(s.name)).map((s) => (
        <span
          key={s.name}
          className={`icon-drift absolute ${s.mobile ? "" : "hidden lg:block"}`}
          style={{ left: s.left, top: s.top, opacity: 0.55, "--dur": `${s.dur}s`, "--delay": `${s.delay}s`, "--dx": `${s.dx}px`, "--dy": `${s.dy}px` } as React.CSSProperties}
        >
          <EventIcon name={s.name} size={s.size} className="rounded-[22%] shadow-md" />
        </span>
      ))}
    </div>
  );
}
