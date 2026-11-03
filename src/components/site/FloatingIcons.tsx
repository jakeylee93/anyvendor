import { EventIcon, EVENT_ICON_NAMES, type EventIconName } from "./EventIcons";

// Position, size and drift for each pictogram; kept to the edges so the headline and planner stay clear.
const SPOTS: { name: EventIconName; left: string; top: string; size: number; dur: number; delay: number; dx: number; dy: number; mobile?: boolean }[] = [
  { name: "photography", left: "6%", top: "14%", size: 46, dur: 16, delay: 0, dx: 12, dy: -16, mobile: true },
  { name: "catering", left: "17%", top: "8%", size: 36, dur: 19, delay: -4, dx: -10, dy: 12 },
  { name: "flowers", left: "4%", top: "46%", size: 40, dur: 21, delay: -9, dx: 14, dy: 10, mobile: true },
  { name: "marquee", left: "14%", top: "70%", size: 44, dur: 18, delay: -2, dx: -12, dy: -14 },
  { name: "bar", left: "7%", top: "86%", size: 34, dur: 15, delay: -6, dx: 10, dy: -10, mobile: true },
  { name: "dj", left: "78%", top: "10%", size: 46, dur: 17, delay: -3, dx: -14, dy: 12, mobile: true },
  { name: "music", left: "91%", top: "22%", size: 36, dur: 20, delay: -8, dx: 10, dy: -12 },
  { name: "transport", left: "86%", top: "48%", size: 44, dur: 22, delay: -5, dx: -12, dy: 14, mobile: true },
  { name: "videography", left: "92%", top: "68%", size: 38, dur: 16, delay: -11, dx: -10, dy: -10 },
  { name: "desserts", left: "80%", top: "86%", size: 40, dur: 19, delay: -1, dx: 12, dy: 10, mobile: true },
  { name: "lighting", left: "30%", top: "90%", size: 34, dur: 23, delay: -7, dx: -8, dy: -12 },
  { name: "entertainment", left: "64%", top: "92%", size: 36, dur: 18, delay: -12, dx: 10, dy: -8 },
  { name: "photobooth", left: "28%", top: "4%", size: 32, dur: 20, delay: -10, dx: 8, dy: 10 },
  { name: "styling", left: "66%", top: "3%", size: 34, dur: 17, delay: -13, dx: -8, dy: 12 },
  { name: "hire", left: "48%", top: "95%", size: 30, dur: 21, delay: -15, dx: 10, dy: -8 },
];

/** Small monoline pictograms drifting gently behind the hero. Decorative only; still under reduced motion. */
export default function FloatingIcons() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {SPOTS.filter((s) => EVENT_ICON_NAMES.includes(s.name)).map((s) => (
        <span
          key={s.name}
          className={`icon-drift absolute ${s.mobile ? "" : "hidden md:block"}`}
          style={{ left: s.left, top: s.top, opacity: 0.9, "--dur": `${s.dur}s`, "--delay": `${s.delay}s`, "--dx": `${s.dx}px`, "--dy": `${s.dy}px` } as React.CSSProperties}
        >
          <EventIcon name={s.name} size={s.size} className="rounded-[22%] shadow-md" />
        </span>
      ))}
    </div>
  );
}
