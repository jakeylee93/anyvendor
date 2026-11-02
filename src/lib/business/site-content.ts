// Structured content for an AnyVendor-hosted website. Validated on the server before
// every save so the database only ever holds this shape.

export interface SiteContent {
  headline: string;
  intro: string;
  heroImage: string;
  about: string;
  services: { title: string; text: string }[];
  gallery: { src: string; alt: string }[];
  contact: { email: string; phone: string; area: string; bookingUrl: string };
  accent: "cyan" | "amber" | "navy" | "rose" | "emerald";
}

export const ACCENTS: Record<SiteContent["accent"], string> = {
  cyan: "#33ccff",
  amber: "#fbb102",
  navy: "#212235",
  rose: "#f43f5e",
  emerald: "#10b981",
};

export const EMPTY_CONTENT: SiteContent = {
  headline: "",
  intro: "",
  heroImage: "",
  about: "",
  services: [],
  gallery: [],
  contact: { email: "", phone: "", area: "", bookingUrl: "" },
  accent: "cyan",
};

const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const url = (v: unknown) => {
  const t = s(v, 600);
  return /^https:\/\/[^\s]+$/.test(t) || /^\/[a-z0-9/_.-]+$/i.test(t) ? t : "";
};
const email = (v: unknown) => {
  const t = s(v, 200);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? t : "";
};

export function normaliseContent(raw: unknown): SiteContent {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const c = (r.contact && typeof r.contact === "object" ? r.contact : {}) as Record<string, unknown>;
  const accent = (Object.keys(ACCENTS) as SiteContent["accent"][]).includes(r.accent as SiteContent["accent"]) ? (r.accent as SiteContent["accent"]) : "cyan";
  return {
    headline: s(r.headline, 120),
    intro: s(r.intro, 300),
    heroImage: url(r.heroImage),
    about: s(r.about, 3000),
    services: (Array.isArray(r.services) ? r.services : [])
      .slice(0, 12)
      .map((x) => ({ title: s((x as Record<string, unknown>)?.title, 80), text: s((x as Record<string, unknown>)?.text, 400) }))
      .filter((x) => x.title),
    gallery: (Array.isArray(r.gallery) ? r.gallery : [])
      .slice(0, 24)
      .map((x) => ({ src: url((x as Record<string, unknown>)?.src), alt: s((x as Record<string, unknown>)?.alt, 160) }))
      .filter((x) => x.src),
    contact: { email: email(c.email), phone: s(c.phone, 40), area: s(c.area, 120), bookingUrl: url(c.bookingUrl) },
    accent,
  };
}

/** Builds content from form fields named like services.0.title, gallery.1.src, contact.email. */
export function contentFromForm(form: FormData): SiteContent {
  const obj: Record<string, unknown> = { services: [], gallery: [], contact: {} };
  for (const [k, v] of form.entries()) {
    if (typeof v !== "string") continue;
    const parts = k.split(".");
    if (parts.length === 1) obj[k] = v;
    else if (parts[0] === "contact") (obj.contact as Record<string, string>)[parts[1]] = v;
    else if (parts[0] === "services" || parts[0] === "gallery") {
      const list = obj[parts[0]] as Record<string, string>[];
      const i = Number(parts[1]);
      if (Number.isInteger(i) && i >= 0 && i < 30) (list[i] ??= {})[parts[2]] = v;
    }
  }
  obj.services = (obj.services as unknown[]).filter(Boolean);
  obj.gallery = (obj.gallery as unknown[]).filter(Boolean);
  return normaliseContent(obj);
}
