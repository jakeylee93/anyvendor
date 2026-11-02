import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { businessContext } from "@/lib/business/data";
import { PROVIDERS, exchangeCode, type ProviderKey } from "@/lib/social/providers";
import { encryptToken, verifyState } from "@/lib/security/tokens";
import { supabaseService } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const url = new URL(request.url);
  if (!(provider in PROVIDERS)) return NextResponse.json({ error: "unknown_provider" }, { status: 404 });
  const p = provider as ProviderKey;
  const back = PROVIDERS[p].module === "seo" ? "/business/seo" : "/business/social";
  const fail = (code = "connect_failed") => {
    const res = NextResponse.redirect(new URL(`${back}?error=${code}`, url.origin));
    res.cookies.delete({ name: "av_oauth", path: "/api/connect" });
    return res;
  };

  const stateSecret = process.env.OAUTH_STATE_SECRET;
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  const app = process.env.APP_URL?.replace(/\/$/, "");
  const [idEnv, secretEnv] = PROVIDERS[p].env;
  const db = supabaseService();
  if (!stateSecret || !key || !app || !db || !process.env[idEnv] || !process.env[secretEnv]) return fail("connect_not_configured");
  if (url.searchParams.get("error")) return fail();

  const state = verifyState(url.searchParams.get("state") ?? "", stateSecret);
  const [nonce, verifier] = ((await cookies()).get("av_oauth")?.value ?? ".").split(".");
  const code = url.searchParams.get("code")?.replace(/#_$/, "");
  if (!state || state.provider !== p || !state.nonce || state.nonce !== nonce || !code) return fail();

  // The person finishing consent must be the person who started it, and still a member.
  const ctx = await businessContext();
  if (ctx.mode !== "live" || ctx.userId !== state.userId || !ctx.businesses.some((b) => b.id === state.businessId)) return fail();

  try {
    const acct = await exchangeCode(p, {
      code,
      clientId: process.env[idEnv]!,
      clientSecret: process.env[secretEnv]!,
      redirectUri: `${app}/api/connect/${p}/callback`,
      verifier: verifier || undefined,
    });
    const { data: conn, error } = await db
      .from("provider_connections")
      .upsert(
        {
          business_id: state.businessId,
          provider: p,
          external_account_id: acct.accountId,
          display_name: acct.displayName,
          account_type: acct.accountType,
          scopes: acct.scopes,
          status: "connected",
          last_error: null,
          token_expires_at: acct.expiresAt,
          settings: acct.settings,
          connected_by: state.userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "business_id,provider,external_account_id" },
      )
      .select("id")
      .single();
    if (error || !conn) return fail();
    const tok = await db.from("provider_tokens").upsert({
      connection_id: conn.id,
      access_ciphertext: encryptToken(acct.accessToken, key),
      refresh_ciphertext: acct.refreshToken ? encryptToken(acct.refreshToken, key) : null,
      access_expires_at: acct.expiresAt,
      updated_at: new Date().toISOString(),
    });
    if (tok.error) return fail();
  } catch {
    return fail();
  }
  const res = NextResponse.redirect(new URL(`${back}?connected=${p}`, url.origin));
  res.cookies.delete({ name: "av_oauth", path: "/api/connect" });
  return res;
}
