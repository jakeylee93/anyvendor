import Link from "next/link";
import { MapPin } from "lucide-react";
import { type Business, categoriesOf, industryOf } from "@/lib/directory";
import HoloCard from "./HoloCard";
import { getProfile } from "@/lib/profiles";

const TINTS = [
  ["#33ccff", "#212235"],
  ["#fbb102", "#212235"],
  ["#9966cc", "#ffffff"],
  ["#ff69eb", "#212235"],
  ["#65bc7b", "#212235"],
  ["#212235", "#33ccff"],
];

function initials(name: string) {
  const words = name.replace(/[&]/g, " ").split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
}

/** Stand-in for the original logo/photo, which could not be recovered. */
export function Monogram({ business, className = "" }: { business: Business; className?: string }) {
  const i = [...business.slug].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length;
  const [bg, fg] = TINTS[i];
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ background: `linear-gradient(135deg, ${bg}, ${bg}cc)`, color: fg }}
      role="img"
      aria-label={`${business.name} (original image not yet recovered)`}
    >
      <span className="text-4xl font-bold tracking-tight">{initials(business.name)}</span>
    </div>
  );
}

export function locationLabel(b: Business) {
  return b.address ?? "No Address";
}

/** Foil tints and readable text colour per industry (collectible-card "types"). */
const TYPE_STYLE: Record<string, { tint: [string, string]; text: string }> = {
  "drink-services": { tint: ["#33ccff", "#a78bfa"], text: "#0278b5" },
  "food-services": { tint: ["#fbb102", "#fb7185"], text: "#b45309" },
  entertainment: { tint: ["#ff69eb", "#8b5cf6"], text: "#a21caf" },
  "decor-ambiance": { tint: ["#2dd4bf", "#60a5fa"], text: "#0f766e" },
  "photography-video": { tint: ["#a78bfa", "#f0abfc"], text: "#6d28d9" },
  "transport-logistics": { tint: ["#94a3b8", "#38bdf8"], text: "#334155" },
  "unique-services": { tint: ["#fb7185", "#fbbf24"], text: "#be123c" },
  "event-planning-management": { tint: ["#818cf8", "#22d3ee"], text: "#4338ca" },
};
const DEFAULT_TYPE = { tint: ["#33ccff", "#ff69eb"] as [string, string], text: "#0278b5" };

/** Year and place as the business itself states them; falls back to the 2025 listing only when no profile exists. */
function cardFacts(b: Business) {
  const p = getProfile(b.slug);
  if (!p) return { year: String(b.established), place: locationLabel(b) };
  const year = p.established?.label.match(/\b(19|20)\d{2}\b/)?.[0] ?? null;
  const place = p.basedIn?.text ?? b.region ?? null;
  return { year, place };
}

function LogoSeal({ p }: { p: NonNullable<ReturnType<typeof getProfile>> }) {
  if (!p.logo) return null;
  const wide = p.logo.width / p.logo.height > 1.8;
  const bg = p.logo.plate === "dark" ? "bg-be-deep" : "bg-white";
  return (
    <span
      className={`absolute left-3 top-3 z-[2] flex items-center justify-center shadow-lg ring-[3px] ring-white/90 ${bg} ${
        wide ? "h-12 max-w-[62%] rounded-full px-3" : "h-[68px] w-[68px] rounded-full p-2"
      }`}
    >
      <img src={p.logo.src} alt={`${p.displayName} logo`} className={`max-h-full object-contain ${wide ? "h-6 w-auto" : "h-full w-full"}`} />
    </span>
  );
}

export default function BusinessCard({ business }: { business: Business }) {
  const p = getProfile(business.slug);
  const price = p?.cardPrice ?? business.price;
  const facts = cardFacts(business);
  const cats = categoriesOf(business);
  const industry = industryOf(business);
  const type = (industry && TYPE_STYLE[industry]) || DEFAULT_TYPE;
  const cover = p?.card?.src ?? p?.reel?.outputs.desktop.posterWebp ?? p?.gallery[0]?.src;
  const name = p?.displayName ?? business.name;

  return (
    <Link
      href={`/businesses/${business.slug}`}
      aria-label={`${name}${cats[0] ? `, ${cats[0]}` : ""}${facts.place ? `, ${facts.place}` : ""}`}
      className="group block h-full rounded-[24px] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-be-cyan"
    >
      <HoloCard tint={type.tint}>
        <div className="flex h-full flex-col gap-2">
          <div className="relative aspect-4/3 overflow-hidden rounded-[16px] bg-be-mist">
            {cover ? (
              <img
                src={cover}
                alt={p?.card?.alt ?? ""}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            ) : (
              <Monogram business={business} className="absolute inset-0" />
            )}
            {p && <LogoSeal p={p} />}
            {cats[0] && (
              <span className="absolute right-3 top-3 z-[2] rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-be-navy shadow-sm backdrop-blur">
                {cats[0]}
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col rounded-[16px] bg-white/80 px-4 pb-3 pt-3.5 backdrop-blur-sm">
            <h3 className="truncate text-lg font-bold leading-tight text-be-navy">{name}</h3>
            <p className="mt-0.5 text-xs text-be-grey">{facts.year ? `Est. ${facts.year}` : "\u00a0"}</p>
            {cats.length > 0 && (
              <p className="mt-1 truncate text-[13px] font-semibold" style={{ color: type.text }}>
                {cats.join(" · ")}
              </p>
            )}
            <div className="my-2.5 h-px bg-be-navy/10" />
            <p className="flex min-h-[2.25rem] items-start gap-1.5 text-xs text-be-grey">
              <MapPin size={14} className="mt-px shrink-0" aria-hidden />
              <span className="line-clamp-2">{facts.place ?? "Location on request"}</span>
            </p>
            <div className="mt-auto flex items-baseline justify-between gap-2 rounded-xl bg-be-mist/80 px-3 py-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-be-grey">From</span>
              <span className="truncate text-right">
                <strong className="text-base font-bold text-be-navy">{price.from}</strong>{" "}
                <span className="text-xs text-be-grey">{price.unit}</span>
              </span>
            </div>
          </div>
        </div>
      </HoloCard>
    </Link>
  );
}
