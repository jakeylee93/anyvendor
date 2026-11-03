import type { SVGProps } from "react";

/**
 * AnyVendor event pictograms: flat monoline, one ink (currentColor), 24-unit grid,
 * stroke 1.75 with round caps and joins. Drawn by hand from the approved direction
 * (docs/brand-20261103/icons-sheet-02-flat-monoline.png) so they stay crisp at 24–32px.
 */
export type EventIconName =
  | "transport" | "catering" | "desserts" | "dj" | "music" | "photography" | "videography" | "entertainment"
  | "hire" | "bar" | "flowers" | "marquee" | "lighting" | "photobooth" | "styling";

export const EVENT_ICON_NAMES: EventIconName[] = ["transport", "catering", "desserts", "dj", "music", "photography", "videography", "entertainment", "hire", "bar", "flowers", "marquee", "lighting", "photobooth", "styling"];

const PATHS: Record<EventIconName, React.ReactNode> = {
  transport: (
    <>
      <path d="M3 17v-3.4l1.9-4.3A2 2 0 0 1 6.7 8h10.6a2 2 0 0 1 1.8 1.3L21 13.6V17" />
      <path d="M3 13.6h18" />
      <circle cx="7" cy="17.5" r="1.9" />
      <circle cx="17" cy="17.5" r="1.9" />
    </>
  ),
  catering: (
    <>
      <path d="M4.5 15a7.5 7.5 0 0 1 15 0" />
      <path d="M3 15h18M5.5 18h13" />
      <circle cx="12" cy="6" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  desserts: (
    <>
      <path d="M4 20v-5.5h16V20M7 14.5V10h10v4.5M3 20h18" />
      <path d="M12 10V6.5" />
      <circle cx="12" cy="4.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  dj: (
    <>
      <rect x="2.5" y="7" width="19" height="10" rx="2" />
      <circle cx="7.5" cy="12" r="2.4" />
      <circle cx="16.5" cy="12" r="2.4" />
      <path d="M12 10v4" />
    </>
  ),
  music: (
    <>
      <path d="M14 17V5l5 2" />
      <circle cx="11.5" cy="17" r="2.5" />
    </>
  ),
  photography: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M8.5 7 10 4.5h4L15.5 7" />
      <circle cx="12" cy="13.5" r="3.4" />
      <circle cx="17.6" cy="10.4" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  videography: (
    <>
      <rect x="3" y="7" width="12" height="10" rx="2" />
      <path d="M15 11.5 21 8.5v7l-6-3" />
      <circle cx="12.4" cy="10" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  entertainment: (
    <>
      <path d="M6 5c3 1.6 9 1.6 12 0v7a6 6 0 0 1-12 0z" />
      <path d="M8.8 11a1.5 1.5 0 0 1 2.4 0M12.8 11a1.5 1.5 0 0 1 2.4 0" />
      <path d="M9.5 14.5a3 3 0 0 0 5 0" />
    </>
  ),
  hire: (
    <>
      <path d="M8.5 4v9h8v7M9.5 13v7" />
      <path d="M8.5 4c1 .7 2.2 .7 3.2 0" />
    </>
  ),
  bar: (
    <>
      <path d="M4 5h16l-8 9z" />
      <path d="M12 14v6M8 20h8" />
    </>
  ),
  flowers: (
    <>
      <path d="M12 13c-3.2 0-5-2.6-5-6.2 2.1 0 3.6 1 5 3 1.4-2 2.9-3 5-3 0 3.6-1.8 6.2-5 6.2z" />
      <path d="M12 13v8" />
      <path d="M12 18.5c-2.6 0-4.2-1.4-4.6-3.6 2.6 0 4.2 1.4 4.6 3.6z" />
    </>
  ),
  marquee: (
    <>
      <path d="M3 11.5 12 5l9 6.5" />
      <path d="M3 11.5c1.5 2 3 2 4.5 0s3 2 4.5 0 3 2 4.5 0 3 2 4.5 0" />
      <path d="M5 12.5V20M19 12.5V20" />
    </>
  ),
  lighting: (
    <>
      <circle cx="10" cy="10" r="4.5" />
      <path d="M8.6 14.3 6.5 20M4 20h5.5" />
      <path d="M16.8 6.2l2.4-1.4M17.9 10h3.1M16.8 13.8l2.4 1.4" />
    </>
  ),
  photobooth: (
    <>
      <rect x="4.5" y="3" width="15" height="18" rx="2" />
      <path d="M7.5 7h7M9 7v10M12 7v10" />
      <path d="M16.5 9h1.5M16.5 13h1.5" />
    </>
  ),
  styling: (
    <>
      <path d="M5 20v-8.5a7 7 0 0 1 14 0V20" />
      <path d="M5 15.5c-2 0-3.2-1-3.7-2.6 2 0 3.2 1 3.7 2.6zM19 15.5c2 0 3.2-1 3.7-2.6-2 0-3.2 1-3.7 2.6z" />
    </>
  ),
};

export function EventIcon({ name, size = 24, ...props }: { name: EventIconName; size?: number | string } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      {PATHS[name]}
    </svg>
  );
}

/** Pictogram for a planner need key or a category label. */
export function eventIconFor(keyOrLabel: string): EventIconName {
  const k = keyOrLabel.toLowerCase();
  if (/^(bar|drink|cocktail|mixolog|mobile bar)/.test(k) || /bar|cocktail|mixolog/.test(k)) return "bar";
  if (/cake|candy|donut|dessert|sweet/.test(k)) return "desserts";
  if (/^food|cater|street food|hog|pizza|bbq|buffet/.test(k)) return "catering";
  if (/dj|disco/.test(k)) return "dj";
  if (/music|band|sing|sax|musician|live/.test(k)) return "music";
  if (/video|film|drone/.test(k)) return "videography";
  if (/photo booth|booth/.test(k)) return "photobooth";
  if (/photo|camera/.test(k)) return "photography";
  if (/marquee|tent|venue/.test(k)) return "marquee";
  if (/hire|furniture|equipment|chair|table/.test(k)) return "hire";
  if (/flower|floral|florist/.test(k)) return "flowers";
  if (/light|lighting/.test(k)) return "lighting";
  if (/transport|car|chauffeur|limo|coach/.test(k)) return "transport";
  if (/styl|decor|balloon|arch|ambiance/.test(k)) return "styling";
  return "entertainment";
}
