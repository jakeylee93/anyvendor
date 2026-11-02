import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SiteRenderer from "@/components/business/SiteRenderer";
import { businessContext, loadWebsite } from "@/lib/business/data";
import { normaliseContent } from "@/lib/business/site-content";

export const metadata: Metadata = { title: "Draft preview — AnyVendor", robots: { index: false, follow: false } };

// Members-only preview of the unpublished draft.
export default async function DraftPreview() {
  const ctx = await businessContext();
  if (!ctx.business) redirect("/business");
  const website = await loadWebsite(ctx);
  return <SiteRenderer name={ctx.business.name} content={normaliseContent(website?.draft)} ribbon={ctx.mode === "demo" ? "Demo draft preview. Not a real business." : "Draft preview. Only your team can see this."} />;
}
