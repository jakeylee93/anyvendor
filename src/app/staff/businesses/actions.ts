"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { businessContext } from "@/lib/business/data";
import { manifestProblems } from "@/lib/business/manifest";
import { isPlanCode } from "@/lib/business/plans";

const str = (f: FormData, k: string, max = 2000) => String(f.get(k) ?? "").trim().slice(0, max);

async function staff() {
  const ctx = await businessContext();
  if (ctx.mode !== "live" || !ctx.staff) redirect("/staff");
  return ctx;
}
const back = (id: string, q: Record<string, string>) => `/staff/businesses/${id}?${new URLSearchParams(q)}`;
const done = (id: string, error: { message: string } | null, ok = "ok") => {
  revalidatePath(`/staff/businesses/${id}`);
  redirect(back(id, error ? { error: error.message } : { [ok]: "1" }));
};

export async function provisionBusiness(form: FormData) {
  const ctx = await staff();
  const { data, error } = await ctx.sb.rpc("provision_business", {
    p_name: str(form, "name", 120),
    p_slug: str(form, "slug", 60).toLowerCase(),
    p_directory_slug: str(form, "directory_slug", 80) || null,
    p_kind: ["hosted", "external", "bespoke"].includes(str(form, "kind", 10)) ? str(form, "kind", 10) : "hosted",
    p_timezone: "Europe/London",
  });
  revalidatePath("/staff/businesses");
  redirect(error || !data ? `/staff/businesses?error=${encodeURIComponent(error?.message ?? "failed")}` : `/staff/businesses/${data}?ok=1`);
}

export async function linkListing(form: FormData) {
  const ctx = await staff();
  const id = str(form, "business", 64);
  const { error } = await ctx.sb.rpc("link_listing", { p_business: id, p_directory_slug: str(form, "directory_slug", 80) });
  done(id, error);
}

export async function addPendingAccess(form: FormData) {
  const ctx = await staff();
  const id = str(form, "business", 64);
  const email = str(form, "email", 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect(back(id, { error: "email" }));
  const { error } = await ctx.sb.rpc("add_pending_access", {
    p_email: email,
    p_business: form.get("make_staff") === "on" ? null : id,
    p_role: str(form, "role", 10) === "editor" ? "editor" : "owner",
    p_make_staff: form.get("make_staff") === "on",
    p_note: str(form, "note", 200) || null,
  });
  done(id, error);
}

export async function revokePendingAccess(form: FormData) {
  const ctx = await staff();
  const id = str(form, "business", 64);
  const { error } = await ctx.sb.rpc("revoke_pending_access", { p_id: str(form, "pending", 64) });
  done(id, error);
}

export async function grantInternalPlan(form: FormData) {
  const ctx = await staff();
  const id = str(form, "business", 64);
  const plan = str(form, "plan", 10);
  const expires = str(form, "expires", 20);
  const { error } = await ctx.sb.rpc("grant_internal_plan", {
    p_business: id,
    p_plan: isPlanCode(plan) ? plan : null,
    p_label: str(form, "label", 120) || "Internal test plan",
    p_expires: expires ? new Date(`${expires}T23:59:59Z`).toISOString() : null,
  });
  done(id, error);
}

export async function setSiteKind(form: FormData) {
  const ctx = await staff();
  const id = str(form, "business", 64);
  const { error } = await ctx.sb.rpc("set_site_kind", {
    p_business: id,
    p_kind: ["hosted", "external", "bespoke"].includes(str(form, "kind", 10)) ? str(form, "kind", 10) : "hosted",
    p_external_url: str(form, "external_url", 300) || null,
    p_revalidate_url: str(form, "revalidate_url", 300) || null,
  });
  done(id, error);
}

export async function setManifest(form: FormData) {
  const ctx = await staff();
  const id = str(form, "business", 64);
  let parsed: unknown;
  try {
    parsed = JSON.parse(str(form, "manifest", 200000));
  } catch {
    redirect(back(id, { error: "manifest_json" }));
  }
  const problems = manifestProblems(parsed);
  if (problems.length) redirect(back(id, { error: "manifest_invalid", why: problems.slice(0, 5).join(" ") }));
  const { error } = await ctx.sb.rpc("set_site_manifest", { p_business: id, p_manifest: parsed });
  done(id, error);
}

export async function rotatePreviewToken(form: FormData) {
  const ctx = await staff();
  const id = str(form, "business", 64);
  const { error } = await ctx.sb.rpc("rotate_preview_token", { p_business: id });
  done(id, error);
}
