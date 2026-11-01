// Tailored enquiries. The visitor describes their party once; each vendor gets a
// message written for them: their name, what they do and where they are based.
// Deterministic template (no AI calls); nothing leaves the device until the
// visitor copies or emails the message themselves.
import { NEEDS, type Need } from "./plan";

export interface EnquiryEvent {
  ask: string | null;
  event: string | null;
  location: string | null;
  date: string | null;
  guests: number | null;
}

export interface EnquiryVendor {
  name: string;
  categories: string[];
  industry: string | null;
  /** Shortlist tag from the plan, if the visitor saved them for a particular need. */
  need: string | null;
  /** Town the business says it is based in (for the message). */
  place: string | null;
  /** County from the directory listing (for the "do you cover us" check). */
  region: string | null;
  travels: "local" | "regional" | "nationwide" | "international" | null;
}

export interface Brief {
  name: string;
  message: string;
}

/** Which need a vendor answers: the shortlist tag first, then their categories, then their industry. */
export function needFor(v: EnquiryVendor): Need | null {
  if (v.need) {
    const n = NEEDS.find((x) => x.key === v.need);
    if (n) return n;
  }
  const excluded = (n: Need) => n.excludeCategories?.some((c) => v.categories.includes(c)) ?? false;
  for (const n of NEEDS) if (!excluded(n) && n.categories?.some((c) => v.categories.includes(c))) return n;
  for (const n of NEEDS) if (!excluded(n) && n.industry && n.industry === v.industry) return n;
  return null;
}

