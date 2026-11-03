import type { SVGProps } from "react";

/**
 * AnyVendor event icons in the app-tile language of the AV mark: a navy rounded-square tile,
 * one bold custom white glyph built from solid shapes and negative space, and one small cyan
 * accent. Drawn on a 64-unit grid; crisp from 24px chips to 56px hero objects.
 */
export type EventIconName =
  | "transport" | "catering" | "desserts" | "dj" | "music" | "photography" | "videography" | "entertainment"
  | "hire" | "bar" | "flowers" | "marquee" | "lighting" | "photobooth" | "styling";

export const EVENT_ICON_NAMES: EventIconName[] = ["transport", "catering", "desserts", "dj", "music", "photography", "videography", "entertainment", "hire", "bar", "flowers", "marquee", "lighting", "photobooth", "styling"];

const NAVY = "var(--tile, #212235)";
const WHITE = "var(--glyph, #ffffff)";
const CYAN = "var(--accent, #33ccff)";

const GLYPHS: Record<EventIconName, React.ReactNode> = {
  transport: (
    <>
      <path fill={WHITE} d="M12 36c0-2 1-3.5 3-4l5-9.5c.8-1.5 2.2-2.5 4-2.5h16c1.8 0 3.2 1 4 2.5l5 9.5c2 .5 3 2 3 4v6a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3z" />
      <circle cx="22" cy="45" r="5.5" fill={NAVY} />
      <circle cx="42" cy="45" r="5.5" fill={NAVY} />
      <circle cx="22" cy="45" r="2.2" fill={WHITE} />
      <circle cx="42" cy="45" r="2.2" fill={WHITE} />
      <path fill={NAVY} d="M22.5 31.5 25.6 25h12.8l3.1 6.5z" />
      <rect x="47" y="34" width="5" height="3.5" rx="1.5" fill={CYAN} />
    </>
  ),
  catering: (
    <>
      <path fill={WHITE} d="M13 38a19 19 0 0 1 38 0z" />
      <rect x="10" y="40" width="44" height="5.5" rx="2.75" fill={WHITE} />
      <rect x="30.5" y="13" width="3" height="7" rx="1.5" fill={WHITE} />
      <circle cx="32" cy="13" r="3.2" fill={CYAN} />
    </>
  ),
  desserts: (
    <>
      <rect x="13" y="38" width="38" height="13" rx="3.5" fill={WHITE} />
      <rect x="19" y="26" width="26" height="12" rx="3.5" fill={WHITE} />
      <path fill={NAVY} d="M19 31c2 0 2 2.4 4 2.4s2-2.4 4-2.4 2 2.4 4 2.4 2-2.4 4-2.4 2 2.4 4 2.4 2-2.4 4-2.4v2.2H19z" opacity=".35" />
      <rect x="30.4" y="15" width="3.2" height="9" rx="1.6" fill={WHITE} />
      <path fill={CYAN} d="M32 7.5c2.2 2.4 3.2 4 3.2 5.6a3.2 3.2 0 1 1-6.4 0c0-1.6 1-3.2 3.2-5.6z" />
    </>
  ),
  dj: (
    <>
      <rect x="9" y="21" width="46" height="22" rx="6" fill={WHITE} />
      <circle cx="22" cy="32" r="7" fill={NAVY} />
      <circle cx="42" cy="32" r="7" fill={NAVY} />
      <circle cx="22" cy="32" r="2" fill={WHITE} />
      <circle cx="42" cy="32" r="2" fill={WHITE} />
      <rect x="30" y="27" width="4" height="10" rx="2" fill={NAVY} />
      <rect x="29" y="30.5" width="6" height="3" rx="1.5" fill={CYAN} />
    </>
  ),
  music: (
    <>
      <ellipse cx="24" cy="44" rx="8" ry="6.5" fill={WHITE} transform="rotate(-20 24 44)" />
      <rect x="29" y="14" width="4.5" height="30" rx="2" fill={WHITE} />
      <path fill={WHITE} d="M33.5 14c6 1.5 10 5 10 11 0 2.5-.6 4-1.6 5.6-.8-3.6-3.6-6-8.4-7.4z" />
      <circle cx="43" cy="19" r="3.2" fill={CYAN} />
    </>
  ),
  photography: (
    <>
      <rect x="9" y="21" width="46" height="30" rx="7" fill={WHITE} />
      <path fill={WHITE} d="M23 21.5 26 15h12l3 6.5z" />
      <circle cx="32" cy="36" r="10" fill={NAVY} />
      <circle cx="32" cy="36" r="6.5" fill={WHITE} />
      <circle cx="32" cy="36" r="3.2" fill={NAVY} />
      <circle cx="48" cy="28" r="2.6" fill={CYAN} />
    </>
  ),
  videography: (
    <>
      <rect x="8" y="21" width="32" height="24" rx="6" fill={WHITE} />
      <path fill={WHITE} d="M41 30.5 56 22v22l-15-8.5z" />
      <circle cx="21" cy="33" r="5.5" fill={NAVY} />
      <circle cx="21" cy="33" r="2" fill={WHITE} />
      <circle cx="33" cy="27.5" r="2.6" fill={CYAN} />
    </>
  ),
  entertainment: (
    <>
      <path fill={WHITE} d="M17 15c9 4 21 4 30 0v19a15 15 0 0 1-30 0z" />
      <ellipse cx="25.5" cy="27" rx="3.6" ry="2.4" fill={NAVY} />
      <ellipse cx="38.5" cy="27" rx="3.6" ry="2.4" fill={NAVY} />
      <path fill={NAVY} d="M23 35c2.6 3.6 5.6 5.2 9 5.2s6.4-1.6 9-5.2c-2.6 1.4-5.6 2-9 2s-6.4-.6-9-2z" />
      <path fill={CYAN} d="m47 9 1.5 3.4 3.7.4-2.8 2.5.8 3.6L47 17l-3.2 1.9.8-3.6-2.8-2.5 3.7-.4z" />
    </>
  ),
  hire: (
    <>
      <path fill={WHITE} d="M20 12h7a3 3 0 0 1 3 3v17H20z" />
      <rect x="20" y="31" width="26" height="8" rx="3" fill={WHITE} />
      <rect x="20" y="39" width="6" height="14" rx="2" fill={WHITE} />
      <rect x="40" y="39" width="6" height="14" rx="2" fill={WHITE} />
      <rect x="23" y="27" width="22" height="4" rx="2" fill={CYAN} />
    </>
  ),
  bar: (
    <>
      <path fill={WHITE} d="M13 16h38a2 2 0 0 1 1.5 3.3L34.5 39v8h8a2.5 2.5 0 0 1 0 5h-21a2.5 2.5 0 0 1 0-5h8v-8L11.5 19.3A2 2 0 0 1 13 16z" />
      <circle cx="36.5" cy="27" r="3.6" fill={CYAN} />
    </>
  ),
  flowers: (
    <>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx="32" cy="16" rx="5" ry="7.5" fill={WHITE} transform={`rotate(${a} 32 25)`} />
      ))}
      <circle cx="32" cy="25" r="4.2" fill={CYAN} />
      <rect x="30" y="35" width="4" height="18" rx="2" fill={WHITE} />
      <path fill={WHITE} d="M30 46c-6 0-10-3-11-8 6 0 10 3 11 8z" />
    </>
  ),
  marquee: (
    <>
      <path fill={WHITE} d="M32 12 56 32H8z" />
      <path fill={WHITE} d="M12 32h40v18a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2z" />
      <path fill={NAVY} d="M12 32c2.5 3.2 5 3.2 7.5 0 2.5 3.2 5 3.2 7.5 0 2.5 3.2 5 3.2 7.5 0 2.5 3.2 5 3.2 7.5 0 2.5 3.2 5 3.2 7.5 0 2.5 3.2 5 3.2 2.5 0V34H12z" opacity=".35" />
      <rect x="27" y="38" width="10" height="14" rx="2" fill={NAVY} />
      <path fill={CYAN} d="M32 6v7l6-3.5z" />
    </>
  ),
  lighting: (
    <>
      <circle cx="30" cy="27" r="11" fill={WHITE} />
      <circle cx="30" cy="27" r="5" fill={NAVY} />
      <path fill={CYAN} d="M40 21 57 13v28l-17-8z" opacity=".9" />
      <rect x="27.8" y="37" width="4.4" height="13" rx="2" fill={WHITE} transform="rotate(14 30 43)" />
      <rect x="18" y="48" width="22" height="5" rx="2.5" fill={WHITE} />
    </>
  ),
  photobooth: (
    <>
      <rect x="16" y="10" width="32" height="44" rx="6" fill={WHITE} />
      <rect x="22" y="17" width="20" height="31" rx="2.5" fill={NAVY} />
      <path fill={WHITE} d="M24.5 17h6c0 10 .6 20-2 31h-4z" />
      <path fill={WHITE} d="M33.5 17h6c0 10 .6 20-2 31h-4z" />
      <rect x="43" y="24" width="8" height="20" rx="2" fill={CYAN} />
      <rect x="45" y="27" width="4" height="4" rx="1" fill={NAVY} />
      <rect x="45" y="34" width="4" height="4" rx="1" fill={NAVY} />
    </>
  ),
  styling: (
    <>
      <path fill={WHITE} d="M12 54V34a20 20 0 0 1 40 0v20h-9V34a11 11 0 0 0-22 0v20z" />
      <circle cx="12" cy="29" r="5" fill={CYAN} />
      <circle cx="52" cy="29" r="5" fill={CYAN} />
      <circle cx="32" cy="12" r="3.5" fill={WHITE} />
    </>
  ),
};

