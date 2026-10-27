// Anyvendor directory data — reconstructed from Booked Events (bookedevents.co.uk).
//
// Provenance
// - "archive": Wayback Machine capture of https://bookedevents.co.uk/ taken
//   2025-03-31 19:56:43 UTC (raw copy in docs/reference/). Names, years,
//   addresses, card categories and "price from" values are copied verbatim.
// - "observed-2025-09-25": vendor slugs/names Root saw on the live site on
//   25 Sep 2026 before the origin began refusing connections.
// - "inferred": industry/category guessed from the business name or original
//   image filename. Shown as unconfirmed; never presented as supplier-stated.
//
// No ratings, reviews, availability or invented prices exist here. Prices are
// historical listings and may be stale. Original logos/photos could not be
// recovered (origin offline, not in the web archive), so cards use monograms.

export const INDUSTRIES = [
  {
    slug: "decor-ambiance",
    name: "Decor & Ambiance",
    categories: ["Balloons", "Decorations", "Flower Walls", "Marquees", "Staging & Lighting", "Technical Services"],
  },
  { slug: "drink-services", name: "Drink Services", categories: ["Mixologists", "Mobile Bars"] },
  {
    slug: "entertainment",
    name: "Entertainment",
    categories: [
      "Bands",
      "Children's Entertainer",
      "Dancers",
      "DJs & Disco",
      "Fireworks",
      "Hypnotist",
      "Magician",
      "Musician",
      "Performers",
      "Saxophonist",
      "Singers",
      "Tribute Act",
    ],
  },
  {
    slug: "event-planning-management",
    name: "Event Planning & Management",
    categories: ["Event Planning", "Masters of Ceremonies", "Toastmasters"],
  },
  {
    slug: "food-services",
    name: "Food Services",
    categories: [
      "Cake Maker",
      "Candy Carts",
      "Caterers",
      "Donuts",
      "Food Trucks",
      "Grazing Tables",
      "Greek",
      "Grills & BBQ",
      "Indian",
      "Italian",
      "Paella",
      "Pizza",
      "Turkish",
    ],
  },
  { slug: "photography-video", name: "Photography & Video", categories: ["Drones", "Photographer", "Videographer"] },
  {
    slug: "transport-logistics",
    name: "Transport & Logistics",
    categories: ["Car Hire", "Chaffeur", "Coach Hire", "Taxi Service"],
  },
  { slug: "unique-services", name: "Unique Services", categories: ["Audio Guestbook", "Paint & Wine Night"] },
] as const;

export const LOCATIONS = ["Essex", "London", "Norfolk", "Suffolk", "Hertfordshire"] as const;

export const EVENT_TYPES = [
  "Anniversaries",
  "Baby Showers",
  "Birthday Parties",
  "Charity Galas",
  "Corporate Events",
  "Engagement Parties",
  "Festivals",
  "Garden Parties",
  "House Parties",
  "Private Parties",
  "Product Launches",
  "Seasonal Events",
  "Weddings",
] as const;

export type IndustrySlug = (typeof INDUSTRIES)[number]["slug"];
export type Location = (typeof LOCATIONS)[number];

export interface Business {
  slug: string;
  name: string;
  established: number;
  /** Address exactly as listed on the archived card, or null for "No Address". */
  address: string | null;
  /** County used by the Location filter, derived from the listed address. */
  region: Location | null;
  /** Categories printed on the archived card (supplier-listed). */
  listedCategories: string[];
  /** Industry/category we inferred when the card showed none. */
  inferred: { industry: IndustrySlug; category?: string; basis: string } | null;
  /** Confirmed from the business's own website/socials during profile research (Oct 2026). */
  verified?: { industry: IndustrySlug; categories: string[]; eventTypes: string[]; sourceUrl: string };
  price: { from: string; unit: string };
  /** Original image path on bookedevents.co.uk (not recoverable yet). */
  originalImage: string;
  sources: ("archive" | "observed-2025-09-25")[];
  note?: string;
}

