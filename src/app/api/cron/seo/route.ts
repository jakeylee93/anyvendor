import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";
import { refreshSeoSnapshot } from "@/lib/seo/refresh";

export const runtime = "nodejs";
export const maxDuration = 300;

// Daily Search Console snapshot for every connected business that still has SEO on its plan.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const got = request.headers.get("authorization") ?? "";
  const want = `Bearer ${secret}`;
  if (!secret || got.length !== want.length || !timingSafeEqual(Buffer.from(got), Buffer.from(want))) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const db = supabaseService();
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!db || !key) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const { data: conns } = await db.from("provider_connections").select("id, business_id").eq("provider", "google_search_console").eq("status", "connected").limit(500);
  const tally: Record<string, number> = {};
  const started = Date.now();
  for (const c of conns ?? []) {
    if (Date.now() - started > 240_000) break;
    const { data: onPlan } = await db.rpc("has_module", { p_business: c.business_id, p_module: "seo" });
    const r = onPlan ? await refreshSeoSnapshot(db, c.id, key) : "not_on_plan";
    tally[r] = (tally[r] ?? 0) + 1;
  }
  return NextResponse.json({ ok: true, tally });
}
