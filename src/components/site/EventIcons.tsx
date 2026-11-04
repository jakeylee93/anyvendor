/**
 * AnyVendor event marks: the solid black silhouette set Jake approved on 4 Nov 2026
 * (style refs in docs/brand-20261103/refs, sheet icons-sheet-15-solid-set.png, sliced to
 * public/icons/events/*.webp as black glyphs with transparency). No tiles, no colour.
 * `tone="white"` inverts the glyph for dark surfaces. Vector tracing follows once the set is signed off.
 */
export type EventIconName =
  | "transport" | "catering" | "desserts" | "dj" | "music" | "photography" | "videography" | "entertainment"
  | "hire" | "bar" | "flowers" | "marquee" | "lighting" | "photobooth" | "styling";

export const EVENT_ICON_NAMES: EventIconName[] = ["transport", "catering", "desserts", "dj", "music", "photography", "videography", "entertainment", "hire", "bar", "flowers", "marquee", "lighting", "photobooth", "styling"];

const LABELS: Record<EventIconName, string> = {
  transport: "Transport", catering: "Catering", desserts: "Desserts", dj: "DJ", music: "Live music", photography: "Photography", videography: "Videography",
  entertainment: "Entertainment", hire: "Hire", bar: "Mobile bar", flowers: "Flowers", marquee: "Marquee", lighting: "Lighting", photobooth: "Photo booth", styling: "Styling",
};

export const eventIconLabel = (name: EventIconName) => LABELS[name];
export const eventIconSrc = (name: EventIconName) => `/icons/events/${name}.webp`;

/** The mark as an image. Black by default; `tone="white"` for navy surfaces; `tone="navy"` tints it brand navy. Decorative unless `label` is given. */
export function EventIcon({ name, size = 24, tone = "black", label, className = "" }: { name: EventIconName; size?: number; tone?: "black" | "white" | "navy"; label?: string; className?: string }) {
  const filter = tone === "white" ? "invert(1)" : tone === "navy" ? "invert(12%) sepia(18%) saturate(900%) hue-rotate(200deg)" : undefined;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={eventIconSrc(name)} alt={label ?? ""} aria-hidden={label ? undefined : true} width={size} height={size} decoding="async" draggable={false} className={`inline-block shrink-0 select-none ${className}`} style={filter ? { filter } : undefined} />;
}

/** Mark for a planner need key or a category label. */
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