/** Glyph only (white shapes); use inside your own tile. */
export function EventGlyph({ name }: { name: EventIconName }) {
  return <>{GLYPHS[name]}</>;
}

/** The full app-style tile. `tone="light"` draws a navy glyph on a pale tile for use on white chips. */
export function EventIcon({ name, size = 24, tone = "navy", ...props }: { name: EventIconName; size?: number | string; tone?: "navy" | "light" | "white" } & SVGProps<SVGSVGElement>) {
  const style =
    tone === "light"
      ? ({ "--tile": "#e6f8ff", "--glyph": "#212235", "--accent": "#33ccff" } as React.CSSProperties)
      : tone === "white"
        ? ({ "--tile": "#ffffff", "--glyph": "#212235", "--accent": "#33ccff" } as React.CSSProperties)
        : undefined;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden style={style} {...props}>
      <rect width="64" height="64" rx="15" fill={NAVY} />
      {GLYPHS[name]}
    </svg>
  );
}

/** Pictogram for a planner need key or a category label. */
export function eventIconFor(keyOrLabel: string): EventIconName {
  const k = keyOrLabel.toLowerCase();
  if (/bar|cocktail|mixolog|drink/.test(k)) return "bar";
  if (/cake|candy|donut|dessert|sweet/.test(k)) return "desserts";
  if (/^food|cater|street food|hog|pizza|bbq|buffet/.test(k)) return "catering";
  if (/dj|disco/.test(k)) return "dj";
  if (/music|band|sing|sax|musician|live/.test(k)) return "music";
  if (/photo booth|booth/.test(k)) return "photobooth";
  if (/photo|camera/.test(k)) return "photography";
  if (/video|film|drone/.test(k)) return "videography";
  if (/marquee|tent|venue/.test(k)) return "marquee";
  if (/hire|furniture|equipment|chair|table/.test(k)) return "hire";
  if (/flower|floral|florist/.test(k)) return "flowers";
  if (/light|lighting/.test(k)) return "lighting";
  if (/transport|car|chauffeur|limo|coach/.test(k)) return "transport";
  if (/styl|decor|balloon|arch|ambiance|different|unique|extra/.test(k)) return "styling";
  return "entertainment";
}
