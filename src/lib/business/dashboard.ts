// Home dashboard widgets and each person's saved arrangement.

export type WidgetId = "website" | "requests" | "marketing" | "next_posts" | "insights" | "ticker" | "weather" | "profile" | "brand";

export const WIDGETS: { id: WidgetId; title: string; wide: boolean }[] = [
  { id: "ticker", title: "At a glance", wide: true },
  { id: "website", title: "Your website", wide: true },
  { id: "marketing", title: "Marketing points", wide: false },
  { id: "requests", title: "Website requests", wide: false },
  { id: "next_posts", title: "Coming up", wide: false },
  { id: "weather", title: "Weather", wide: false },
  { id: "insights", title: "Tips and news", wide: true },
  { id: "profile", title: "My profile", wide: false },
  { id: "brand", title: "Brand", wide: false },
];

export interface LayoutItem {
  id: WidgetId;
  hidden: boolean;
}

export const DEFAULT_LAYOUT: LayoutItem[] = WIDGETS.map((w) => ({ id: w.id, hidden: false }));

/** Saved order first (known widgets only), then any new widgets, never duplicates. */
export function resolveLayout(saved: unknown): LayoutItem[] {
  const known = new Set(WIDGETS.map((w) => w.id));
  const out: LayoutItem[] = [];
  const seen = new Set<string>();
  if (Array.isArray(saved)) {
    for (const s of saved.slice(0, 30)) {
      const id = (s as { id?: unknown })?.id;
      if (typeof id === "string" && known.has(id as WidgetId) && !seen.has(id)) {
        seen.add(id);
        out.push({ id: id as WidgetId, hidden: Boolean((s as { hidden?: unknown }).hidden) });
      }
    }
  }
  for (const w of WIDGETS) if (!seen.has(w.id)) out.push({ id: w.id, hidden: false });
  return out;
}
