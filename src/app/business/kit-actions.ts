"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { businessContext } from "@/lib/business/data";
import { resolveLayout } from "@/lib/business/dashboard";
import { profileFromForm } from "@/lib/business/profile-content";
import { kitFromForm } from "@/lib/business/brand-kit";

const BRAND_TYPES = ["image/svg+xml", "image/png", "image/jpeg", "image/webp", "application/pdf"];

async function live(back: string) {
  const ctx = await businessContext();
  if (ctx.mode !== "live" || !ctx.business) redirect(`${back}?demo=1`);
  return ctx as typeof ctx & { business: NonNullable<typeof ctx.business> };
}

export async function saveDashboardLayout(layout: string): Promise<{ ok: boolean }> {
  const ctx = await businessContext();
  if (ctx.mode !== "live" || !ctx.business) return { ok: false };
  let parsed: unknown = [];
  try {
    parsed = JSON.parse(layout);
  } catch {
    return { ok: false };
  }
  const { error } = await ctx.sb.rpc("save_dashboard_layout", { p_business: ctx.business.id, p_layout: resolveLayout(parsed) });
  return { ok: !error };
}

export async function saveProfile(form: FormData) {
  const ctx = await live("/business/profile");
  const { error } = await ctx.sb.rpc("save_vendor_profile", { p_business: ctx.business.id, p_profile: profileFromForm(form), p_expected_version: Number(form.get("expected_version")) });
  revalidatePath("/business/profile");
  redirect(`/business/profile?${error ? `error=${encodeURIComponent(error.message)}` : "ok=1"}`);
}

export async function saveBrandKit(form: FormData) {
  const ctx = await live("/business/brand");
  const { error } = await ctx.sb.rpc("save_brand_kit", { p_business: ctx.business.id, p_kit: kitFromForm(form), p_expected_version: Number(form.get("expected_version")) });
  revalidatePath("/business/brand");
  redirect(`/business/brand?${error ? `error=${encodeURIComponent(error.message)}` : "ok=1"}`);
}

export async function uploadBrandFiles(form: FormData) {
  const ctx = await live("/business/brand");
  const kind = ["logo", "document", "image", "other"].includes(String(form.get("kind"))) ? String(form.get("kind")) : "other";
  const label = String(form.get("label") ?? "").trim();
  const bad: string[] = [];
  for (const f of form.getAll("files").slice(0, 10)) {
    if (!(f instanceof File) || !f.size) continue;
    if (!BRAND_TYPES.includes(f.type) || f.size > 20 * 1024 * 1024) {
      bad.push(f.name);
      continue;
    }
    const safe = f.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-80);
    const path = `${ctx.business.id}/brand/${randomUUID()}-${safe}`;
    const up = await ctx.sb.storage.from("brand-assets").upload(path, f, { contentType: f.type, upsert: false });
    if (up.error) {
      bad.push(f.name);
      continue;
    }
    const { error } = await ctx.sb.rpc("add_brand_file", { p_business: ctx.business.id, p_kind: kind, p_label: label || f.name, p_path: path, p_content_type: f.type, p_size: f.size });
    if (error) bad.push(f.name);
  }
  revalidatePath("/business/brand");
  redirect(`/business/brand?${bad.length ? `attach=${encodeURIComponent(bad.join(", "))}` : "ok=1"}`);
}

export async function removeBrandFile(form: FormData) {
  const ctx = await live("/business/brand");
  const { data: path, error } = await ctx.sb.rpc("remove_brand_file", { p_file: String(form.get("file")) });
  if (!error && path) await ctx.sb.storage.from("brand-assets").remove([String(path)]);
  revalidatePath("/business/brand");
  redirect(`/business/brand?${error ? `error=${encodeURIComponent(error.message)}` : "ok=1"}`);
}
