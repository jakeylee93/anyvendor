// Visitor location for the homepage spotlight: a town, county or postcode is enough.
// We never ask for sign-in or browser geolocation just to browse.

export const AREAS = ["London", "Essex", "Hertfordshire", "Kent", "Suffolk", "Norfolk", "Surrey", "Sussex", "Cambridgeshire", "Bedfordshire", "Buckinghamshire", "Berkshire"] as const;
export type Area = (typeof AREAS)[number];

const POSTCODE_AREAS: Record<string, Area> = {
  E: "London", EC: "London", N: "London", NW: "London", SE: "London", SW: "London", W: "London", WC: "London",
  IG: "Essex", RM: "Essex", CM: "Essex", CO: "Essex", SS: "Essex",
  AL: "Hertfordshire", SG: "Hertfordshire", EN: "Hertfordshire", WD: "Hertfordshire", HP: "Buckinghamshire",
  CT: "Kent", DA: "Kent", ME: "Kent", TN: "Kent", BR: "Kent",
  IP: "Suffolk", NR: "Norfolk", CB: "Cambridgeshire", PE: "Cambridgeshire", MK: "Buckinghamshire", LU: "Bedfordshire", SL: "Berkshire", RG: "Berkshire",
  GU: "Surrey", KT: "Surrey", CR: "Surrey", SM: "Surrey", TW: "Surrey", RH: "Sussex", BN: "Sussex", PO: "Sussex",
};

const TOWNS: Record<string, Area> = {
  chelmsford: "Essex", colchester: "Essex", southend: "Essex", basildon: "Essex", brentwood: "Essex", romford: "Essex", ilford: "Essex", harlow: "Essex", epping: "Essex", loughton: "Essex", chigwell: "Essex", "theydon bois": "Essex", braintree: "Essex", witham: "Essex", maldon: "Essex", clacton: "Essex", billericay: "Essex", "saffron walden": "Essex", ongar: "Essex",
  "st albans": "Hertfordshire", watford: "Hertfordshire", hertford: "Hertfordshire", ware: "Hertfordshire", hoddesdon: "Hertfordshire", stevenage: "Hertfordshire", hitchin: "Hertfordshire", "bishop's stortford": "Hertfordshire", "bishops stortford": "Hertfordshire", hemel: "Hertfordshire", "welwyn": "Hertfordshire", hatfield: "Hertfordshire", cheshunt: "Hertfordshire",
  croydon: "London", stratford: "London", camden: "London", islington: "London", hackney: "London", greenwich: "London", wimbledon: "London", richmond: "London", chingford: "London", walthamstow: "London", enfield: "London",
  canterbury: "Kent", maidstone: "Kent", dartford: "Kent", "tunbridge wells": "Kent", ashford: "Kent",
  ipswich: "Suffolk", "bury st edmunds": "Suffolk", norwich: "Norfolk", cambridge: "Cambridgeshire", brighton: "Sussex", guildford: "Surrey", reading: "Berkshire", luton: "Bedfordshire", "milton keynes": "Buckinghamshire",
};

export interface VisitorLocation {
  /** What the visitor typed, tidied. */
  label: string;
  /** The county/region we matched it to, if any. */
  area: Area | null;
}

export function parseLocation(raw: string | null | undefined): VisitorLocation | null {
  const q = (raw ?? "").trim().replace(/\s+/g, " ").slice(0, 60);
  if (!q) return null;
  const pc = q.toUpperCase().match(/^([A-Z]{1,2})\d/);
  if (pc && POSTCODE_AREAS[pc[1]]) return { label: q.toUpperCase(), area: POSTCODE_AREAS[pc[1]] };
  const low = q.toLowerCase();
  const area = AREAS.find((a) => a.toLowerCase() === low);
  if (area) return { label: area, area };
  for (const [town, a] of Object.entries(TOWNS)) if (low === town || low.startsWith(town + ",") || low.startsWith(town + " ")) return { label: q.replace(/\b\w/g, (c) => c.toUpperCase()), area: a };
  const inside = AREAS.find((a) => low.includes(a.toLowerCase()));
  return { label: q.replace(/\b\w/g, (c) => c.toUpperCase()), area: inside ?? null };
}

export interface CoverageLike {
  travels?: "local" | "regional" | "nationwide" | "international" | string | null;
  areas?: string[];
  base?: string | null;
}

/** True when a vendor's stated coverage reaches the visitor's location. Nationwide and international always do. */
export function covers(cov: CoverageLike | null | undefined, loc: VisitorLocation): boolean {
  if (!cov) return false;
  if (cov.travels === "nationwide" || cov.travels === "international") return true;
  const hay = [...(cov.areas ?? []), cov.base ?? ""].join(" | ").toLowerCase();
  if (loc.area && hay.includes(loc.area.toLowerCase())) return true;
  const label = loc.label.toLowerCase();
  if (label.length >= 3 && !/^[a-z]{1,2}\d/.test(label) && hay.includes(label)) return true;
  if (/uk-wide|nationwide|england|south east/.test(hay) && loc.area && ["London", "Essex", "Hertfordshire", "Kent", "Surrey", "Sussex"].includes(loc.area)) return true;
  return false;
}