import taxonomy from "@/data/taxonomy.generated.json";

const UP = "/wp-content/uploads/";

// Order matches the archived homepage carousel.
export const BUSINESSES: Business[] = [
  {
    slug: "grape-fig",
    name: "Grape & Fig",
    established: 2014,
    address: "310-312 Regent Street, W1B 3AU, London",
    region: "London",
    listedCategories: [],
    inferred: { industry: "food-services", category: "Grazing Tables", basis: "original card image was grazingtables.png" },
    price: { from: "£100", unit: "per head" },
    originalImage: UP + "2024/10/grazingtables.png",
    sources: ["archive", "observed-2025-09-25"],
  },
  {
    slug: "harry-de-cruz",
    name: "Harry De Cruz",
    established: 2014,
    address: "London",
    region: "London",
    listedCategories: [],
    inferred: null,
    price: { from: "£500", unit: "per event" },
    originalImage: UP + "2024/12/harry_decruz_thumb.jpg",
    sources: ["archive", "observed-2025-09-25"],
  },
  {
    slug: "paint-and-pour",
    name: "Paint and Pour",
    established: 2015,
    address: "90 High St, Epping CM16 4AE",
    region: "Essex",
    listedCategories: [],
    inferred: { industry: "unique-services", category: "Paint & Wine Night", basis: "business name" },
    price: { from: "£350", unit: "per event" },
    originalImage: UP + "2024/12/paint_and_Pour_thumb.jpg",
    sources: ["archive", "observed-2025-09-25"],
  },
  {
    slug: "natalie-max",
    name: "Natalie & Max",
    established: 2016,
    address: "10 Delfcroft, Ware SG12 0BH",
    region: "Hertfordshire",
    listedCategories: [],
    inferred: null,
    price: { from: "£1000", unit: "per event" },
    originalImage: UP + "2024/10/natandmaxphoto.jpg",
    sources: ["archive", "observed-2025-09-25"],
  },
  {
    slug: "lucy-jane-cakes",
    name: "Lucy Jane Cakes",
    established: 2014,
    address: "Essex",
    region: "Essex",
    listedCategories: [],
    inferred: { industry: "food-services", category: "Cake Maker", basis: "business name" },
    price: { from: "£50", unit: "per event" },
    originalImage: UP + "2024/10/cakes.jpg",
    sources: ["archive", "observed-2025-09-25"],
  },
  {
    slug: "ray-johnson",
    name: "Ray Elton Johnson",
    established: 2009,
    address: "London",
    region: "London",
    listedCategories: [],
    inferred: { industry: "entertainment", category: "Tribute Act", basis: "original image was elton_ray_johnson_tribute_thumb.jpg" },
    price: { from: "£750", unit: "per event" },
    originalImage: UP + "2024/12/elton_ray_johnson_tribute_thumb.jpg",
    sources: ["archive", "observed-2025-09-25"],
  },
  {
    slug: "toot-sweet-candy-cart",
    name: "Toot Sweet Candy Cart",
    established: 2020,
    address: "Essex",
    region: "Essex",
    listedCategories: ["Candy Carts"],
    inferred: null,
    price: { from: "£300", unit: "per event" },
    originalImage: UP + "2024/12/tootsweet_cart.jpg",
    sources: ["archive", "observed-2025-09-25"],
  },
  {
    slug: "jamie-roche",
    name: "Jamie Roche Folk Artist",
    established: 2017,
    address: "London",
    region: "London",
    listedCategories: ["Musician", "Singers"],
    inferred: null,
    price: { from: "£500", unit: "per event" },
    originalImage: UP + "2024/12/jamie_roche_thumb.jpg",
    sources: ["archive", "observed-2025-09-25"],
  },
  {
    slug: "magpie-catering",
    name: "Magpie Catering",
    established: 1995,
    address: "Unit 4, Hastingwood Business Centre, Hastingwood, Essex CM17 9GD",
    region: "Essex",
    listedCategories: [],
    inferred: { industry: "food-services", category: "Caterers", basis: "business name" },
    price: { from: "£500", unit: "per head" },
    originalImage: UP + "2024/10/magpiecatering.jpg",
    sources: ["archive", "observed-2025-09-25"],
    note: "Archived listing shows £500 per head; the unit may be a data-entry error.",
  },
  {
    slug: "calleo",
    name: "Mensah",
    established: 2023,
    address: "London",
    region: "London",
    listedCategories: [],
    inferred: null,
    price: { from: "£338", unit: "per event" },
    originalImage: UP + "2025/02/67c0cf25118b3.jpg",
    sources: ["archive", "observed-2025-09-25"],
    note: "Archived March 2025 as “Calleo”; seen live on 25 Sep 2026 as “Mensah” at the same slug. Name needs confirmation.",
  },
  {
    slug: "tony-poole-discos",
    name: "Tony Poole Discos",
    established: 2010,
    address: "52 Blackacre Rd, Theydon Bois, Epping CM16 7LU",
    region: "Essex",
    listedCategories: [],
    inferred: { industry: "entertainment", category: "DJs & Disco", basis: "business name" },
    price: { from: "£295", unit: "per event" },
    originalImage: UP + "2024/12/tony_poole_discos.jpg",
    sources: ["archive", "observed-2025-09-25"],
  },
  {
    slug: "tm-event-hire",
    name: "TM Event Hire",
    established: 2016,
    address: "Essex",
    region: "Essex",
    listedCategories: [],
    inferred: null,
    price: { from: "£500", unit: "per event" },
    originalImage: UP + "2024/07/tmeventhire-e1729605053143.jpg",
    sources: ["archive", "observed-2025-09-25"],
  },
  {
    slug: "tl-executive-cars",
    name: "T&L Executive Cars",
    established: 2007,
    address: "Thrifts Mead, Theydon Bois CM16 7NE",
    region: "Essex",
    listedCategories: [],
    inferred: { industry: "transport-logistics", category: "Car Hire", basis: "business name" },
    price: { from: "POA", unit: "No Minimum Spend" },
    originalImage: UP + "2024/12/tle_executive_cars_thumb.jpg",
    sources: ["archive", "observed-2025-09-25"],
  },
  {
    slug: "meatstop",
    name: "MEATSTOP",
    established: 2017,
    address: "25 Crown St, Brentwood, CM14 4BA",
    region: "Essex",
    listedCategories: [],
    inferred: { industry: "food-services", basis: "original image was meatstoppatty.png" },
    price: { from: "£500", unit: "per event" },
    originalImage: UP + "2024/09/meatstoppatty.png",
    sources: ["archive", "observed-2025-09-25"],
  },
  {
    slug: "cj-sax",
    name: "CJ Sax",
    established: 2010,
    address: null,
    region: null,
    listedCategories: [],
    inferred: { industry: "entertainment", category: "Saxophonist", basis: "business name" },
    price: { from: "£750", unit: "per event" },
    originalImage: UP + "2024/12/cj_sax_thumb.jpg",
    sources: ["archive", "observed-2025-09-25"],
  },
  {
    slug: "ozzy-stix",
    name: "Ozzy & Stix",
    established: 2010,
    address: "Brentwood, Essex",
    region: "Essex",
    listedCategories: [],
    inferred: null,
    price: { from: "£500", unit: "per event" },
    originalImage: UP + "2024/12/ozzy_stix_thumb.jpg",
    sources: ["archive", "observed-2025-09-25"],
  },
  {
    slug: "the-bar-people",
    name: "The Bar People",
    established: 2014,
    address: "Leytonstone House, Hanbury Dr, Bushwood, London E11 1GA",
    region: "London",
    listedCategories: ["Mixologists", "Mobile Bars"],
    inferred: null,
    price: { from: "£195", unit: "per head" },
    originalImage: UP + "2023/10/the-bar-people-logo.png",
    sources: ["archive", "observed-2025-09-25"],
  },
];

