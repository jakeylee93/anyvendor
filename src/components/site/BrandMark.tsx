/**
 * The Anyvendor mark, drawn as geometry rather than type so it is identical
 * everywhere: a heavy A with a crossbar and a V whose left stroke rides the
 * A's right leg, white on a navy tile. Chosen by Jake on 1 Nov 2026 from
 * docs/brand-20261101/logo-sheet-round12-overlap-av-variations.png (option 13).
 * The same points generate public/brand/*.svg and the app icons.
 */

export const AV_BOX = { w: 96, h: 64 };
export const AV_POINTS = {
  aLeft: "0,64 26,0 44,0 18,64",
  aRight: "26,0 44,0 70,64 52,64",
  aBar: "27.75,40 42.25,40 46.3,50 23.7,50",
  vLeft: "34,0 52,0 78,64 60,64",
  vRight: "60,64 78,64 96,0 78,0",
};
export const BRAND = { navy: "#212235", cyan: "#33ccff", white: "#ffffff" };

/** The A and V as two groups so they can animate separately. */
export function AvGlyph({ fill = "currentColor", aFill, vFill }: { fill?: string; aFill?: string; vFill?: string }) {
  return (
    <>
      <g className="brand-a" fill={aFill ?? fill}>
        <polygon points={AV_POINTS.aLeft} />
        <polygon points={AV_POINTS.aRight} />
        <polygon points={AV_POINTS.aBar} />
      </g>
      <g className="brand-v" fill={vFill ?? fill}>
        <polygon points={AV_POINTS.vLeft} />
        <polygon points={AV_POINTS.vRight} />
      </g>
    </>
  );
}

/** The navy tile with the white mark: the app icon and the mark in the header. */
export function AvTile({ className = "", title = "Anyvendor", style }: { className?: string; title?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} role="img" aria-label={title}>
      <rect width="100" height="100" rx="22" fill={BRAND.navy} />
      <g transform="translate(12 24.7) scale(0.7917)">
        <AvGlyph fill={BRAND.white} />
      </g>
    </svg>
  );
}

/** Tile plus the cyan pill wordmark. `animate` plays the build-in once (tile, A, V, pill); reduced motion shows the final state. */
export function BrandLockup({
  animate = false,
  layout = "stacked",
  className = "",
}: {
  animate?: boolean;
  layout?: "stacked" | "row";
  className?: string;
}) {
  const stacked = layout === "stacked";
  return (
    <span className={`${animate ? "brand-anim" : ""} inline-flex ${stacked ? "flex-col items-center gap-4 md:gap-5" : "items-center gap-2.5"} ${className}`}>
      <span className={`brand-tile block ${stacked ? "w-28 md:w-40" : "w-9"}`}>
        <AvTile className="block h-auto w-full" />
      </span>
      <span
        className={`brand-pill inline-flex items-center justify-center rounded-full bg-be-cyan font-bold tracking-tight text-be-navy ${
          stacked ? "px-7 py-2 text-[2rem] md:px-10 md:py-3 md:text-5xl" : "px-3.5 py-1 text-[17px]"
        }`}
      >
        <span className="brand-word leading-none">anyvendor</span>
      </span>
    </span>
  );
}
