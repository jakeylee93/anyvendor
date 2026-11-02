import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteRenderer from "@/components/business/SiteRenderer";
import { DEMO_BUSINESS, DEMO_SITE } from "@/lib/business/demo";
import { normaliseContent } from "@/lib/business/site-content";
import { backendReady } from "@/lib/supabase/env";
import { supabaseServer } from "@/lib/supabase/server";

type Params = Promise<{ slug: string }>;

async function load(slug: string) {
  if (slug === DEMO_BUSINESS.slug && !backendReady()) return { name: DEMO_BUSINESS.name, content: DEMO_SITE, demo: true };
  const sb = await supabaseServer();
  if (!sb) return null;
  const { data } = await sb.rpc("public_site", { p_slug: slug }).maybeSingle();
  const row = data as { name: string; content: unknown } | null;
  return row ? { name: row.name, content: normaliseContent(row.content), demo: false } : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const site = await load((await params).slug);
  return { title: site ? site.name : "Site not found", description: site?.content.intro || undefined, robots: { index: false, follow: false } };
}

export default async function HostedSite({ params }: { params: Params }) {
  const site = await load((await params).slug);
  if (!site) notFound();
  return <SiteRenderer name={site.name} content={site.content} ribbon={site.demo ? "Demo website. Not a real business." : undefined} />;
}
