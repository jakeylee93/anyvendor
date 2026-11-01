import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import SwipeDeck, { type SwipeCard } from "@/components/site/SwipeDeck";
import { DEFAULT_TYPE, TYPE_STYLE, cardFacts } from "@/components/site/BusinessCard";
import { iconFor } from "@/components/site/icons";
import { BUSINESSES, categoriesOf, industryOf, type Business } from "@/lib/directory";
import { getProfile } from "@/lib/profiles";
import { needByKey, planFromParams, suggestFor } from "@/lib/plan";

export const metadata: Metadata = { title: "Swipe to shortlist — Anyvendor" };

type SP = Promise<{ [key: string]: string | string[] | undefined }>;

function toCard(b: Business, need: string | null): SwipeCard {
  const p = getProfile(b.slug);
  const cats = categoriesOf(b);
  const industry = industryOf(b);
  const type = (industry && TYPE_STYLE[industry]) || DEFAULT_TYPE;
  const facts = cardFacts(b);
  const travels = p?.coverage.travels ?? null;
  const travelLabel =
    travels === "international" ? "travels worldwide" : travels === "nationwide" ? "travels UK-wide" : travels === "regional" ? `covers ${p!.coverage.areas.slice(0, 2).join(" & ")}` : null;
  const reel = p?.reelQuality === "high" ? p.reel?.outputs.mobile : undefined;
  return {
    slug: b.slug,
    name: p?.displayName ?? b.name,
    categories: cats,
    year: facts.year,
    place: facts.place,
    travels,
    travelLabel,
    price: p?.cardPrice ?? b.price ?? null,
    cover: p?.card?.src ?? p?.reel?.outputs.mobile.posterWebp ?? p?.gallery[0]?.src ?? null,
    video: reel?.video ?? null,
    logo: p?.logo ? { src: p.logo.src, plate: p.logo.plate } : null,
    need,
    icon: iconFor(industry, cats[0]),
    tint: type.tint,
    text: type.text,
  };
}

/** The deck follows the visitor's plan (needs, place, occasion) when it arrives with one; otherwise it is every vendor. */
export default async function SwipePage({ searchParams }: { searchParams: SP }) {
  const req = planFromParams(await searchParams);
  const needKeys = req.needs.length ? req.needs : req.ask ? ["bar", "food", "music", "photo"] : [];
  const needs = needKeys.map(needByKey).filter(Boolean) as NonNullable<ReturnType<typeof needByKey>>[];

  let cards: SwipeCard[];
  if (needs.length) {
    // Take the best pick for each need first, then the second picks, so the deck mixes what they asked for.
    const lists = needs.map((n) => suggestFor(n, req.location, req.event, 60).map((s) => ({ b: s.business, need: n.key })));
    const seen = new Set<string>();
    cards = [];
    const longest = Math.max(0, ...lists.map((l) => l.length));
    for (let i = 0; i < longest; i++) {
      for (const l of lists) {
        const e = l[i];
        if (e && !seen.has(e.b.slug)) {
          seen.add(e.b.slug);
          cards.push(toCard(e.b, e.need));
        }
      }
    }
  } else {
    const local = (b: Business) => (req.location && b.region === req.location ? 1 : 0);
    cards = [...BUSINESSES].sort((a, z) => local(z) - local(a)).map((b) => toCard(b, null));
  }
  const context = [...needs.map((n) => n.label), req.location, req.event].filter(Boolean).join(" · ") || null;

  return (
    <SiteShell>
      <SwipeDeck cards={cards} context={context} />
    </SiteShell>
  );
}
