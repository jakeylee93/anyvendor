import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/supabase/env";

export const runtime = "nodejs";

// Site content contract v1. Public published content (cached), or the draft with the site's preview token.
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "If-None-Match" };

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: "not_configured" }, { status: 503, headers: CORS });
  const preview = new URL(request.url).searchParams.get("preview");
  const sb = createClient(cfg.url, cfg.key, { auth: { persistSession: false } });

  if (preview) {
    if (!/^[0-9a-f-]{36}$/i.test(preview)) return NextResponse.json({ error: "bad_token" }, { status: 400, headers: CORS });
    const { data } = await sb.rpc("site_draft_v1", { p_slug: slug, p_token: preview }).maybeSingle();
    if (!data) return NextResponse.json({ error: "not_found" }, { status: 404, headers: { ...CORS, "Cache-Control": "no-store" } });
    const d = data as { name: string; slug: string; kind: string; content: unknown; manifest: unknown; manifest_version: number; draft_version: number; updated_at: string };
    return NextResponse.json(
      { schema: "anyvendor.site/v1", mode: "draft", business: { name: d.name, slug: d.slug }, kind: d.kind, manifestVersion: d.manifest_version, manifest: d.manifest, revision: `draft-${d.draft_version}`, updatedAt: d.updated_at, content: d.content },
      { headers: { ...CORS, "Cache-Control": "no-store" } },
    );
  }

  const { data } = await sb.rpc("public_site_v1", { p_slug: slug }).maybeSingle();
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404, headers: { ...CORS, "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } });
  const d = data as { name: string; slug: string; kind: string; content: unknown; manifest: unknown; manifest_version: number; revision_id: string; revision_version: number; published_at: string };
  const etag = `"${d.revision_id}"`;
  const headers = { ...CORS, ETag: etag, "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" };
  if (request.headers.get("if-none-match") === etag) return new NextResponse(null, { status: 304, headers });
  return NextResponse.json(
    { schema: "anyvendor.site/v1", mode: "published", business: { name: d.name, slug: d.slug }, kind: d.kind, manifestVersion: d.manifest_version, manifest: d.manifest, revision: d.revision_id, revisionVersion: d.revision_version, publishedAt: d.published_at, content: d.content },
    { headers },
  );
}
