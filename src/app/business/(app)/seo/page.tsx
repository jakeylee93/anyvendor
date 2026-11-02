import Link from "next/link";
import { ActionFeedback, Card, CardTitle, Notice, inputCls, submitCls } from "@/components/business/ui";
import { loadAccess, loadConnections, requireBusiness } from "@/lib/business/data";
import { PROVIDERS } from "@/lib/social/providers";
import { chooseSeoSite, disconnectAccount, refreshSeoNow } from "../../social-actions";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function SeoPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await requireBusiness();
  const [access, connections] = await Promise.all([loadAccess(ctx), loadConnections(ctx)]);
  if (!access.modules.includes("seo")) {
    return <Card><CardTitle>SEO</CardTitle><p className="mt-2 text-sm text-be-grey">SEO and your Google search performance come with the £75 plan.</p><Link href="/business/account" className={`${submitCls} mt-4`}>See plans</Link></Card>;
  }
  const gsc = connections.find((c) => c.provider === "google_search_console");
  const configured = PROVIDERS.google_search_console.env.every((e) => process.env[e]) && Boolean(process.env.APP_URL && process.env.OAUTH_STATE_SECRET && process.env.TOKEN_ENCRYPTION_KEY);
  let settings: { sites?: string[]; site?: string | null } = {};
  type Snap = { clicks: number; impressions: number; ctr: number; position: number | null; period_start: string; period_end: string; fetched_at: string; top_queries: { query: string; clicks: number; impressions: number }[] };
  let snap: Snap | null = null;
  if (ctx.mode === "live" && gsc) {
    const [{ data: c }, { data: s }] = await Promise.all([
      ctx.sb.from("provider_connections").select("settings").eq("id", gsc.id).single(),
      ctx.sb.from("seo_snapshots").select("clicks, impressions, ctr, position, period_start, period_end, fetched_at, top_queries").eq("business_id", ctx.business.id).order("fetched_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    settings = (c?.settings ?? {}) as typeof settings;
    snap = s as Snap | null;
  }

  return (
    <>
      <ActionFeedback sp={sp} />
      {sp.connected && <Notice tone="success">Search Console connected.</Notice>}
      <h1 className="text-2xl font-bold text-be-navy md:text-3xl">Google search</h1>
      {!gsc ? (
        <Card>
          <CardTitle>Connect Google Search Console</CardTitle>
          <p className="mt-2 text-sm text-be-grey">See real clicks, impressions and the searches people use to find you. We ask Google for read-only access.</p>
          {ctx.mode === "live" && configured ? (
            // eslint-disable-next-line @next/next/no-html-link-for-pages -- route handler that redirects to Google
            <a href="/api/connect/google_search_console/start" className={`${submitCls} mt-4`}>Connect Search Console</a>
          ) : (
            <p className="mt-3 text-sm text-be-grey">{ctx.mode === "demo" ? "Demo: no sample numbers are shown." : "Not set up in this preview yet."}</p>
          )}
        </Card>
      ) : (
        <>
          {gsc.status !== "connected" && <Notice tone="warning">Search Console needs reconnecting. {configured && (
            // eslint-disable-next-line @next/next/no-html-link-for-pages -- route handler that redirects to Google
            <a href="/api/connect/google_search_console/start" className="font-semibold underline">Reconnect</a>
          )}</Notice>}
          <Card>
            <CardTitle>Property</CardTitle>
            {(settings.sites ?? []).length === 0 ? (
              <p className="mt-2 text-sm text-be-grey">This Google account has no verified Search Console properties yet. Verify your site in Search Console, then reconnect.</p>
            ) : (
              <form action={chooseSeoSite} className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input type="hidden" name="connection" value={gsc.id} />
                <select name="site" defaultValue={settings.site ?? ""} className={inputCls}>{(settings.sites ?? []).map((s) => <option key={s} value={s}>{s}</option>)}</select>
                <button className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-be-navy ring-1 ring-gray-300">Use this</button>
              </form>
            )}
            <div className="mt-3 flex flex-wrap gap-3">
              <form action={refreshSeoNow}><input type="hidden" name="connection" value={gsc.id} /><button className={submitCls}>Refresh now</button></form>
              <form action={disconnectAccount}><input type="hidden" name="connection" value={gsc.id} /><input type="hidden" name="back" value="/business/seo" /><button className="text-sm text-be-grey underline">Disconnect</button></form>
            </div>
          </Card>
          <Card>
            <CardTitle>Last 28 days</CardTitle>
            {snap ? (
              <>
                <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                  {[["Clicks", snap.clicks.toLocaleString("en-GB")], ["Impressions", snap.impressions.toLocaleString("en-GB")], ["Click rate", `${(Number(snap.ctr) * 100).toFixed(1)}%`], ["Average position", snap.position ? Number(snap.position).toFixed(1) : "–"]].map(([k, v]) => (
                    <div key={k} className="rounded-2xl bg-be-mist p-3"><p className="text-xs text-be-grey">{k}</p><p className="text-2xl font-bold text-be-navy">{v}</p></div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-be-grey">Google data for {snap.period_start} to {snap.period_end}, fetched {new Date(snap.fetched_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}. Google reports with a 2–3 day delay.</p>
                {snap.top_queries.length > 0 && (
                  <table className="mt-4 w-full text-sm">
                    <thead><tr className="text-left text-xs text-be-grey"><th className="py-1 font-medium">Search</th><th className="py-1 text-right font-medium">Clicks</th><th className="py-1 text-right font-medium">Impressions</th></tr></thead>
                    <tbody>{snap.top_queries.map((q) => <tr key={q.query} className="border-t border-gray-100"><td className="py-1.5 text-be-navy">{q.query}</td><td className="py-1.5 text-right">{q.clicks}</td><td className="py-1.5 text-right">{q.impressions}</td></tr>)}</tbody>
                  </table>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm text-be-grey">No data yet. Choose your property and press Refresh now; Google may take a few days to report a new site.</p>
            )}
          </Card>
        </>
      )}
    </>
  );
}