// Archived March 2025 but not in Root's 25 Sep 2026 live observation, plus the
// apparent test listing. Kept for audit only; not published in the directory.
export const AUDIT_ONLY = [
  { slug: "theydon-bois-balti", name: "Theydon Bois Balti House", reason: "archive only; absent from live observation" },
  { slug: "joe-blakes", name: "Joe Blake’s", reason: "archive only; absent from live observation" },
  { slug: "jocee", name: "Jocee", reason: "archive only; absent from live observation" },
  { slug: "the-john-pollock-marquee", name: "The John Pollock Marquee", reason: "archive only; absent from live observation" },
  { slug: "charday-entertainment", name: "Charday Events", reason: "archive only; absent from live observation" },
  { slug: "vish-testing", name: "Vish Testing", reason: "apparent test listing seen live; unverified" },
];

// Industry/categories/event types confirmed from each business's own channels
// during profile research (Oct 2026); see content/profiles/<slug>.json.
const VERIFIED = taxonomy as Record<string, { industry: IndustrySlug; categories: string[]; eventTypes: string[]; sourceUrl: string }>;
for (const b of BUSINESSES) {
  if (VERIFIED[b.slug]) b.verified = VERIFIED[b.slug];
}

export function industryName(slug: string) {
  return INDUSTRIES.find((i) => i.slug === slug)?.name ?? slug;
}

