# AnyVendor site content contract v1

For builders of bespoke vendor websites (Floriography Studio, Mr Tee's Mobile Crazy Golf, The Bar People). The vendor edits content in their AnyVendor dashboard; your site reads it back through this contract and keeps its own layout, hero and components. Schema id: `anyvendor.site/v1`.

## Readiness (evidence time 3 Nov 2026, 19:45 UTC)

| Item | State |
| --- | --- |
| Database functions and routes | Source written and tested (83 tests pass, including the contract). |
| Preview deployment of the API | **Not yet deployed.** Source only until the readiness line here says deployed and checked. |
| Your business slug provisioned | Pending the tenancy migration on the live database. Slugs will be `the-bar-people`, `floriography-studio`, `mr-tees-crazy-golf`. |
| Stripe | Not needed for the contract. Published content is served while the business holds an internal test plan or a paid website plan. |

Nothing here is a production URL. Treat the base URL as a testing origin that will change when AnyVendor goes live.

## Base URL and identity

- Testing origin: `https://anyvendor-git-claude-bookedevents-reconstruction-anyos.vercel.app`
- Your site is identified by its **slug** (not a numeric id). Keep it in an env var, e.g. `ANYVENDOR_SITE_SLUG=floriography-studio`.
- The AnyVendor preview sits behind Vercel Authentication, and that protection stays on. **Do not use a Vercel bypass token.** Until AnyVendor has an unprotected host, read content directly from AnyVendor's database API with the adapter below; it needs only:
  - `ANYVENDOR_SUPABASE_URL` = `https://rsqgsnfyusqhtgcwbddc.supabase.co`
  - `ANYVENDOR_SUPABASE_PUBLISHABLE_KEY` = the same value as AnyVendor's `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Codex/Jake can copy it from the AnyVendor Vercel project or the Supabase dashboard; it is public by design and can only call the two read-only functions `public_site_v1` and `site_draft_v1`).
  - `ANYVENDOR_SITE_SLUG` = your slug.
  Later, setting `ANYVENDOR_API_URL` switches the same adapter to the HTTP endpoints with no code change. Read content on the server only.

## Endpoints

### GET `/api/sites/{slug}/content` — published content

```json
{
  "schema": "anyvendor.site/v1",
  "mode": "published",
  "business": { "name": "Floriography Studio", "slug": "floriography-studio" },
  "kind": "bespoke",
  "manifestVersion": 1,
  "manifest": { "version": 1, "sections": [ ... ] },
  "revision": "4b5d…-uuid",
  "revisionVersion": 3,
  "publishedAt": "2026-11-03T21:00:00.000Z",
  "content": {
    "hero": { "headline": "…", "subheadline": "…", "image": { "src": "https://…", "alt": "…" }, "cta": { "href": "https://…", "label": "…" } },
    "services": { "items": [ { "title": "…", "text": "…", "image": { "src": "", "alt": "" } } ] }
  }
}
```

- `404 {"error":"not_found"}` when the slug is unknown, nothing is published yet, or the business has no website plan. Render your built-in fallback content in that case; never crash.
- Caching: `Cache-Control: public, s-maxage=60, stale-while-revalidate=600` and an `ETag` equal to the revision id. Send `If-None-Match` to get `304`.
- CORS: `Access-Control-Allow-Origin: *` (GET only).

### GET `/api/sites/{slug}/content?preview={token}` — draft content

Same shape with `"mode": "draft"` and `"revision": "draft-<n>"`. `Cache-Control: no-store`. The token is a UUID that AnyVendor shows the vendor and staff; the dashboard's **Preview draft** button opens `{your external_url}?preview={token}`. Your site should read `preview` from the query string, fetch the draft with that token and render it with no caching. A wrong token returns `404`. Staff can rotate the token.

### GET `/api/sites/{slug}/manifest`

`{ "schema": "anyvendor.site/v1", "manifestVersion": 1, "manifest": { … } }`. Use it in a build-time check that the content shape still matches what your components expect.

## Manifest (what the vendor can edit)

You own the manifest. It declares sections and typed fields; AnyVendor renders the edit form from it and strips anything not declared. Send it to Codex/Jake as JSON; staff load it with `set_site_manifest`. Changing the manifest bumps `manifestVersion`; existing content is kept and re-normalised against the new shape, so add fields freely and rename with care.

```json
{
  "version": 1,
  "name": "Floriography Studio",
  "sections": [
    {
      "key": "hero", "label": "Hero", "help": "The first thing visitors see.",
      "fields": [
        { "key": "headline", "type": "text", "max": 90 },
        { "key": "subheadline", "type": "textarea", "max": 240 },
        { "key": "image", "type": "image" },
        { "key": "cta", "type": "link" }
      ]
    },
    {
      "key": "services", "label": "Services",
      "fields": [
        { "key": "items", "type": "list", "max": 8, "fields": [
          { "key": "title", "type": "text", "max": 60 },
          { "key": "text", "type": "textarea", "max": 300 },
          { "key": "price", "type": "text", "max": 40 },
          { "key": "image", "type": "image" }
        ] }
      ]
    }
  ]
}
```

Rules: keys are `^[a-z][a-z0-9_]{0,39}$`, unique within their level; at most 40 sections; lists cannot nest lists; `select` needs `options`. Optional on a field: `label`, `help`, `max`, `required` (advisory).

| Type | Value shape | Notes |
| --- | --- | --- |
| `text` | `string` | default max 200 |
| `textarea` | `string` | default max 2000, plain text with newlines |
| `richtext` | `string` | default max 10000; tags are stripped, so treat as paragraphs split on blank lines |
| `number` | `number` | |
| `boolean` | `boolean` | |
| `select` | `string` | one of `options` |
| `image` | `{ "src": string, "alt": string }` | `src` is an https URL on AnyVendor storage (public bucket) or `""`; always handle empty |
| `link` | `{ "href": string, "label": string }` | `href` is https, a site-relative path, `mailto:` or `tel:`, or `""` |
| `list` | `Array<object>` | each row has the sub-fields; empty rows are removed; default max 24 |

Images uploaded by the vendor are JPEG/PNG/WebP up to 8 MB at URLs like `https://rsqgsnfyusqhtgcwbddc.supabase.co/storage/v1/object/public/website-media/<business>/…`. Add that host to your image loader config.

## Keeping your existing values (The Bar People's 17 anyOS keys and similar)

Nothing is lost on migration. Send two files: the manifest, and the current values shaped as `content` above (section → field → value). Staff seed them as draft v1 and publish v1, so the first fetch returns exactly what the site shows today. Map each existing key to a section/field key; keep operational integrations (booking links, phone numbers, forms) as `link`/`text` fields or leave them in your code if the vendor should not edit them. Do not keep a second hard-coded copy of anything you put in the manifest.

## Consuming it (Next.js)

Copy `docs/backend/adapters/anyvendor-site.ts` from the AnyVendor repository into your site as `lib/anyvendor.ts`. It exposes `siteContent()` (published, cached 60 s) and `siteDraft(token)` (no cache), plus `text/image/link/list` helpers that fall back safely.

```ts
// app/page.tsx
import { siteContent, siteDraft, text, image } from "@/lib/anyvendor";

export default async function Home({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const { preview } = await searchParams;
  const site = (preview ? await siteDraft(preview) : null) ?? (await siteContent());
  const c = site?.content ?? null;
  return <Hero headline={text(c, "hero", "headline", "Your fallback headline")} image={image(c, "hero", "image")} draft={site?.mode === "draft"} />;
}
```

Render `mode: "draft"` with a small "Draft preview" badge and `robots: noindex`. The function names and row columns the adapter calls are part of this contract (`public_site_v1(p_slug)`, `site_draft_v1(p_slug, p_token)`), so a hand-written client is fine too.

## Revalidation when the vendor publishes

Polling with `revalidate: 60` is enough. Optionally expose `POST /api/revalidate` on your site; AnyVendor calls it on publish with header `Authorization: Bearer <SITE_REVALIDATE_SECRET>` and body `{"slug":"floriography-studio","revision":"<uuid>"}`. Verify the bearer, then `revalidateTag("anyvendor")`. The secret is shared out of band (env name on your side: `ANYVENDOR_REVALIDATE_SECRET`; on AnyVendor: `SITE_REVALIDATE_SECRET`). Tell Codex your deployed site URL and revalidate URL so staff can store them (`set_site_kind`).

## What stays with AnyVendor

Draft saving, optimistic version checks, revision history and rollback, publish gating by plan, media ownership (files live under the business's own folder) and the audit trail all run server-side through SECURITY DEFINER functions. No service-role key or write credential is ever exposed to a site or browser; sites only read.

## Versioning

- `schema` is `anyvendor.site/v1`. Breaking changes ship as `/v2` endpoints; v1 keeps working for the sites that use it.
- `manifestVersion` increments when your manifest changes. `revision` changes on every publish; `revisionVersion` increments on every draft save.
