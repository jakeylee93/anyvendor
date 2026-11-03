import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/supabase/env";

export const runtime = "nodejs";
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS" };

// The site's section manifest (contract v1), public, so a builder can check what AnyVendor expects.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: "not_configured" }, { status: 503, headers: CORS });
  const sb = createClient(cfg.url, cfg.key, { auth: { persistSession: false } });
  const { data } = await sb.rpc("public_site_v1", { p_slug: slug }).maybeSingle();
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404, headers: CORS });
  const d = data as { manifest: unknown; manifest_version: number };
  return NextResponse.json({ schema: "anyvendor.site/v1", manifestVersion: d.manifest_version, manifest: d.manifest }, { headers: { ...CORS, "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" } });
}
