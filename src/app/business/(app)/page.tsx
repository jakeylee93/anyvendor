import Link from "next/link";
import { ArrowUpRight, ExternalLink, Pencil, Plus } from "lucide-react";
import { ActionFeedback, Btn, Card, CardTitle, Notice, RequestList } from "@/components/business/ui";
import { loadAccess, loadConnections, loadRequests, loadWebsite, requireBusiness } from "@/lib/business/data";
import { normaliseContent } from "@/lib/business/site-content";
import { planByCode } from "@/lib/business/plans";
import { nowMs } from "@/lib/business/requests";

type SP = Promise<Record<string, string | string[] | undefined>>;

function when(iso: string, tz: string) {
  return new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: tz });
}

export default async function BusinessHome({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await requireBusiness();
  const [access, requests, website, connections] = await Promise.all([loadAccess(ctx), loadRequests(ctx, 20), loadWebsite(ctx), loadConnections(ctx)]);
  const b = ctx.business;
  const open = requests.filter((r) => r.status !== "completed");
  const review = requests.filter((r) => r.status === "ready_to_review").length;
  const overdue = open.filter((r) => new Date(r.due_at).getTime() < nowMs()).length;
  const content = normaliseContent(website?.draft);
  const siteHref = website?.kind === "external" ? website.external_url : `/site/${b.slug}`;
  const published = Boolean(website?.published_revision_id);

  let nextPosts: { id: string; body: string; scheduled_for: string; status: string }[] = [];
  let publishedCount = 0;
  let seo: { clicks: number; impressions: number; period_start: string; period_end: string; fetched_at: string } | null = null;
  if (ctx.mode === "live") {
    if (access.modules.includes("social")) {
      const [{ data: np }, { count }] = await Promise.all([
        ctx.sb.from("social_posts").select("id, body, scheduled_for, status").eq("business_id", b.id).in("status", ["scheduled", "publishing"]).order("scheduled_for").limit(3),
        ctx.sb.from("social_post_targets").select("id", { count: "exact", head: true }).eq("business_id", b.id).eq("status", "published"),
      ]);
      nextPosts = (np ?? []) as typeof nextPosts;
      publishedCount = count ?? 0;
    }
    if (access.modules.includes("seo")) {
      const { data } = await ctx.sb.from("seo_snapshots").select("clicks, impressions, period_start, period_end, fetched_at").eq("business_id", b.id).order("fetched_at", { ascending: false }).limit(1).maybeSingle();
      seo = data;
    }
  }
  const social = connections.filter((c) => c.provider !== "google_search_console");
  const gsc = connections.find((c) => c.provider === "google_search_console");

  return (
    <>
      <ActionFeedback sp={sp} />
      {sp.welcome && <Notice tone="success">Your business is set up. Choose a plan to switch on your website and requests.</Notice>}

      <Card className="overflow-hidden p-0 md:p-0">
        <div className="bg-be-navy px-5 py-6 text-white md:px-7 md:py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-be-cyan">Your website</p>
          <h1 className="mt-2 text-2xl font-bold leading-tight md:text-3xl">{content.headline || b.name}</h1>
          {content.intro && <p className="mt-2 max-w-2xl text-white/75">{content.intro}</p>}
          <p className="mt-3 text-sm text-white/70">
            {website?.kind === "external" ? `Hosted at ${website.external_url}` : published ? `Live at anyvendor/site/${b.slug}` : "Not published yet"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 p-5 md:p-6">
          {website?.kind !== "external" && (
            <Btn href="/business/website">
              <Pencil size={16} aria-hidden /> Edit website
            </Btn>
          )}
          <Btn href="/business/requests/new" tone="secondary">
            <Plus size={16} aria-hidden /> Request an update
          </Btn>
          {siteHref && (published || website?.kind === "external") && (
            <a href={siteHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-be-navy ring-1 ring-gray-300 hover:bg-be-mist">
              View site <ExternalLink size={14} aria-hidden />
            </a>
          )}
        </div>
      </Card>

      {!access.plan && (
        <Card>
          <CardTitle>Choose a plan</CardTitle>
          <p className="mt-1 text-sm text-be-grey">Plans start at £50 a month with your website, hosting and unlimited update requests. Your history stays here whatever you choose.</p>
          <div className="mt-4">
            <Btn href="/business/account">See plans</Btn>
          </div>
        </Card>
      )}

      <Card>
        <CardTitle action={<Link href="/business/requests" className="text-sm font-semibold text-be-navy underline decoration-be-cyan decoration-2 underline-offset-4">All requests</Link>}>
          Requests
        </CardTitle>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[["Open", open.length], ["To review", review], ["Overdue", overdue]].map(([k, v]) => (
            <div key={k} className={`rounded-2xl px-2 py-3 ${k === "Overdue" && Number(v) > 0 ? "bg-rose-50 text-rose-800" : "bg-be-mist text-be-navy"}`}>
              <dt className="text-xs">{k}</dt>
              <dd className="text-2xl font-bold">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-2">
          <RequestList rows={requests.slice(0, 4)} />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {access.modules.includes("seo") && (
          <Card>
            <CardTitle action={<Link href="/business/seo" className="text-sm font-semibold text-be-navy underline decoration-be-cyan decoration-2 underline-offset-4">Open</Link>}>
              Google search
            </CardTitle>
            {ctx.mode === "demo" ? (
              <p className="mt-2 text-sm text-be-grey">Demo: connect Google Search Console to see your real clicks and impressions here. No sample numbers are shown.</p>
            ) : !gsc ? (
              <p className="mt-2 text-sm text-be-grey">Connect Google Search Console to see how people find you on Google.</p>
            ) : gsc.status !== "connected" ? (
              <p className="mt-2 text-sm text-amber-800">Search Console needs reconnecting.</p>
            ) : seo ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-be-mist p-3"><p className="text-xs text-be-grey">Clicks</p><p className="text-2xl font-bold text-be-navy">{seo.clicks.toLocaleString("en-GB")}</p></div>
                <div className="rounded-2xl bg-be-mist p-3"><p className="text-xs text-be-grey">Impressions</p><p className="text-2xl font-bold text-be-navy">{seo.impressions.toLocaleString("en-GB")}</p></div>
                <p className="col-span-2 text-xs text-be-grey">Google data for {seo.period_start} to {seo.period_end}. Google reports with a 2–3 day delay.</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-be-grey">Connected. Google hasn’t returned data for this site yet; it usually appears within a few days.</p>
            )}
          </Card>
        )}

        {access.modules.includes("social") && (
          <Card>
            <CardTitle action={<Link href="/business/social" className="text-sm font-semibold text-be-navy underline decoration-be-cyan decoration-2 underline-offset-4">Schedule</Link>}>
              Social
            </CardTitle>
            {ctx.mode === "demo" || social.length === 0 ? (
              <p className="mt-2 text-sm text-be-grey">Connect your own Instagram or LinkedIn to schedule posts from here.</p>
            ) : (
              <>
                {social.some((c) => c.status !== "connected") && <p className="mt-2 text-sm text-amber-800">An account needs reconnecting.</p>}
                <ul className="mt-2 space-y-2">
                  {nextPosts.map((p) => (
                    <li key={p.id} className="rounded-2xl bg-be-mist px-3 py-2 text-sm">
                      <p className="font-semibold text-be-navy">{when(p.scheduled_for, b.timezone)}</p>
                      <p className="truncate text-be-grey">{p.body || "(media only)"}</p>
                    </li>
                  ))}
                  {nextPosts.length === 0 && <li className="text-sm text-be-grey">Nothing scheduled.</li>}
                </ul>
                <p className="mt-3 text-xs text-be-grey">{publishedCount} post{publishedCount === 1 ? "" : "s"} published through AnyVendor. Engagement numbers aren’t available from these accounts yet.</p>
              </>
            )}
          </Card>
        )}
      </div>

      <Card>
        <CardTitle>Listing and enquiries</CardTitle>
        <ul className="mt-2 space-y-2 text-sm">
          <li className="flex items-center justify-between gap-3">
            <span className="text-be-navy">Directory listing</span>
            {b.directory_slug ? (
              <Link href={`/businesses/${b.directory_slug}`} className="inline-flex items-center gap-1 font-semibold text-be-navy underline decoration-be-cyan decoration-2 underline-offset-4">
                View <ArrowUpRight size={14} aria-hidden />
              </Link>
            ) : (
              <span className="text-be-grey">Not linked yet</span>
            )}
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-be-navy">Enquiries</span>
            <span className="text-right text-be-grey">Customers contact you by email for now. An enquiry inbox is planned.</span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-be-navy">Plan</span>
            <Link href="/business/account" className="font-semibold text-be-navy underline decoration-be-cyan decoration-2 underline-offset-4">
              {ctx.mode === "demo" ? "Demo (all features)" : (planByCode(access.plan)?.name ?? "No plan")}
            </Link>
          </li>
        </ul>
      </Card>
    </>
  );
}
