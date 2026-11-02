import { createHash, randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { businessContext } from "@/lib/business/data";
import { PROVIDERS, authorizeUrl, type ProviderKey } from "@/lib/social/providers";
import { signState } from "@/lib/security/tokens";

export const runtime = "nodejs";

// Starts the owner's OAuth consent for THEIR OWN account. Nothing is posted or granted here.
export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const origin = new URL(request.url).origin;
  if (!(provider in PROVIDERS)) return NextResponse.json({ error: "unknown_provider" }, { status: 404 });
  const p = provider as ProviderKey;
  const back = PROVIDERS[p].module === "seo" ? "/business/seo" : "/business/marketing";
  const ctx = await businessContext();
  if (ctx.mode !== "live" || !ctx.business) return NextResponse.redirect(new URL(`${back}?demo=1`, origin));
  const [idEnv, secretEnv] = PROVIDERS[p].env;
  const clientId = process.env[idEnv];
  const app = process.env.APP_URL?.replace(/\/$/, "");
  const stateSecret = process.env.OAUTH_STATE_SECRET;
  if (!clientId || !process.env[secretEnv] || !app || !stateSecret || !process.env.TOKEN_ENCRYPTION_KEY) {
    return NextResponse.redirect(new URL(`${back}?error=connect_not_configured`, origin));
  }
  const { data: allowed } = await ctx.sb.rpc("has_module", { p_business: ctx.business.id, p_module: PROVIDERS[p].module });
  if (!allowed) return NextResponse.redirect(new URL(`${back}?error=plan_required`, origin));

  const nonce = randomUUID();
  const verifier = p === "google_search_console" ? randomBytes(32).toString("base64url") : "";
  const state = signState({ businessId: ctx.business.id, userId: ctx.userId, provider: p, nonce, exp: Date.now() + 10 * 60_000 }, stateSecret);
  const url = authorizeUrl(p, {
    clientId,
    redirectUri: `${app}/api/connect/${p}/callback`,
    state,
    codeChallenge: verifier ? createHash("sha256").update(verifier).digest("base64url") : undefined,
  });
  const res = NextResponse.redirect(url);
  res.cookies.set("av_oauth", `${nonce}.${verifier}`, { httpOnly: true, secure: true, sameSite: "lax", path: "/api/connect", maxAge: 600 });
  return res;
}
