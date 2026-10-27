// "What are you looking for?" — turns a plain-English request into directory
// filters. Deterministic keyword understanding (no AI calls, no data sent
// anywhere): services, places, event types, guest numbers and dates.
import { BUSINESSES, categoriesOf, industryOf, type Business, type Location } from "./directory";

const SERVICE_WORDS: [RegExp, { industry?: string; categories?: string[]; label: string }][] = [
  [/\b(cocktails?|mixolog\w*|mobile bars?|bar hire|bars?|drinks?|prosecco|champagne|gin)\b/, { industry: "drink-services", categories: ["Mobile Bars", "Mixologists"], label: "Bars & drinks" }],
  [/\b(dj|djs|disco|discos|dance ?floor|uplighting)\b/, { categories: ["DJs & Disco"], label: "DJs & disco" }],
  [/\b(sax|saxophon\w*)\b/, { categories: ["Saxophonist"], label: "Saxophonist" }],
  [/\b(magic\w*|mind ?read\w*|illusion\w*)\b/, { categories: ["Magician"], label: "Magician" }],
  [/\b(tribute|elton|lookalike)\b/, { categories: ["Tribute Act"], label: "Tribute act" }],
  [/\b(singers?|bands?|musicians?|acoustic|guitar\w*|folk|live music)\b/, { categories: ["Musician", "Singers", "Bands"], label: "Live music" }],
  [/\b(cakes?|cupcakes?|bak\w*)\b/, { categories: ["Cake Maker"], label: "Cakes" }],
  [/\b(sweets?|candy|sweetie|pick ?n ?mix)\b/, { categories: ["Candy Carts"], label: "Sweet & candy carts" }],
  [/\b(grazing|cheese|charcuterie|platters?)\b/, { categories: ["Grazing Tables"], label: "Grazing tables" }],
  [/\b(burgers?|bbq|barbecue|grill\w*)\b/, { categories: ["Grills & BBQ"], label: "Burgers & BBQ" }],
  [/\b(cater\w*|food|canap\w*|buffet|menu|meze|mezze|dinner)\b/, { industry: "food-services", label: "Catering & food" }],
  [/\b(photo\w*)\b/, { categories: ["Photographer"], label: "Photographer" }],
  [/\b(video\w*|film\w*|drone\w*)\b/, { categories: ["Videographer"], label: "Videographer" }],
  [/\b(marquees?|tents?|pagoda|furniture hire)\b/, { categories: ["Marquees"], label: "Marquees" }],
  [/\b(cars?|chauff\w*|transport|transfers?|driver)\b/, { industry: "transport-logistics", label: "Cars & transport" }],
  [/\b(guest ?book|audio guest\w*|voicemail|phone)\b/, { categories: ["Audio Guestbook"], label: "Audio guestbook" }],
  [/\b(paint\w*|sip and paint|art class)\b/, { categories: ["Paint & Wine Night"], label: "Paint & sip" }],
];

const PLACE_WORDS: [RegExp, Location][] = [
  [/\b(essex|epping|brentwood|chelmsford|romford|harlow|loughton|theydon|colchester|southend|basildon|chigwell|dunmow|hastingwood)\b/, "Essex"],
  [/\b(london|shoreditch|dalston|leytonstone|east london|west end|soho|regent street)\b/, "London"],
  [/\b(herts|hertfordshire|ware|hertford|st albans|watford|stevenage)\b/, "Hertfordshire"],
  [/\b(suffolk|ipswich|bury st edmunds)\b/, "Suffolk"],
  [/\b(norfolk|norwich)\b/, "Norfolk"],
];

const EVENT_WORDS: [RegExp, string][] = [
  [/\bwedding|bride|groom|reception\b/, "Weddings"],
  [/\b(birthday|bday|\d{2}(st|nd|rd|th) party)\b/, "Birthday Parties"],
  [/\b(corporate|office|work|company|conference|staff party|awards?)\b/, "Corporate Events"],
  [/\b(christmas|xmas|new year|halloween|seasonal)\b/, "Seasonal Events"],
  [/\bfestival\b/, "Festivals"],
  [/\bgarden party\b/, "Garden Parties"],
  [/\bengagement\b/, "Engagement Parties"],
  [/\banniversar\w*/, "Anniversaries"],
  [/\bbaby shower\b/, "Baby Showers"],
  [/\b(charity|gala)\b/, "Charity Galas"],
  [/\b(launch|brand activation|press day)\b/, "Product Launches"],
  [/\bhouse party\b/, "House Parties"],
  [/\bprivate party\b/, "Private Parties"],
];

export interface Understood {
  services: { industry?: string; categories?: string[]; label: string }[];
  place: Location | null;
  event: string | null;
  guests: number | null;
  date: string | null;
  time: string | null;
}

export function understand(raw: string): Understood {
  const t = ` ${raw.toLowerCase()} `;
  const services = SERVICE_WORDS.filter(([re]) => re.test(t)).map(([, v]) => v);
  const place = PLACE_WORDS.find(([re]) => re.test(t))?.[1] ?? null;
  const event = EVENT_WORDS.find(([re]) => re.test(t))?.[1] ?? null;
  const g = t.match(/\b(\d{2,4})\s*(guests?|people|pax|persons?|heads?)\b/) ?? t.match(/\bfor\s+(\d{2,4})\b/);
  const guests = g ? Number(g[1]) : null;
  const d = t.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b(?:\s+(\d{4}))?/);
  const date = d ? `${Number(d[1])} ${d[2][0].toUpperCase()}${d[2].slice(1)}${d[3] ? ` ${d[3]}` : ""}` : null;
  const tm = t.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  const time = tm ? `${tm[1]}${tm[2] ? `:${tm[2]}` : ""}${tm[3]}` : null;
  return { services, place, event, guests, date, time };
}

/** Score every business against the understood request; best matches first. */
export function smartMatch(u: Understood, list: Business[] = BUSINESSES) {
  const scored = list.map((b) => {
    const cats = categoriesOf(b);
    const ind = industryOf(b);
    let score = 0;
    let serviceHit = u.services.length === 0;
    for (const s of u.services) {
      if (s.categories?.some((c) => cats.includes(c))) {
        score += 3;
        serviceHit = true;
      } else if (s.industry && s.industry === ind) {
        score += 2;
        serviceHit = true;
      }
    }
    if (u.place) score += b.region === u.place ? 2 : 0;
    if (u.event) score += b.verified?.eventTypes.includes(u.event) ? 1 : 0;
    return { b, score, serviceHit };
  });
  return scored
    .filter((x) => x.serviceHit && (!u.place || x.b.region === u.place || x.score >= 3))
    .sort((a, z) => z.score - a.score)
    .map((x) => x.b);
}
