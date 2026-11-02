import Link from "next/link";
import { ExternalLink, Pencil, Plus, Search } from "lucide-react";
import SitePreviewFrame from "@/components/business/SitePreviewFrame";
import { ActionFeedback, Btn, Card, CardTitle, RequestList } from "@/components/business/ui";
import { loadAccess, loadConnections, loadRequests, loadWebsite, requireBusiness } from "@/lib/business/data";
import { nowMs } from "@/lib/business/requests";

type SP = Promise<Record<string, string | string[] | undefined>>;
const stamp = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });

export default async function WebsitePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await requireBusiness();
  const b = ctx.business;
  const [website, requests, access, connections] = await Promise.all([loadWebsite(ctx), loadRequests(ctx, 50), loadAccess(ctx), loadConnections(ctx)]);
  const external = website?.kind === "external" && website.external_url;
  const published = Boolean(website?.published_revision_id);
  const src = external ? website!.external_url! : published || ctx.mode === "demo" ? `/site/${b.slug}` : "/business/preview";
  const open = requests.filter((r) => r.status !== "completed");
  const overdue = open.filter((r) => Date.parse(r.due_at) < nowMs()).length;
  const gsc = connections.find((c) => c.provider === "google_search_console");
  let seo: { clicks: number; impressions: number; period_end: string } | null = null;
  if (ctx.mode === "live" && gsc) {
    const { data } = await ctx.sb.from("seo_snapshots").select("clicks, impressions, period_end").eq("business_id", b.id).order("fetched_at", { ascending: false }).limit(1).maybeSingle();
    seo = data;
  }
  const link = "text-sm font-semibold text-be-navy underline decoration-be-cyan decoration-2 underline-offset-4";

  return (
    <>
      <ActionFeedback sp={sp} />
      <h1 className="text-2xl font-bold text-be-navy md:text-3xl">Website</h1>

      <Card flush>
        <div className="bg-be-navy p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-be-cyan">Your website</p>
            <p className="text-xs text-white/70">{external ? website!.external_url : published ? `Live at /site/${b.slug}` : "Draft, not published yet"}</p>
          </div>
          <SitePreviewFrame src={src} title={`${b.name} website`} height={480} />
        </div>
        <div className="flex flex-wrap gap-2 p-5 md:p-6">
          {!external && <Btn href="/business/website/edit"><Pencil size={16} aria-hidden /> Edit website</Btn>}
          <Btn href="/business/requests/new" tone="secondary"><Plus size={16} aria-hidden /> Request an update</Btn>
          <a href={src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-be-navy ring-1 ring-gray-300 hover:bg-be-mist">Open full size <ExternalLink size={14} aria-hidden /></a>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardTitle action={!external ? <Link href="/business/website/edit" className={link}>Edit</Link> : undefined}>Edit website</CardTitle>
          {external ? (
            <p className="mt-2 text-sm text-be-grey">Your site is hosted elsewhere, so changes go through a request.</p>
          ) : (
            <>
              <p className="mt-2 text-sm text-be-grey">Change your words, photos and contact details yourself, then publish.</p>
              <p className="mt-3 text-sm text-be-navy">Draft version {website?.draft_version ?? 0}</p>
              <p className="text-xs text-be-grey">{website?.published_at ? `Last published ${stamp(website.published_at)}` : "Not published yet"}</p>
            </>
          )}
        </Card>

        <Card>
          <CardTitle action={access.modules.includes("seo") ? <Link href="/business/seo" className={link}>Open</Link> : undefined}>
            <span className="inline-flex items-center gap-2"><Search size={18} className="text-be-cyan" aria-hidden /> SEO</span>
          </CardTitle>
          {!access.modules.includes("seo") ? (
            <p className="mt-2 text-sm text-be-grey">SEO and your Google search results come with the £75 plan. <Link href="/business/account" className="font-semibold text-be-navy underline">See plans</Link></p>
          ) : ctx.mode === "demo" ? (
            <p className="mt-2 text-sm text-be-grey">Connect Google Search Console to see real clicks and impressions. No sample numbers are shown.</p>
          ) : !gsc ? (
            <p className="mt-2 text-sm text-be-grey">Connect Google Search Console to see how people find you.</p>
          ) : seo ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-be-mist p-3"><p className="text-xs text-be-grey">Clicks</p><p className="text-2xl font-bold text-be-navy">{seo.clicks.toLocaleString("en-GB")}</p></div>
              <div className="rounded-2xl bg-be-mist p-3"><p className="text-xs text-be-grey">Impressions</p><p className="text-2xl font-bold text-be-navy">{seo.impressions.toLocaleString("en-GB")}</p></div>
              <p className="col-span-2 text-xs text-be-grey">Last 28 days to {seo.period_end}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-be-grey">Connected. Google data usually appears within a few days.</p>
          )}
        </Card>

        <Card className="md:col-span-1">
          <CardTitle action={<Link href="/business/requests" className={link}>All</Link>}>Requests</CardTitle>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-2xl bg-be-mist py-2"><dt className="text-xs text-be-grey">Open</dt><dd className="text-2xl font-bold text-be-navy">{open.length}</dd></div>
            <div className={`rounded-2xl py-2 ${overdue ? "bg-rose-50 text-rose-800" : "bg-be-mist text-be-navy"}`}><dt className="text-xs">Overdue</dt><dd className="text-2xl font-bold">{overdue}</dd></div>
          </dl>
          <div className="mt-3"><Btn href="/business/requests/new" tone="secondary" className="w-full"><Plus size={16} aria-hidden /> New request</Btn></div>
        </Card>
      </div>

      <Card>
        <CardTitle action={<Link href="/business/requests" className={link}>All requests</Link>}>Latest requests</CardTitle>
        <p className="mt-1 text-sm text-be-grey">Unlimited changes and new features. We aim to deliver each within 24 hours and keep you updated here.</p>
        <RequestList rows={requests.slice(0, 5)} />
      </Card>
    </>
  );
}
