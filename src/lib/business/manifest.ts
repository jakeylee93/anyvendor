// Site content manifest (contract v1). A bespoke site declares its editable sections and
// fields; the AnyVendor editor renders a form from it and the site reads the published
// content back through /api/sites/{slug}/content.

export type FieldType = "text" | "textarea" | "richtext" | "image" | "link" | "number" | "boolean" | "select" | "list";

export interface Field {
  key: string;
  label?: string;
  type: FieldType;
  help?: string;
  max?: number;
  options?: string[];
  fields?: Field[];
  required?: boolean;
}

export interface Section {
  key: string;
  label?: string;
  help?: string;
  fields: Field[];
}

export interface Manifest {
  version: 1;
  name?: string;
  sections: Section[];
}

export type ImageValue = { src: string; alt: string };
export type LinkValue = { href: string; label: string };
export type FieldValue = string | number | boolean | ImageValue | LinkValue | Record<string, unknown>[];
export type SiteContent = Record<string, Record<string, FieldValue>>;

const KEY = /^[a-z][a-z0-9_]{0,39}$/;
const TYPES: FieldType[] = ["text", "textarea", "richtext", "image", "link", "number", "boolean", "select", "list"];

/** Validates a manifest from a site builder. Returns the problems found (empty means valid). */
export function manifestProblems(raw: unknown): string[] {
  const out: string[] = [];
  const m = raw as Partial<Manifest> | null;
  if (!m || typeof m !== "object") return ["Manifest must be an object."];
  if (m.version !== 1) out.push('version must be 1.');
  if (!Array.isArray(m.sections) || m.sections.length === 0) return [...out, "sections must be a non-empty array."];
  const seen = new Set<string>();
  const checkFields = (fields: unknown, where: string, depth: number) => {
    if (!Array.isArray(fields) || fields.length === 0) return out.push(`${where}: fields must be a non-empty array.`);
    const keys = new Set<string>();
    for (const f of fields as Field[]) {
      if (!f || !KEY.test(String(f.key))) out.push(`${where}: field key "${f?.key}" must be lowercase letters, digits or _ (max 40).`);
      if (keys.has(f?.key)) out.push(`${where}: duplicate field key "${f.key}".`);
      keys.add(f?.key);
      if (!TYPES.includes(f?.type)) out.push(`${where}.${f?.key}: unknown type "${f?.type}".`);
      if (f?.type === "select" && (!Array.isArray(f.options) || !f.options.length)) out.push(`${where}.${f.key}: select needs options.`);
      if (f?.type === "list") {
        if (depth >= 1) out.push(`${where}.${f.key}: lists cannot contain lists.`);
        else checkFields(f.fields, `${where}.${f.key}`, depth + 1);
      }
    }
  };
  for (const s of m.sections as Section[]) {
    if (!s || !KEY.test(String(s.key))) out.push(`Section key "${s?.key}" must be lowercase letters, digits or _.`);
    if (seen.has(s?.key)) out.push(`Duplicate section key "${s.key}".`);
    seen.add(s?.key);
    checkFields(s?.fields, s?.key ?? "?", 0);
  }
  if ((m.sections as Section[]).length > 40) out.push("At most 40 sections.");
  return out;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : typeof v === "number" ? String(v) : "");
const https = (v: unknown) => {
  const t = str(v, 1000);
  return /^https:\/\/[^\s]+$/.test(t) || /^\/[a-z0-9/_.-]*$/i.test(t) || /^mailto:[^\s]+$/.test(t) || /^tel:[+\d\s]+$/.test(t) ? t : "";
};
const cleanRich = (v: unknown, max: number) => str(v, max).replace(/<[^>]*>/g, "");

function cleanValue(f: Field, raw: unknown): FieldValue {
  switch (f.type) {
    case "text": return str(raw, f.max ?? 200);
    case "textarea": return str(raw, f.max ?? 2000);
    case "richtext": return cleanRich(raw, f.max ?? 10000);
    case "number": { const n = Number(raw); return Number.isFinite(n) ? n : 0; }
    case "boolean": return raw === true || raw === "true" || raw === "on";
    case "select": return f.options?.includes(String(raw)) ? String(raw) : (f.options?.[0] ?? "");
    case "image": { const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>; const src = https(o.src); return { src, alt: src ? str(o.alt, 200) : "" }; }
    case "link": { const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>; return { href: https(o.href), label: str(o.label, 80) }; }
    case "list": {
      const items = Array.isArray(raw) ? raw : [];
      return items.slice(0, f.max ?? 24).map((it) => {
        const o = (it && typeof it === "object" ? it : {}) as Record<string, unknown>;
        const row: Record<string, unknown> = {};
        for (const sub of f.fields ?? []) row[sub.key] = cleanValue(sub, o[sub.key]);
        return row;
      }).filter((row) => Object.values(row).some((v) => (typeof v === "object" && v ? Object.values(v as object).some(Boolean) : Boolean(v))));
    }
  }
}

