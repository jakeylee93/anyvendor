import Link from "next/link";
import { ArrowRight, CloudSun, ExternalLink, Flame, Palette, Pencil, Plus, Sparkles, Trophy, UserRound } from "lucide-react";
import DashboardGrid from "@/components/business/DashboardGrid";
import SitePreviewFrame from "@/components/business/SitePreviewFrame";
import { ActionFeedback, Btn, Card, CardTitle, Notice, RequestList } from "@/components/business/ui";
import { loadAccess, loadRequests, loadWebsite, requireBusiness } from "@/lib/business/data";
import { resolveLayout, type WidgetId } from "@/lib/business/dashboard";
import { marketingScore, POINTS, type PostLite } from "@/lib/business/marketing";
import { normaliseProfile, profileCompleteness } from "@/lib/business/profile-content";
import { normaliseKit } from "@/lib/business/brand-kit";
import { forecastFor } from "@/lib/business/weather";
import { planByCode } from "@/lib/business/plans";
import { nowMs } from "@/lib/business/requests";
import { saveDashboardLayout } from "../kit-actions";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function BusinessHome({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await requireBusiness();
  const b = ctx.business;
  const tz = b.timezone;
  const [access, requests, website] = await Promise.all([loadAccess(ctx), loadRequests(ctx, 20), loadWebsite(ctx)]);

  let posts: (PostLite & { id: string; body: string })[] = [];
  let profileRaw: unknown = {};
  let kitRaw: unknown = {};
  let insights: { slug: string; title: string; summary: string; category: string; published_at: string }[] = [];
  let savedLayout: unknown = null;
  if (ctx.mode === "live") {
    const since = new Date(nowMs() - 7 * 13 * 86400_000).toISOString();
    const [p, prof, kit, ins, lay] = await Promise.all([
      ctx.sb.from("social_posts").select("id, body, status, scheduled_for, social_post_targets(status)").eq("business_id", b.id).gte("scheduled_for", since).order("scheduled_for").limit(300),
      ctx.sb.from("vendor_profiles").select("draft").eq("business_id", b.id).maybeSingle(),
      ctx.sb.from("brand_kits").select("data").eq("business_id", b.id).maybeSingle(),
      ctx.sb.from("insights").select("slug, title, summary, category, published_at").order("published_at", { ascending: false }).limit(3),
      ctx.sb.from("dashboard_layouts").select("layout").eq("business_id", b.id).eq("user_id", ctx.userId).maybeSingle(),
    ]);
    posts = (p.data ?? []).map((x) => ({ id: x.id, body: x.body, status: x.status, scheduled_for: x.scheduled_for, targets: (x.social_post_targets ?? []) as { status: string }[] }));
    profileRaw = prof.data?.draft ?? {};
    kitRaw = kit.data?.data ?? {};
    insights = (ins.data ?? []) as typeof insights;
    savedLayout = lay.data?.layout ?? null;
  }
  const now = new Date(nowMs());
  const score = marketingScore(posts, now, tz);
  const profile = normaliseProfile(profileRaw);
  const completeness = profileCompleteness(profile);
  const kit = normaliseKit(kitRaw);
  const weather = await forecastFor(profile.areas[0] || "London").catch(() => null);
  const open = requests.filter((r) => r.status !== "completed");
  const overdue = open.filter((r) => Date.parse(r.due_at) < now.getTime()).length;
  const upcoming = posts.filter((p) => p.status === "scheduled" && p.scheduled_for && Date.parse(p.scheduled_for) > now.getTime()).slice(0, 3);
  const published = Boolean(website?.published_revision_id);
  const social = access.modules.includes("social");
  const link = "text-sm font-semibold text-be-navy underline decoration-be-cyan decoration-2 underline-offset-4";

  const tickerItems = [
    `${open.length} open website request${open.length === 1 ? "" : "s"}`,
    overdue ? `${overdue} overdue` : "Nothing overdue",
    social ? `${score.planned} of ${score.goal} posts planned this week` : "Marketing scheduler on the £100 plan",
    `${score.points} marketing points this week`,
    `Profile ${completeness.percent}% complete`,
    `Plan: ${ctx.mode === "demo" ? "demo" : (planByCode(access.plan)?.name ?? "none yet")}`,
  ];

  const nodes: Partial<Record<WidgetId, React.ReactNode>> = {
    ticker: (
      <div className="overflow-hidden rounded-3xl bg-be-navy py-3 text-sm text-white">
        <div className="marquee" style={{ "--dur": "40s" } as React.CSSProperties}>
          <ul className="marquee-track gap-8 pr-8">
            {[...tickerItems, ...tickerItems].map((t, i) => (
              <li key={i} aria-hidden={i >= tickerItems.length} className="flex shrink-0 items-center gap-2 whitespace-nowrap">
                <Sparkles size={14} className="text-be-cyan" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
    website: (
      <Card>
        <CardTitle action={<Link href="/business/website" className={link}>Website</Link>}>Your website</CardTitle>
        <div className="mt-3">
          {website?.kind === "external" && website.external_url ? (
            <SitePreviewFrame src={website.external_url} title={`${b.name} website`} height={260} />
          ) : published || ctx.mode === "demo" ? (
            <SitePreviewFrame src={`/site/${b.slug}`} title={`${b.name} website`} height={260} />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-2xl bg-be-mist text-sm text-be-grey">Your site appears here once it’s published.</div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {website?.kind !== "external" && <Btn href="/business/website/edit"><Pencil size={16} aria-hidden /> Edit website</Btn>}
          <Btn href="/business/requests/new" tone="secondary"><Plus size={16} aria-hidden /> Request an update</Btn>
        </div>
      </Card>
    ),
    marketing: (
      <Card>
        <CardTitle action={<Link href="/business/marketing" className={link}>Marketing</Link>}>
          <span className="inline-flex items-center gap-2"><Trophy size={18} className="text-be-amber" aria-hidden /> Marketing points</span>
        </CardTitle>
        <p className="mt-3 text-4xl font-bold text-be-navy">{score.points}<span className="ml-1 text-base font-medium text-be-grey">this week</span></p>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-be-mist" role="progressbar" aria-valuemin={0} aria-valuemax={score.goal} aria-valuenow={Math.min(score.planned, score.goal)} aria-label="Posts planned this week">
          <div className="h-full rounded-full bg-be-cyan" style={{ width: `${Math.min(100, (score.planned / score.goal) * 100)}%` }} />
        </div>
        <p className="mt-2 text-sm text-be-grey">
          {score.metGoal ? "Weekly goal reached. " : `Plan ${score.goal - score.planned} more post${score.goal - score.planned === 1 ? "" : "s"} this week for a ${POINTS.goalBonus}-point bonus. `}
          {score.streak > 0 && <span className="inline-flex items-center gap-1 font-semibold text-be-navy"><Flame size={14} className="text-orange-500" aria-hidden /> {score.streak}-week streak</span>}
        </p>
        <p className="mt-1 text-xs text-be-grey">Level: {score.level} · {score.totalPoints} points in total{social ? "" : " · scheduling is on the £100 plan"}</p>
      </Card>
    ),
    requests: (
      <Card>
        <CardTitle action={<Link href="/business/requests" className={link}>All</Link>}>Website requests</CardTitle>
        <p className="mt-2 text-sm text-be-grey">{open.length} open{overdue ? `, ${overdue} overdue` : ""}</p>
        <RequestList rows={requests.slice(0, 3)} />
      </Card>
    ),
    next_posts: social ? (
      <Card>
        <CardTitle action={<Link href="/business/marketing" className={link}>Schedule</Link>}>Coming up</CardTitle>
        <ul className="mt-2 space-y-2">
          {upcoming.map((p) => (
            <li key={p.id} className="rounded-2xl bg-be-mist px-3 py-2 text-sm">
              <p className="font-semibold text-be-navy">{new Date(p.scheduled_for!).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: tz })}</p>
              <p className="truncate text-be-grey">{p.body || "(media only)"}</p>
            </li>
          ))}
          {upcoming.length === 0 && <li className="text-sm text-be-grey">Nothing scheduled yet.</li>}
        </ul>
      </Card>
    ) : undefined,
    weather: (
      <Card>
        <CardTitle><span className="inline-flex items-center gap-2"><CloudSun size={18} className="text-be-cyan" aria-hidden /> Weather</span></CardTitle>
        {weather ? (
          <>
            <p className="mt-2 text-sm text-be-grey">{weather.place}</p>
            <p className="text-4xl font-bold text-be-navy">{weather.now.tempC}°<span className="ml-2 text-base font-medium text-be-grey">{weather.now.label}</span></p>
            <ul className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
              {weather.days.map((d) => (
                <li key={d.date} className="rounded-xl bg-be-mist px-1 py-2">
                  <p className="font-semibold text-be-navy">{new Date(`${d.date}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short" })}</p>
                  <p className="text-be-navy">{d.maxC}° / {d.minC}°</p>
                  <p className="text-be-grey">{d.rainChance}% rain</p>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-be-grey">Forecast by Open-Meteo. Set your area in My profile.</p>
          </>
        ) : (
          <p className="mt-2 text-sm text-be-grey">The forecast isn’t available right now.</p>
        )}
      </Card>
    ),
    insights: (
      <Card>
        <CardTitle>Tips and news</CardTitle>
        {insights.length ? (
          <ul className="mt-3 grid gap-3 md:grid-cols-3">
            {insights.map((a) => (
              <li key={a.slug} className="rounded-2xl bg-be-mist p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-be-cyan">{a.category}</p>
                <p className="mt-1 font-bold text-be-navy">{a.title}</p>
                <p className="mt-1 line-clamp-3 text-sm text-be-grey">{a.summary}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-be-grey">Industry tips and news from the AnyVendor team will appear here. The first articles are being written.</p>
        )}
      </Card>
    ),
    profile: (
      <Card>
        <CardTitle action={<Link href="/business/profile" className={link}>Edit</Link>}><span className="inline-flex items-center gap-2"><UserRound size={18} className="text-be-cyan" aria-hidden /> My profile</span></CardTitle>
        <p className="mt-3 text-4xl font-bold text-be-navy">{completeness.percent}%<span className="ml-1 text-base font-medium text-be-grey">complete</span></p>
        <p className="mt-1 text-sm text-be-grey">{completeness.next ? `Next: add ${completeness.next}.` : "Looking good."}</p>
      </Card>
    ),
    brand: (
      <Card>
        <CardTitle action={<Link href="/business/brand" className={link}>Open</Link>}><span className="inline-flex items-center gap-2"><Palette size={18} className="text-be-cyan" aria-hidden /> Brand</span></CardTitle>
        {kit.colours.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">{kit.colours.map((c) => <li key={c.hex} className="h-9 w-9 rounded-full ring-1 ring-black/10" style={{ background: c.hex }} title={`${c.name} ${c.hex}`} />)}</ul>
        ) : (
          <p className="mt-2 text-sm text-be-grey">Keep your logo, colours and company documents in one place.</p>
        )}
        <Link href="/business/brand" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-be-navy">Logos and documents <ArrowRight size={14} aria-hidden /></Link>
      </Card>
    ),
  };

  return (
    <>
      <ActionFeedback sp={sp} />
      {sp.welcome && <Notice tone="success">Your business is set up. Choose a plan to switch on your website and requests.</Notice>}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm text-be-grey">{now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: tz })}</p>
          <h1 className="text-2xl font-bold text-be-navy md:text-3xl">Hello, {b.name}</h1>
        </div>
        {!access.plan && ctx.mode === "live" && <Btn href="/business/account" tone="secondary">Choose a plan</Btn>}
        {ctx.mode === "live" && published && <a href={`/site/${b.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-be-navy">View site <ExternalLink size={14} aria-hidden /></a>}
      </div>
      <DashboardGrid initial={resolveLayout(savedLayout)} nodes={nodes} save={saveDashboardLayout} demo={ctx.mode === "demo"} />
    </>
  );
}
