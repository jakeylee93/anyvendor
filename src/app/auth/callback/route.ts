import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Magic-link landing: exchanges the one-time code for a session, then goes to a local path only.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/business";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/business";
  const sb = await supabaseServer();
  if (!sb || !code) return NextResponse.redirect(new URL("/business/login?error=link", url.origin));
  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/business/login?error=link", url.origin));
  return NextResponse.redirect(new URL(next, url.origin));
}