function article(word: string) {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

/** "Birthday Parties" → "birthday party". */
export function singular(eventType: string) {
  const words = eventType.toLowerCase().split(" ");
  const last = words[words.length - 1];
  words[words.length - 1] = last.endsWith("ies") ? `${last.slice(0, -3)}y` : last.endsWith("s") && !last.endsWith("ss") ? last.slice(0, -1) : last;
  return words.join(" ").replace(/\bchristmas\b/, "Christmas");
}

function parse(d: string | null) {
  const m = d?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

export function longDate(d: string | null) {
  const dt = parse(d);
  return dt ? dt.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : d;
}

export function shortDate(d: string | null) {
  const dt = parse(d);
  return dt ? dt.toLocaleDateString("en-GB", { day: "numeric", month: "long" }) : d;
}

/** One line about what we want from them, by what they do. */
const CATEGORY_LINES: Record<string, string> = {
  "Mobile Bars": "We’re looking for a mobile bar for the day, and yours looks just the kind of thing we have in mind.",
  Mixologists: "We’d love a mixologist and a proper cocktail menu for our guests.",
  "Cake Maker": "We’re after a cake for the day and your work caught our eye.",
  "Candy Carts": "We’d love a sweet cart for our guests.",
  Donuts: "We’d love your donuts for our guests.",
  "Grazing Tables": "We’d love a grazing table for our guests.",
  "Grills & BBQ": "We’d like you to look after the food; a BBQ is exactly what we’re after.",
  Caterers: "We’d like you to look after the food for the day.",
  "Food Trucks": "We’d love your truck at our event to feed our guests.",
  Pizza: "We’d love your pizzas for our guests.",
  Paella: "We’d love your paella for our guests.",
  Greek: "We’d love your Greek food for our guests.",
  Indian: "We’d love your Indian food for our guests.",
  Italian: "We’d love your Italian food for our guests.",
  Turkish: "We’d love your Turkish food for our guests.",
  "DJs & Disco": "We need a DJ to keep the dance floor going into the evening.",
  Saxophonist: "We’d love a saxophonist to play during the drinks and into the evening.",
  Singers: "We’d love a singer for the day; your act looks perfect for what we have in mind.",
  Bands: "We’d love a live band for the evening.",
  Musician: "We’d love live music for the day; your act looks perfect for what we have in mind.",
  Magician: "We’d love to book a magician to mix with our guests.",
  "Tribute Act": "We’d love to book your tribute act for the evening.",
  "Children's Entertainer": "We’d love a children’s entertainer to keep the little ones happy.",
  Hypnotist: "We’d love to book your show for our guests.",
  Fireworks: "We’d love a fireworks display to end the night.",
  Dancers: "We’d love dancers to perform for our guests.",
  Performers: "We’d love to book your act for our guests.",
  Photographer: "We’re looking for a photographer to capture the day.",
  Videographer: "We’d like a videographer to film the day.",
  Drones: "We’d love some drone footage of the venue and the day.",
  Marquees: "We need a marquee for the day, and probably furniture, lighting and a dance floor to go with it.",
  Balloons: "We’d love balloon displays for the venue.",
  Decorations: "We’d like help decorating the venue.",
  "Flower Walls": "We’d love a flower wall for photos.",
  "Staging & Lighting": "We need staging and lighting for the day.",
  "Technical Services": "We need sound, lighting and power looked after on the day.",
  "Car Hire": "We need a car for the day.",
  Chaffeur: "We need a chauffeur-driven car for the day.",
  "Coach Hire": "We need a coach to move our guests on the day.",
  "Taxi Service": "We need taxis for our guests at the end of the night.",
  "Audio Guestbook": "We’d love an audio guestbook so our guests can leave us messages.",
  "Paint & Wine Night": "We’d like to run a paint and sip session for our guests.",
  "Event Planning": "We’d love some help planning and running the day.",
  "Masters of Ceremonies": "We’d love an MC to host the day.",
  Toastmasters: "We’d love a toastmaster for the day.",
};

/** The message for one vendor: greeting, the party (their words or ours), what we want from them, cover check, questions, sign-off. */
export function composeEnquiry(ev: EnquiryEvent, v: EnquiryVendor, brief: Brief): { subject: string; body: string } {
  const need = needFor(v);
  const cat = v.categories.find((c) => CATEGORY_LINES[c]) ?? v.categories[0] ?? null;
  const what = ev.event ? singular(ev.event) : null;
  const msg = brief.message.trim();
  const lower = msg.toLowerCase();
  const mentions = (s: string | null | undefined) => Boolean(s) && lower.includes(String(s).toLowerCase());

  const party: string[] = [];
  if (msg) {
    party.push(msg.replace(/\s+$/, "").replace(/([^.!?])$/, "$1."));
    const extra: string[] = [];
    if (ev.location && !mentions(ev.location)) extra.push(`in ${ev.location}`);
    if (ev.date && !mentions(shortDate(ev.date)) && !mentions(ev.date)) extra.push(`on ${longDate(ev.date)}`);
    if (ev.guests && !mentions(String(ev.guests))) extra.push(`for around ${ev.guests} guests`);
    if (extra.length) party.push(`It’s ${extra.join(", ")}.`);
  } else {
    party.push(
      `I’m planning ${what ? `${article(what)} ${what}` : "an event"}${ev.location ? ` in ${ev.location}` : ""}${ev.date ? ` on ${longDate(ev.date)}` : ""}${ev.guests ? ` for around ${ev.guests} guests` : ""}.`,
    );
  }

  const ask = (cat && CATEGORY_LINES[cat]) || (need ? `We’re looking for ${need.label.toLowerCase()} for the day.` : "We’d love to talk about what you could do for our event.");
  let cover: string | null = null;
  if (ev.location && v.region) {
    if (v.region.toLowerCase() === ev.location.toLowerCase()) cover = `Good to see you’re based in ${ev.location} too.`;
    else if (v.travels !== "nationwide" && v.travels !== "international") cover = `I can see you’re based in ${v.place ?? v.region}; is ${ev.location} somewhere you cover?`;
  }
  const questions = `Could you let me know if you’re available${ev.date ? ` on ${shortDate(ev.date)}` : ""}, what you’d suggest for ${ev.guests ? `around ${ev.guests} guests` : "a group our size"}, and a rough idea of price?`;

  const body = [`Hi ${v.name},`, party.join(" "), [ask, cover].filter(Boolean).join(" "), questions, `Thanks,\n${brief.name.trim() || "[your name]"}`].join("\n\n");
  const subject = `${what ? what[0].toUpperCase() + what.slice(1) : "Event"}${ev.location ? ` in ${ev.location}` : ""}${ev.date ? `, ${shortDate(ev.date)}` : ""} – ${cat ?? need?.label ?? "enquiry"}`;
  return { subject, body };
}
