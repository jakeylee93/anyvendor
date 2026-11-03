// AnyVendor site content adapter (contract v1). Drop this file into your Next.js site as lib/anyvendor.ts.
//
// It reads published or draft content for ONE business and returns the anyvendor.site/v1 shape.
// Two transports, chosen by environment:
//   1. ANYVENDOR_API_URL          — the AnyVendor app (used once it has an unprotected host). Optional today.
//   2. ANYVENDOR_SUPABASE_URL +   — direct read through AnyVendor's database API with the PUBLISHABLE key.
//      ANYVENDOR_SUPABASE_PUBLISHABLE_KEY
//      The publishable key is public by design (it ships in AnyVendor's own browser bundle). It can only
//      call the two read-only functions below; it cannot write and it is not the service-role key.
// Required in both cases: ANYVENDOR_SITE_SLUG (e.g. floriography-studio).
// Call this on the server only (Server Components, route handlers, generateMetadata).

export type ImageValue = { src: string; alt: string };
export type LinkValue = { href: string; label: string };
export type FieldValue = string | number | boolean | ImageValue | LinkValue | Record<string, unknown>[];
export type SiteContent = Record<string, Record<string, FieldValue>>;

export interface SiteV1 {
  schema: "anyvendor.site/v1";
  mode: "published" | "draft";
  business: { name: string; slug: string };
  kind: "hosted" | "external" | "bespoke";
  manifestVersion: number;
  manifest: unknown;
  revision: string;
  revisionVersion?: number;
  publishedAt?: string;
  updatedAt?: string;
  content: SiteContent;
}

const slug = () => process.env.ANYVENDOR_SITE_SLUG ?? "";
const UUID = /^[0-9a-f-]{36}$/i;

/** Published content, cached for 60 seconds. Returns null when nothing is published (render your fallback). */
export async function siteContent(): Promise<SiteV1 | null> {
  return read(null);
}

/** Draft content for `?preview=<token>`. Never cached. Returns null for a wrong token. */
export async function siteDraft(previewToken: string | undefined | null): Promise<SiteV1 | null> {
  if (!previewToken || !UUID.test(previewToken)) return null;
  return read(previewToken);
}

async function read(preview: string | null): Promise<SiteV1 | null> {
  if (!slug()) throw new Error("ANYVENDOR_SITE_SLUG is not set");
  const api = process.env.ANYVENDOR_API_URL?.replace(/\/$/, "");
  if (api) {
    const res = await fetch(`${api}/api/sites/${slug()}/content${preview ? `?preview=${encodeURIComponent(preview)}` : ""}`, preview ? { cache: "no-store" } : { next: { revalidate: 60, tags: ["anyvendor"] } });
    return res.ok ? ((await res.json()) as SiteV1) : null;
  }
  const url = process.env.ANYVENDOR_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.ANYVENDOR_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Set ANYVENDOR_API_URL, or ANYVENDOR_SUPABASE_URL and ANYVENDOR_SUPABASE_PUBLISHABLE_KEY");
  const fn = preview ? "site_draft_v1" : "public_site_v1";
  const body = preview ? { p_slug: slug(), p_token: preview } : { p_slug: slug() };
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    ...(preview ? { cache: "no-store" as const } : { next: { revalidate: 60, tags: ["anyvendor"] } }),
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as Record<string, unknown>[];
  const d = rows[0];
  if (!d) return null;
  return preview
    ? { schema: "anyvendor.site/v1", mode: "draft", business: { name: d.name as string, slug: d.slug as string }, kind: d.kind as SiteV1["kind"], manifestVersion: d.manifest_version as number, manifest: d.manifest, revision: `draft-${d.draft_version}`, updatedAt: d.updated_at as string, content: (d.content ?? {}) as SiteContent }
    : { schema: "anyvendor.site/v1", mode: "published", business: { name: d.name as string, slug: d.slug as string }, kind: d.kind as SiteV1["kind"], manifestVersion: d.manifest_version as number, manifest: d.manifest, revision: d.revision_id as string, revisionVersion: d.revision_version as number, publishedAt: d.published_at as string, content: (d.content ?? {}) as SiteContent };
}

/** Typed helpers so components never crash on missing content. */
export const text = (c: SiteContent | null, section: string, field: string, fallback = "") => {
  const v = c?.[section]?.[field];
  return typeof v === "string" && v ? v : fallback;
};
export const image = (c: SiteContent | null, section: string, field: string, fallback?: ImageValue): ImageValue | null => {
  const v = c?.[section]?.[field] as ImageValue | undefined;
  return v && typeof v === "object" && "src" in v && v.src ? v : fallback ?? null;
};
export const link = (c: SiteContent | null, section: string, field: string, fallback?: LinkValue): LinkValue | null => {
  const v = c?.[section]?.[field] as LinkValue | undefined;
  return v && typeof v === "object" && "href" in v && v.href ? v : fallback ?? null;
};
export const list = <T extends Record<string, unknown>>(c: SiteContent | null, section: string, field: string, fallback: T[] = []): T[] => {
  const v = c?.[section]?.[field];
  return Array.isArray(v) && v.length ? (v as T[]) : fallback;
};