/** Content cleaned against the manifest: unknown sections and fields are dropped. */
export function normaliseByManifest(manifest: Manifest, raw: unknown): SiteContent {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out: SiteContent = {};
  for (const s of manifest.sections) {
    const sec = (r[s.key] && typeof r[s.key] === "object" ? r[s.key] : {}) as Record<string, unknown>;
    out[s.key] = {};
    for (const f of s.fields) out[s.key][f.key] = cleanValue(f, sec[f.key]);
  }
  return out;
}

/** Builds content from the editor form. Field names: `<section>.<field>`, list rows `<section>.<field>.<i>.<sub>`, images `<section>.<field>.src|alt`. */
export function contentFromManifestForm(manifest: Manifest, form: FormData, uploads: Record<string, string> = {}): SiteContent {
  const raw: Record<string, Record<string, unknown>> = {};
  for (const [k, v] of form.entries()) {
    if (typeof v !== "string") continue;
    const parts = k.split(".");
    if (parts.length < 2) continue;
    const [sk, fk, ...rest] = parts;
    raw[sk] ??= {};
    if (rest.length === 0) raw[sk][fk] = v;
    else if (rest.length === 1) { (raw[sk][fk] ??= {}) as Record<string, unknown>; (raw[sk][fk] as Record<string, unknown>)[rest[0]] = v; }
    else if (rest.length === 2 || rest.length === 3) {
      const i = Number(rest[0]);
      if (!Number.isInteger(i) || i < 0 || i > 40) continue;
      const list = (raw[sk][fk] ??= []) as Record<string, unknown>[];
      const row = (list[i] ??= {});
      if (rest.length === 2) row[rest[1]] = v;
      else ((row[rest[1]] ??= {}) as Record<string, unknown>)[rest[2]] = v;
    }
  }
  for (const [path, src] of Object.entries(uploads)) {
    const [sk, fk, ...rest] = path.split(".");
    raw[sk] ??= {};
    if (rest.length === 0) ((raw[sk][fk] ??= {}) as Record<string, unknown>).src = src;
    else { const list = (raw[sk][fk] ??= []) as Record<string, unknown>[]; const row = (list[Number(rest[0])] ??= {}); ((row[rest[1]] ??= {}) as Record<string, unknown>).src = src; }
  }
  for (const sec of Object.values(raw)) for (const [k, v] of Object.entries(sec)) if (Array.isArray(v)) sec[k] = v.filter(Boolean);
  return normaliseByManifest(manifest, raw);
}

export const HOSTED_MANIFEST: Manifest = {
  version: 1,
  name: "AnyVendor hosted template",
  sections: [
    { key: "hero", label: "Top of the page", fields: [{ key: "headline", type: "text", max: 120 }, { key: "intro", type: "textarea", max: 300 }, { key: "image", type: "image" }] },
    { key: "about", label: "About", fields: [{ key: "text", type: "richtext", max: 3000 }] },
    { key: "services", label: "Services", fields: [{ key: "items", type: "list", max: 12, fields: [{ key: "title", type: "text", max: 80 }, { key: "text", type: "textarea", max: 400 }] }] },
    { key: "gallery", label: "Gallery", fields: [{ key: "images", type: "list", max: 24, fields: [{ key: "image", type: "image" }] }] },
    { key: "contact", label: "Contact", fields: [{ key: "email", type: "text", max: 200 }, { key: "phone", type: "text", max: 40 }, { key: "area", type: "text", max: 120 }, { key: "booking", type: "link" }] },
  ],
};

/** Starter manifest for a bespoke site until its builder sends the real one. */
export const STARTER_MANIFEST: Manifest = {
  version: 1,
  name: "Starter (replace with the site's own manifest)",
  sections: [
    { key: "hero", label: "Hero", fields: [{ key: "headline", type: "text", max: 120 }, { key: "subheadline", type: "textarea", max: 300 }, { key: "image", type: "image" }, { key: "cta", type: "link" }] },
    { key: "about", label: "About", fields: [{ key: "title", type: "text", max: 120 }, { key: "text", type: "richtext", max: 4000 }] },
    { key: "services", label: "Services", fields: [{ key: "items", type: "list", max: 12, fields: [{ key: "title", type: "text", max: 80 }, { key: "text", type: "textarea", max: 400 }, { key: "image", type: "image" }] }] },
    { key: "gallery", label: "Gallery", fields: [{ key: "images", type: "list", max: 30, fields: [{ key: "image", type: "image" }] }] },
    { key: "testimonials", label: "Testimonials", fields: [{ key: "items", type: "list", max: 12, fields: [{ key: "quote", type: "textarea", max: 600 }, { key: "name", type: "text", max: 80 }] }] },
    { key: "contact", label: "Contact", fields: [{ key: "email", type: "text", max: 200 }, { key: "phone", type: "text", max: 40 }, { key: "area", type: "text", max: 160 }, { key: "booking", type: "link" }] },
    { key: "seo", label: "Search", fields: [{ key: "title", type: "text", max: 70 }, { key: "description", type: "textarea", max: 160 }] },
  ],
};
