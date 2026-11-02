// Fetches a fresh Search Console snapshot for one connection (service role only).
import type { SupabaseClient } from "@supabase/supabase-js";
import { decryptToken, encryptToken } from "@/lib/security/tokens";
import { refreshGoogle } from "@/lib/social/providers";
import { fetchSummary } from "./searchConsole";

export async function refreshSeoSnapshot(db: SupabaseClient, connectionId: string, key: string): Promise<"saved" | "no_site" | "reconnect" | "error"> {
  const { data: conn } = await db.from("provider_connections").select("id, business_id, settings, status").eq("id", connectionId).single();
  const site = (conn?.settings as { site?: string } | null)?.site;
  if (!conn || conn.status !== "connected") return "reconnect";
  if (!site) return "no_site";
  const { data: tok } = await db.from("provider_tokens").select("refresh_ciphertext").eq("connection_id", connectionId).maybeSingle();
  if (!tok?.refresh_ciphertext || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return "reconnect";
  try {
    const fresh = await refreshGoogle(decryptToken(tok.refresh_ciphertext, key), process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    await db.from("provider_tokens").update({ access_ciphertext: encryptToken(fresh.accessToken, key), access_expires_at: fresh.expiresAt, updated_at: new Date().toISOString() }).eq("connection_id", connectionId);
    const s = await fetchSummary(fresh.accessToken, site);
    const { error } = await db.from("seo_snapshots").insert({
      business_id: conn.business_id, connection_id: conn.id, site_url: site, period_start: s.periodStart, period_end: s.periodEnd,
      clicks: s.clicks, impressions: s.impressions, ctr: s.ctr, position: s.position, top_queries: s.topQueries,
    });
    return error ? "error" : "saved";
  } catch (e) {
    if ((e as { auth?: boolean }).auth || /Google refresh failed \(400\)/.test((e as Error).message)) {
      await db.from("provider_connections").update({ status: "needs_reconnect", last_error: "Google access was revoked or expired.", updated_at: new Date().toISOString() }).eq("id", connectionId);
      return "reconnect";
    }
    return "error";
  }
}
