import type { ComponentType } from "react";
import { Balloon, Cake, Camera, CarProfile, Chair, Disc, FilmStrip, FlowerTulip, ForkKnife, Lightbulb, Martini, MaskHappy, MusicNotes, Tent, VideoCamera, type IconProps } from "@phosphor-icons/react/dist/ssr";

/**
 * AnyVendor event icons: designed glyphs from the Phosphor icon library (MIT licence,
 * https://phosphoricons.com) set in the AV navy tile with a cyan two-tone layer.
 * Real vectors, consistent on a shared grid, crisp from 18px chips to 56px hero objects.
 * Switch `WEIGHT` to "fill" or "bold" to change the whole set.
 */
export type EventIconName =
  | "transport" | "catering" | "desserts" | "dj" | "music" | "photography" | "videography" | "entertainment"
  | "hire" | "bar" | "flowers" | "marquee" | "lighting" | "photobooth" | "styling";

export const EVENT_ICON_NAMES: EventIconName[] = ["transport", "catering", "desserts", "dj", "music", "photography", "videography", "entertainment", "hire", "bar", "flowers", "marquee", "lighting", "photobooth", "styling"];

const WEIGHT: IconProps["weight"] = "duotone";

const GLYPHS: Record<EventIconName, ComponentType<IconProps>> = {
  transport: CarProfile, catering: ForkKnife, desserts: Cake, dj: Disc, music: MusicNotes, photography: Camera, videography: VideoCamera,
  entertainment: MaskHappy, hire: Chair, bar: Martini, flowers: FlowerTulip, marquee: Tent, lighting: Lightbulb, photobooth: FilmStrip, styling: Balloon,
};

const LABELS: Record<EventIconName, string> = {
  transport: "Transport", catering: "Catering", desserts: "Desserts", dj: "DJ", music: "Live music", photography: "Photography", videography: "Videography",
  entertainment: "Entertainment", hire: "Hire", bar: "Mobile bar", flowers: "Flowers", marquee: "Marquee", lighting: "Lighting", photobooth: "Photo booth", styling: "Styling",
};

export const eventIconLabel = (name: EventIconName) => LABELS[name];

/** The app-style tile: navy rounded square, white glyph, cyan two-tone layer. Decorative unless `label` is given. */
export function EventIcon({ name, size = 24, label, className = "" }: { name: EventIconName; size?: number; label?: string; className?: string }) {
  const Glyph = GLYPHS[name];
  const radius = Math.round(size * 0.23);
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`av-tile inline-flex shrink-0 items-center justify-center bg-be-navy text-white ${className}`}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <Glyph weight={WEIGHT} size={Math.round(size * 0.58)} />
    </span>
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
