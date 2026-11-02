import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/server";
import { runTarget } from "@/lib/social/publisher";

export const runtime = "nodejs";
export const maxDuration = 300;

function authorised(request: Request) {
  const secret = process.env.CRON_SECRET;
  const got = request.headers.get("authorization") ?? "";
  const want = `Bearer ${secret}`;
  return Boolean(secret) && got.length === want.length && timingSafeEqual(Buffer.from(got), Buffer.from(want));
}

// Vercel Cron (every minute, production deployments only). Bounded: stops claiming after ~4 minutes.
export async function GET(request: Request) {
  if (!authorised(request)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const db = supabaseService();
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!db || !key) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const started = Date.now();
  const tally: Record<string, number> = {};
  while (Date.now() - started < 240_000) {
    const { data: claimed, error } = await db.rpc("claim_due_social_targets", { p_limit: 5 });
    if (error) return NextResponse.json({ error: "claim_failed", tally }, { status: 500 });
    if (!claimed || claimed.length === 0) break;
    for (const t of claimed) {
      let r;
      try {
        r = await runTarget(db, t, key);
      } catch {
        r = { outcome: "permanent_error" as const, error: "The provider didn’t confirm whether this posted. Check the account before posting again." };
      }
      await db.rpc("record_social_target_result", {
        p_target: t.id,
        p_outcome: r.outcome,
        p_external_id: r.externalId ?? null,
        p_external_url: r.externalUrl ?? null,
        p_error: r.error ?? null,
        p_container: r.containerId ?? null,
      });
      tally[r.outcome] = (tally[r.outcome] ?? 0) + 1;
    }
  }
  return NextResponse.json({ ok: true, tally });
}
