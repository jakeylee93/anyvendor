"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { businessContext } from "@/lib/business/data";

const str = (f: FormData, k: string, max = 8000) => String(f.get(k) ?? "").trim().slice(0, max);

async function staff() {
  const ctx = await businessContext();
  if (ctx.mode !== "live" || !ctx.staff) redirect("/staff");
  return ctx;
}

export async function staffMove(form: FormData) {
  const ctx = await staff();
  const id = str(form, "request", 64);
  const { error } = await ctx.sb.rpc("transition_update_request", {
    p_request: id,
    p_to: str(form, "to", 20),
    p_note: str(form, "note") || null,
    p_preview_url: str(form, "preview_url", 600) || null,
    p_completion_note: str(form, "completion_note") || null,
  });
  revalidatePath("/staff");
  redirect(`/staff/requests/${id}?${error ? `error=${encodeURIComponent(error.message)}` : "ok=1"}`);
}

export async function staffMessage(form: FormData) {
  const ctx = await staff();
  const id = str(form, "request", 64);
  const { error } = await ctx.sb.rpc("add_request_message", { p_request: id, p_body: str(form, "body"), p_internal: form.get("internal") === "on" });
  redirect(`/staff/requests/${id}?${error ? `error=${encodeURIComponent(error.message)}` : "ok=1"}`);
}

export async function staffScope(form: FormData) {
  const ctx = await staff();
  const id = str(form, "request", 64);
  const { error } = await ctx.sb.rpc("flag_request_scope", { p_request: id, p_scope: str(form, "scope", 30), p_note: str(form, "note") });
  redirect(`/staff/requests/${id}?${error ? `error=${encodeURIComponent(error.message)}` : "ok=1"}`);
}
