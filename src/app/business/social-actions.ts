"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { businessContext } from "@/lib/business/data";
import { supabaseService } from "@/lib/supabase/server";
import { validateForProvider, type MediaItem, type SocialProvider } from "@/lib/social/providers";
import { zonedToUtc } from "@/lib/social/time";
import { refreshSeoSnapshot } from "@/lib/seo/refresh";

const TYPES: Record<string, "image" | "video"> = { "image/jpeg": "image", "image/png": "image", "video/mp4": "video", "video/quicktime": "video" };

async function live(back: string) {
  const ctx = await businessContext();
  if (ctx.mode !== "live" || !ctx.business) redirect(`${back}?demo=1`);
  return ctx as typeof ctx & { business: NonNullable<typeof ctx.business> };
}

export async function saveSocialPost(form: FormData) {
  const ctx = await live("/business/social");
  const b = ctx.business;
  const body = String(form.get("body") ?? "").slice(0, 3000);
  const schedule = form.get("intent") === "schedule";
  const postId = String(form.get("post") ?? "") || null;
  const accountIds = form.getAll("accounts").map(String).slice(0, 10);
  let media: MediaItem[] = [];
  try {
    const kept = JSON.parse(String(form.get("existing_media") || "[]")) as MediaItem[];
    media = kept.filter((m) => typeof m.path === "string" && m.path.startsWith(`${b.id}/`)).slice(0, 10);
  } catch {
    media = [];
  }
  for (const f of form.getAll("media")) {
    if (!(f instanceof File) || !f.size || !TYPES[f.type] || media.length >= 10) continue;
    if (f.size > (TYPES[f.type] === "video" ? 100 : 8) * 1024 * 1024) redirect("/business/social?error=media_too_large");
    const path = `${b.id}/${randomUUID()}.${f.type.split("/")[1].replace("quicktime", "mov")}`;
    const up = await ctx.sb.storage.from("social-media").upload(path, f, { contentType: f.type, upsert: false });
    if (!up.error) media.push({ path, mime: f.type, bytes: f.size, kind: TYPES[f.type] });
  }
  let when: Date | null = null;
  const local = String(form.get("when") ?? "");
  if (local) when = zonedToUtc(local, b.timezone);
  if (schedule) {
    const { data: conns } = await ctx.sb.from("provider_connections").select("id, provider").in("id", accountIds.length ? accountIds : ["00000000-0000-0000-0000-000000000000"]);
    const problems = (conns ?? []).flatMap((c) => validateForProvider(c.provider as SocialProvider, body, media));
    if (problems.length) redirect(`/business/social?error=${encodeURIComponent("validation")}&why=${encodeURIComponent(problems.join(" "))}`);
  }
  const { error } = await ctx.sb.rpc("save_social_post", {
    p_business: b.id, p_post: postId, p_body: body, p_media: media, p_connections: accountIds,
    p_scheduled_for: when ? when.toISOString() : null, p_timezone: b.timezone, p_schedule: schedule,
  });
  revalidatePath("/business/social");
  redirect(`/business/social?${error ? `error=${encodeURIComponent(error.message)}` : schedule ? "scheduled=1" : "ok=1"}`);
}

export async function cancelSocialPost(form: FormData) {
  const ctx = await live("/business/social");
  const { error } = await ctx.sb.rpc("cancel_social_post", { p_post: String(form.get("post")) });
  revalidatePath("/business/social");
  redirect(`/business/social?${error ? `error=${encodeURIComponent(error.message)}` : "cancelled=1"}`);
}

export async function disconnectAccount(form: FormData) {
  const back = String(form.get("back")) === "/business/seo" ? "/business/seo" : "/business/social";
  const ctx = await live(back);
  const { error } = await ctx.sb.rpc("disconnect_provider", { p_connection: String(form.get("connection")) });
  revalidatePath(back);
  redirect(`${back}?${error ? `error=${encodeURIComponent(error.message)}` : "disconnected=1"}`);
}

export async function chooseSeoSite(form: FormData) {
  const ctx = await live("/business/seo");
  const { error } = await ctx.sb.rpc("choose_seo_site", { p_connection: String(form.get("connection")), p_site: String(form.get("site")) });
  redirect(`/business/seo?${error ? `error=${encodeURIComponent(error.message)}` : "ok=1"}`);
}

export async function refreshSeoNow(form: FormData) {
  const ctx = await live("/business/seo");
  const connection = String(form.get("connection"));
  // Membership check through RLS before using the service role for this one connection.
  const { data: mine } = await ctx.sb.from("provider_connections").select("id").eq("id", connection).eq("business_id", ctx.business.id).maybeSingle();
  if (!mine) redirect("/business/seo?error=not_member");
  const { data: last } = await ctx.sb.from("seo_snapshots").select("fetched_at").eq("business_id", ctx.business.id).order("fetched_at", { ascending: false }).limit(1).maybeSingle();
  if (last && Date.now() - Date.parse(last.fetched_at) < 3600_000) redirect("/business/seo?error=refresh_too_soon");
  const db = supabaseService();
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!db || !key) redirect("/business/seo?error=connect_not_configured");
  const r = await refreshSeoSnapshot(db, connection, key);
  revalidatePath("/business/seo");
  redirect(`/business/seo?${r === "saved" ? "ok=1" : `error=seo_${r}`}`);
}
