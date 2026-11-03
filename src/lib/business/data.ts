// Server-side loaders for the business area. All reads use the signed-in user's
// client, so row-level security decides what comes back.
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { backendReady } from "@/lib/supabase/env";
import { accessFor, type Access, type InternalPlan, type SubscriptionRow } from "./plans";
import type { RequestScope, RequestStatus } from "./requests";
import { DEMO_BUSINESS, demoRequests } from "./demo";

export const BUSINESS_COOKIE = "av_business";

export interface BusinessRow {
  id: string;
  name: string;
  slug: string;
  directory_slug: string | null;
  timezone: string;
  role: "owner" | "editor";
}

export interface RequestRow {
  id: string;
  ref: number;
  title: string;
  status: RequestStatus;
  kind: "update" | "feature";
  scope: RequestScope;
  submitted_at: string;
  due_at: string;
  completed_at: string | null;
  preview_url: string | null;
}

export type Supa = NonNullable<Awaited<ReturnType<typeof supabaseServer>>>;

export type BusinessContext =
  | { mode: "demo"; business: BusinessRow; businesses: BusinessRow[]; staff: false; email: null }
  | { mode: "live"; sb: Supa; userId: string; email: string | null; staff: boolean; businesses: BusinessRow[]; business: BusinessRow | null; actingAsStaff: boolean };

/** Resolves the signed-in user and their selected business. Redirects to sign-in when needed. */
export const businessContext = cache(async function businessContext(): Promise<BusinessContext> {
  const demoCookie = (await cookies()).get("av_demo")?.value === "1";
  if (!backendReady() || demoCookie) return { mode: "demo", business: DEMO_BUSINESS, businesses: [DEMO_BUSINESS], staff: false, email: null };
  const sb = (await supabaseServer())!;
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/business/login");
  const { data } = await sb
    .from("memberships")
    .select("role, businesses(id, name, slug, directory_slug, timezone)")
    .eq("user_id", user.id);
  const businesses: BusinessRow[] = (data ?? [])
    .map((m) => {
      const b = (Array.isArray(m.businesses) ? m.businesses[0] : m.businesses) as Omit<BusinessRow, "role"> | null;
      return b ? { ...b, role: m.role as BusinessRow["role"] } : null;
    })
    .filter((b): b is BusinessRow => b !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
  const { data: staff } = await sb.rpc("is_staff");
  const wanted = (await cookies()).get(BUSINESS_COOKIE)?.value;
  let business = businesses.find((b) => b.id === wanted) ?? null;
  let actingAsStaff = false;
  // Staff may view a business they are not a member of, only after an explicit, logged switch (selectBusiness).
  if (!business && wanted && staff) {
    const { data: other } = await sb.from("businesses").select("id, name, slug, directory_slug, timezone").eq("id", wanted).maybeSingle();
    if (other) {
      business = { ...(other as Omit<BusinessRow, "role">), role: "editor" };
      actingAsStaff = true;
    }
  }
  if (!business) business = businesses[0] ?? null;
  return { mode: "live", sb, userId: user.id, email: user.email ?? null, staff: Boolean(staff), businesses, business, actingAsStaff };
});

/** Same as businessContext but guarantees a selected business (else sends them to create one). */
export async function requireBusiness() {
  const ctx = await businessContext();
  if (ctx.mode === "live" && !ctx.business) redirect("/business/new");
  return ctx as Extract<BusinessContext, { mode: "demo" }> | (Extract<BusinessContext, { mode: "live" }> & { business: BusinessRow });
}

export async function loadAccess(ctx: BusinessContext): Promise<Access> {
  if (ctx.mode === "demo") return { plan: "social", status: "demo", source: null, modules: ["listing", "website", "requests", "seo", "social"], notice: null };
  if (!ctx.business) return accessFor([]);
  const [{ data }, { data: internal }] = await Promise.all([
    ctx.sb.from("subscriptions").select("plan, status, current_period_end, cancel_at_period_end, updated_at").eq("business_id", ctx.business.id),
    ctx.sb.from("internal_entitlements").select("plan, label, expires_at").eq("business_id", ctx.business.id).maybeSingle(),
  ]);
  return accessFor((data ?? []) as SubscriptionRow[], (internal as InternalPlan | null) ?? null);
}

export async function loadRequests(ctx: BusinessContext, limit = 50): Promise<RequestRow[]> {
  if (ctx.mode === "demo") return demoRequests() as RequestRow[];
  if (!ctx.business) return [];
  const { data } = await ctx.sb
    .from("update_requests")
    .select("id, ref, title, status, kind, scope, submitted_at, due_at, completed_at, preview_url")
    .eq("business_id", ctx.business.id)
    .order("submitted_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as RequestRow[];
}

export interface WebsiteRow {
  kind: "hosted" | "external" | "bespoke";
  external_url: string | null;
  draft: unknown;
  draft_version: number;
  published_revision_id: string | null;
  published_at: string | null;
  updated_at: string;
  manifest: unknown;
  manifest_version: number;
  preview_token: string | null;
  revalidate_url: string | null;
}

export async function loadWebsite(ctx: BusinessContext): Promise<WebsiteRow | null> {
  if (ctx.mode === "demo") {
    const { DEMO_SITE } = await import("./demo");
    return { kind: "hosted", external_url: null, draft: DEMO_SITE, draft_version: 1, published_revision_id: "demo", published_at: new Date().toISOString(), updated_at: new Date().toISOString(), manifest: {}, manifest_version: 0, preview_token: null, revalidate_url: null };
  }
  if (!ctx.business) return null;
  const { data } = await ctx.sb
    .from("websites")
    .select("kind, external_url, draft, draft_version, published_revision_id, published_at, updated_at, manifest, manifest_version, preview_token, revalidate_url")
    .eq("business_id", ctx.business.id)
    .maybeSingle();
  return (data as WebsiteRow | null) ?? null;
}

export interface ConnectionRow {
  id: string;
  provider: "instagram" | "linkedin" | "google_search_console";
  display_name: string | null;
  status: "connected" | "needs_reconnect" | "revoked";
  last_error: string | null;
}

export async function loadConnections(ctx: BusinessContext): Promise<ConnectionRow[]> {
  if (ctx.mode === "demo" || !ctx.business) return [];
  const { data } = await ctx.sb
    .from("provider_connections")
    .select("id, provider, display_name, status, last_error")
    .eq("business_id", ctx.business.id)
    .neq("status", "revoked");
  return (data ?? []) as ConnectionRow[];
}
