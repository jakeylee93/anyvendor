// The directory profile a business edits under "My profile".

export type Travels = "local" | "regional" | "nationwide" | "international";

export interface VendorProfile {
  displayName: string;
  tagline: string;
  intro: string;
  about: string;
  categories: string[];
  services: { title: string; text: string }[];
  areas: string[];
  travels: Travels;
  priceFrom: string;
  contact: { email: string; phone: string; website: string };
  socials: { instagram: string; facebook: string; tiktok: string; linkedin: string };
}

const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const https = (v: unknown) => {
  const t = s(v, 300);
  return /^https:\/\/[^\s]+$/.test(t) ? t : "";
};

export function normaliseProfile(raw: unknown): VendorProfile {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const c = (r.contact && typeof r.contact === "object" ? r.contact : {}) as Record<string, unknown>;
  const so = (r.socials && typeof r.socials === "object" ? r.socials : {}) as Record<string, unknown>;
  const list = (v: unknown, n: number, max: number) => (Array.isArray(v) ? v : typeof v === "string" ? v.split(/\n|,/) : []).map((x) => s(x, max)).filter(Boolean).slice(0, n);
  const email = s(c.email, 200);
  return {
    displayName: s(r.displayName, 120),
    tagline: s(r.tagline, 140),
    intro: s(r.intro, 400),
    about: s(r.about, 4000),
    categories: list(r.categories, 6, 60),
    services: (Array.isArray(r.services) ? r.services : [])
      .slice(0, 12)
      .map((x) => ({ title: s((x as Record<string, unknown>)?.title, 80), text: s((x as Record<string, unknown>)?.text, 400) }))
      .filter((x) => x.title),
    areas: list(r.areas, 12, 80),
    travels: (["local", "regional", "nationwide", "international"] as Travels[]).includes(r.travels as Travels) ? (r.travels as Travels) : "regional",
    priceFrom: s(r.priceFrom, 60),
    contact: { email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "", phone: s(c.phone, 40), website: https(c.website) },
    socials: { instagram: https(so.instagram), facebook: https(so.facebook), tiktok: https(so.tiktok), linkedin: https(so.linkedin) },
  };
}

export function profileFromForm(form: FormData): VendorProfile {
  const obj: Record<string, unknown> = { services: [], contact: {}, socials: {}, categories: form.getAll("categories").map(String) };
  for (const [k, v] of form.entries()) {
    if (typeof v !== "string" || k === "categories") continue;
    const [a, b, c] = k.split(".");
    if (!b) obj[a] = v;
    else if (a === "contact" || a === "socials") (obj[a] as Record<string, string>)[b] = v;
    else if (a === "services") {
      const i = Number(b);
      if (Number.isInteger(i) && i >= 0 && i < 20) ((obj.services as Record<string, string>[])[i] ??= {})[c] = v;
    }
  }
  obj.services = (obj.services as unknown[]).filter(Boolean);
  return normaliseProfile(obj);
}

/** How complete the profile is, and what to add next. */
export function profileCompleteness(p: VendorProfile) {
  const checks: [boolean, string][] = [
    [Boolean(p.displayName), "your business name"],
    [Boolean(p.tagline), "a tagline"],
    [p.about.length >= 120, "a few lines about you"],
    [p.categories.length > 0, "what you do"],
    [p.services.length >= 2, "at least two services"],
    [p.areas.length > 0, "the areas you cover"],
    [Boolean(p.contact.email || p.contact.phone), "a way to contact you"],
    [Boolean(p.priceFrom), "a starting price"],
  ];
  const done = checks.filter(([ok]) => ok).length;
  return { percent: Math.round((done / checks.length) * 100), next: checks.find(([ok]) => !ok)?.[1] ?? null };
}
