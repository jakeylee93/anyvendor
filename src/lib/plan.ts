// Event planner: "tell us about your party" → a short suggestion list per need.
// Deterministic (no AI calls, nothing sent anywhere). Suggests two or three
// vendors per need rather than letting a visitor message everyone at once.
import { BUSINESSES, INDUSTRIES, categoriesOf, industryOf, type Business, type Location } from "./directory";
import { getProfile } from "./profiles";
import { understand, type Understood } from "./smartSearch";

export interface Need {
  key: string;
  label: string;
  /** Section heading on the plan page */
  heading: string;
  /** lucide icon name, resolved in the UI */
  icon: string;
  categories?: string[];
  industry?: string;
  excludeCategories?: string[];
}

export const NEEDS: Need[] = [
  { key: "bar", heading: "For your bar", label: "Bar", icon: "Wine", industry: "drink-services", categories: ["Mobile Bars", "Mixologists"] },
  { key: "food", heading: "For the food", label: "Food", icon: "Utensils", industry: "food-services", excludeCategories: ["Cake Maker", "Candy Carts", "Donuts"] },
  { key: "desserts", heading: "For dessert", label: "Desserts", icon: "Cake", categories: ["Cake Maker", "Candy Carts", "Donuts"] },
  { key: "music", heading: "For the music", label: "DJ & music", icon: "Music", categories: ["DJs & Disco", "Musician", "Singers", "Bands", "Saxophonist"] },
  { key: "photo", heading: "For photos & video", label: "Photo & video", icon: "Camera", industry: "photography-video" },
  { key: "marquee", heading: "For your marquee & hire", label: "Marquee & hire", icon: "Tent", industry: "decor-ambiance", categories: ["Marquees"] },
  { key: "entertainment", heading: "For entertainment", label: "Entertainment", icon: "Sparkles", categories: ["Magician", "Tribute Act", "Performers", "Children's Entertainer", "Hypnotist", "Fireworks", "Dancers"] },
  { key: "transport", heading: "For transport", label: "Transport", icon: "Car", industry: "transport-logistics" },
  { key: "extras", heading: "For something different", label: "Something different", icon: "Star", industry: "unique-services" },
];

export function needByKey(key: string) {
  return NEEDS.find((n) => n.key === key);
}

function matchesNeed(b: Business, n: Need): number {
  const cats = categoriesOf(b);
  const ind = industryOf(b);
  if (n.excludeCategories?.some((c) => cats.includes(c))) return 0;
  if (n.categories?.some((c) => cats.includes(c))) return 3;
  if (n.industry && n.industry === ind) return 2;
  return 0;
}

/** Which needs a plain-English request implies. */
export function needsFromUnderstood(u: Understood): string[] {
  const keys = new Set<string>();
  const industryOfCat = (c: string) => INDUSTRIES.find((i) => (i.categories as readonly string[]).includes(c))?.slug;
  for (const s of u.services) {
    const cats = s.categories ?? [];
    const inds = new Set<string>([s.industry, ...cats.map(industryOfCat)].filter(Boolean) as string[]);
    for (const n of NEEDS) {
      if (n.excludeCategories && cats.length && cats.every((c) => n.excludeCategories!.includes(c))) continue;
      if (n.categories?.some((c) => cats.includes(c))) keys.add(n.key);
      else if (n.industry && inds.has(n.industry) && (!n.categories || !cats.length)) keys.add(n.key);
    }
  }
  return [...keys];
}

export interface Suggestion {
  business: Business;
  reasons: string[];
  best: boolean;
}

export function suggestFor(need: Need, place: Location | null, event: string | null, limit = 3): Suggestion[] {
  const scored = BUSINESSES.map((b) => {
    const m = matchesNeed(b, need);
    if (!m) return null;
    const p = getProfile(b.slug);
    const reasons: string[] = [];
    let score = m;
    if (place && b.region === place) {
      score += 2;
      reasons.push(`Based in ${place}`);
    } else if (p?.areasServed.some((a) => /nationwide|uk/i.test(a))) {
      score += 1;
      reasons.push("Covers the UK");
    }
    if (event && b.verified?.eventTypes.includes(event)) {
      score += 1;
      reasons.push(event);
    }
    if (p?.reel) {
      score += 0.5;
      reasons.push("Showreel");
    }
    if (p?.cardPrice) {
      score += 0.25;
      reasons.push(`From ${p.cardPrice.from}`);
    }
    return { business: b, score, reasons };
  }).filter(Boolean) as { business: Business; score: number; reasons: string[] }[];
  scored.sort((a, z) => z.score - a.score);
  return scored.slice(0, limit).map((s, i) => ({ business: s.business, reasons: s.reasons.slice(0, 3), best: i === 0 && scored.length > 1 }));
}

export interface PlanRequest {
  ask: string | null;
  needs: string[];
  location: Location | null;
  date: string | null;
  guests: number | null;
  event: string | null;
}

/** Build a plan request from query params, filling gaps from the free-text ask. */
export function planFromParams(sp: Record<string, string | string[] | undefined>): PlanRequest {
  const one = (k: string) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v)?.trim() || null;
  };
  const ask = one("ask");
  const u = ask ? understand(ask) : null;
  const rawNeeds = sp.needs;
  const explicit = (Array.isArray(rawNeeds) ? rawNeeds : (rawNeeds ?? "").split(",")).map((s) => s.trim()).filter((k) => needByKey(k));
  const needs = explicit.length ? explicit : u ? needsFromUnderstood(u) : [];
  const locRaw = one("location");
  const location = (locRaw && (["Essex", "London", "Norfolk", "Suffolk", "Hertfordshire"] as const).find((l) => l === locRaw)) || u?.place || null;
  const guestsRaw = one("guests");
  return {
    ask,
    needs,
    location,
    date: one("date") || u?.date || null,
    guests: guestsRaw && /^\d+$/.test(guestsRaw) ? Number(guestsRaw) : (u?.guests ?? null),
    event: one("event") || u?.event || null,
  };
}
