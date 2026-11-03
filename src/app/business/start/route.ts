import { NextResponse, type NextRequest } from "next/server";
import { isInterval, isPlanCode } from "@/lib/business/plans";
import { supabaseServer } from "@/lib/supabase/server";
import { backendReady } from "@/lib/supabase/env";

// Entry point from pricing: carries the chosen plan and interval through sign-in and set-up
// to the account page, where the owner confirms and (when billing is connected) pays.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan");
  const interval = url.searchParams.get("interval") ?? "month";
  if (!isPlanCode(plan) || !isInterval(interval)) return NextResponse.redirect(new URL("/pricing", url.origin));
  const q = `plan=${plan}&interval=${interval}`;
  if (!backendReady()) return NextResponse.redirect(new URL(`/business/login?next=${encodeURIComponent(`/business/start?${q}`)}`, url.origin));
  const sb = await supabaseServer();
  const { data } = await sb!.auth.getUser();
  if (!data.user) return NextResponse.redirect(new URL(`/business/login?next=${encodeURIComponent(`/business/start?${q}`)}`, url.origin));
  const { data: memberships } = await sb!.from("memberships").select("business_id").limit(1);
  if (!memberships?.length) return NextResponse.redirect(new URL(`/business/new?${q}`, url.origin));
  return NextResponse.redirect(new URL(`/business/account?${q}`, url.origin));
}
