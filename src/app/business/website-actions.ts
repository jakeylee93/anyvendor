"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { businessContext } from "@/lib/business/data";
import { contentFromForm } from "@/lib/business/site-content";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function live() {
  const ctx = await businessContext();
  if (ctx.mode !== "live" || !ctx.business) redirect("/business/website/edit?demo=1");
  return ctx as typeof ctx & { business: NonNullable<typeof ctx.business> };
}

async function upload(ctx: Awaited<ReturnType<typeof live>>, file: File) {
  if (!file.size || !IMAGE_TYPES.includes(file.type) || file.size > 10 * 1024 * 1024) return null;
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${ctx.business.id}/site/${randomUUID()}.${ext}`;
  const { error } = await ctx.sb.storage.from("website-media").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return null;
  return ctx.sb.storage.from("website-media").getPublicUrl(path).data.publicUrl;
}

export async function saveWebsite(form: FormData) {
  const ctx = await live();
  const content = contentFromForm(form);
  const hero = form.get("heroFile");
  if (hero instanceof File && hero.size) content.heroImage = (await upload(ctx, hero)) ?? content.heroImage;
  for (const f of form.getAll("galleryFiles")) {
    if (f instanceof File && f.size && content.gallery.length < 24) {
      const src = await upload(ctx, f);
      if (src) content.gallery.push({ src, alt: "" });
    }
  }
  const version = Number(form.get("expected_version"));
  const { data: saved, error } = await ctx.sb.rpc("save_website_draft", { p_business: ctx.business.id, p_content: content, p_expected_version: version });
  revalidatePath("/business/website/edit");
  if (error) redirect(`/business/website/edit?error=${encodeURIComponent(error.message)}`);
  if (form.get("intent") === "publish") {
    const p = await ctx.sb.rpc("publish_website", { p_business: ctx.business.id, p_expected_version: Number(saved) });
    if (p.error) redirect(`/business/website/edit?error=${encodeURIComponent(p.error.message)}`);
    revalidatePath(`/site/${ctx.business.slug}`);
    redirect("/business/website/edit?published=1");
  }
  redirect("/business/website/edit?ok=1");
}

export async function restoreRevision(form: FormData) {
  const ctx = await live();
  const { error } = await ctx.sb.rpc("restore_website_revision", {
    p_business: ctx.business.id,
    p_revision: String(form.get("revision")),
    p_expected_version: Number(form.get("expected_version")),
  });
  revalidatePath("/business/website/edit");
  redirect(`/business/website/edit?${error ? `error=${encodeURIComponent(error.message)}` : "restored=1"}`);
}
