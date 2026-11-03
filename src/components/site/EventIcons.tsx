/**
 * AnyVendor event icons. The artwork is the OpenArt app-tile set Jake chose on 3 Nov 2026
 * (interim: docs/brand-20261103/icons-sheet-05-refined-gpt.png sliced to public/icons/events/*.webp; final pick pending Jake).
 * Navy rounded tile, bold white glyph, one cyan accent. Vector versions follow once approved.
 */
export type EventIconName =
  | "transport" | "catering" | "desserts" | "dj" | "music" | "photography" | "videography" | "entertainment"
  | "hire" | "bar" | "flowers" | "marquee" | "lighting" | "photobooth" | "styling";

export const EVENT_ICON_NAMES: EventIconName[] = ["transport", "catering", "desserts", "dj", "music", "photography", "videography", "entertainment", "hire", "bar", "flowers", "marquee", "lighting", "photobooth", "styling"];

const LABELS: Record<EventIconName, string> = {
  transport: "Transport", catering: "Catering", desserts: "Desserts", dj: "DJ", music: "Live music", photography: "Photography", videography: "Videography",
  entertainment: "Entertainment", hire: "Hire", bar: "Mobile bar", flowers: "Flowers", marquee: "Marquee", lighting: "Lighting", photobooth: "Photo booth", styling: "Styling",
};

export function eventIconSrc(name: EventIconName) {
  return `/icons/events/${name}.webp`;
}

/** The app-style tile as an image. Decorative by default; pass `alt` to make it meaningful. */
export function EventIcon({ name, size = 24, alt = "", className = "", ...props }: { name: EventIconName; size?: number; alt?: string; className?: string } & Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "width" | "height">) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={eventIconSrc(name)} alt={alt} width={size} height={size} decoding="async" draggable={false} className={`select-none ${className}`} aria-hidden={alt ? undefined : true} {...props} />;
}

export const eventIconLabel = (name: EventIconName) => LABELS[name];

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