/** Industry for a business: from listed categories, else inferred, else null. */
export function industryOf(b: Business): IndustrySlug | null {
  if (b.verified) return b.verified.industry;
  for (const c of b.listedCategories) {
    const hit = INDUSTRIES.find((i) => (i.categories as readonly string[]).includes(c));
    if (hit) return hit.slug;
  }
  return b.inferred?.industry ?? null;
}

export function categoriesOf(b: Business): string[] {
  if (b.verified?.categories.length) return b.verified.categories;
  if (b.listedCategories.length) return b.listedCategories;
  return b.inferred?.category ? [b.inferred.category] : [];
}

export function getBusiness(slug: string) {
  return BUSINESSES.find((b) => b.slug === slug);
}

export interface Filters {
  industry?: string;
  category?: string;
  location?: string;
  event?: string;
  q?: string;
  /** Plain-English request handled by lib/smartSearch. */
  ask?: string;
}

export function filterBusinesses(f: Filters) {
  // Event types only come from what each business says on its own channels
  // (b.verified); businesses without that evidence never match an event filter.
  const q = f.q?.trim().toLowerCase();
  return BUSINESSES.filter((b) => {
    if (f.event && !b.verified?.eventTypes.includes(f.event)) return false;
    if (f.industry && industryOf(b) !== f.industry) return false;
    if (f.category && !categoriesOf(b).includes(f.category)) return false;
    if (f.location && b.region !== f.location) return false;
    if (q) {
      const hay = [b.name, b.address ?? "", ...categoriesOf(b), industryName(industryOf(b) ?? "")].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// Marketplace products as archived (names, category, price, minimum order).
export const MARKET_PRODUCTS = [
  { name: "iPhone® Case", category: "Merchandise", price: "£18.00", min: 1 },
  { name: "Beach Ball", category: "Merchandise", price: "£2.00 – £10.00", min: 25 },
  { name: "Branded Swimsuit", category: "Merchandise", price: "£35.00", min: 1 },
  { name: "Enamel Mug", category: "Merchandise", price: "£15.00", min: 25 },
  { name: "Notebook & Pen", category: "Uncategorised", price: "£3.00 – £14.99", min: 25 },
  { name: "Tote bag", category: "Event Packages", price: "£16.50", min: 5 },
  { name: "Roller Banners", category: "Signage", price: "£90.00", min: 1 },
  { name: "Custom Canvas", category: "Signage", price: "£21.00 – £155.00", min: 1 },
] as const;
