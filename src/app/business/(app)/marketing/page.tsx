import Link from "next/link";
import { ExternalLink } from "lucide-react";
import Composer from "@/components/business/Composer";
import { ActionFeedback, Card, CardTitle, Notice, submitCls } from "@/components/business/ui";
import { loadAccess, loadConnections, requireBusiness } from "@/lib/business/data";
import { PROVIDERS, type MediaItem, type SocialProvider } from "@/lib/social/providers";
import { utcToZonedInput, zonedDayKey } from "@/lib/social/time";
import { marketingScore, POINTS, WEEKLY_GOAL } from "@/lib/business/marketing";
import { nowMs } from "@/lib/business/requests";
import { cancelSocialPost, disconnectAccount, saveSocialPost } from "../../social-actions";

type SP = Promise<Record<string, string | string[] | undefined>>;
interface Post { id: string; body: string; media: MediaItem[]; status: string; scheduled_for: string | null; social_post_targets: { id: string; provider: string; status: string; last_error: string | null; external_url: string | null; connection_id: string }[] }

const STATUS: Record<string, string> = { draft: "Draft", scheduled: "Scheduled", publishing: "Publishing", published: "Published", partially_published: "Partly published", failed: "Failed", cancelled: "Cancelled" };

export default async function MarketingPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await requireBusiness();
  const [access, connections] = await Promise.all([loadAccess(ctx), loadConnections(ctx)]);
  const tz = ctx.business.timezone;
  if (!access.modules.includes("social")) {
    return (
      <>
        <h1 className="text-2xl font-bold text-be-navy md:text-3xl">Marketing</h1>
        <Card><CardTitle>Social scheduler and marketing points</CardTitle><p className="mt-2 text-sm text-be-grey">Schedule your own Instagram and LinkedIn posts and earn points every week you keep your marketing going. Included in the £100 plan.</p><Link href="/business/account" className={`${submitCls} mt-4`}>See plans</Link></Card>
      </>
    );
  }
  const social = connections.filter((c) => c.provider !== "google_search_console");
  let posts: Post[] = [];
  let expiries: Record<string, string | null> = {};
  if (ctx.mode === "live") {
    const [{ data }, { data: exp }] = await Promise.all([
      ctx.sb.from("social_posts").select("id, body, media, status, scheduled_for, social_post_targets(id, provider, status, last_error, external_url, connection_id)").eq("business_id", ctx.business.id).neq("status", "cancelled").order("scheduled_for", { ascending: true, nullsFirst: true }).limit(300),
      ctx.sb.from("provider_connections").select("id, token_expires_at").eq("business_id", ctx.business.id),
    ]);
    posts = (data ?? []) as Post[];
    expiries = Object.fromEntries((exp ?? []).map((e) => [e.id, e.token_expires_at]));
  }
  const editing = typeof sp.edit === "string" ? posts.find((p) => p.id === sp.edit && ["draft", "scheduled"].includes(p.status)) : undefined;
  const upcoming = posts.filter((p) => p.status === "scheduled" || p.status === "publishing");
  const drafts = posts.filter((p) => p.status === "draft");
  const done = posts.filter((p) => ["published", "partially_published", "failed"].includes(p.status)).reverse().slice(0, 20);
  const byDay = upcoming.reduce<Record<string, Post[]>>((acc, p) => ((acc[zonedDayKey(p.scheduled_for!, tz)] ??= []).push(p), acc), {});
  const configured = (p: SocialProvider) => PROVIDERS[p].env.every((e) => process.env[e]) && Boolean(process.env.APP_URL && process.env.OAUTH_STATE_SECRET && process.env.TOKEN_ENCRYPTION_KEY);
  const dayLabel = (k: string) => new Date(`${k}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const time = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz });

  return (
    <>
      <ActionFeedback sp={sp} />
      {sp.why && <Notice tone="warning">{String(sp.why)}</Notice>}
      {sp.scheduled && <Notice tone="success">Scheduled. It will post at the chosen time and you’ll see the outcome here. Nothing is posted until then.</Notice>}
      {sp.connected && <Notice tone="success">Account connected.</Notice>}
      <h1 className="text-2xl font-bold text-be-navy md:text-3xl">Marketing</h1>
      {(() => {
        const sc = marketingScore(posts.map((p) => ({ status: p.status, scheduled_for: p.scheduled_for, targets: p.social_post_targets })), new Date(nowMs()), tz);
        return (
          <Card>
            <CardTitle>This week’s marketing</CardTitle>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-be-mist py-3"><p className="text-xs text-be-grey">Points</p><p className="text-2xl font-bold text-be-navy">{sc.points}</p></div>
              <div className="rounded-2xl bg-be-mist py-3"><p className="text-xs text-be-grey">Posts planned</p><p className="text-2xl font-bold text-be-navy">{sc.planned}/{WEEKLY_GOAL}</p></div>
              <div className="rounded-2xl bg-be-mist py-3"><p className="text-xs text-be-grey">Streak</p><p className="text-2xl font-bold text-be-navy">{sc.streak}w</p></div>
            </div>
            <p className="mt-2 text-xs text-be-grey">{POINTS.planned} points for each post planned this week, {POINTS.published} for each post the network confirms, and a {POINTS.goalBonus}-point bonus at {WEEKLY_GOAL} posts. Level: {sc.level}.</p>
          </Card>
        );
      })()}

      <Card>
        <CardTitle>Your accounts</CardTitle>
        <ul className="mt-3 space-y-3">
          {(["instagram", "linkedin"] as SocialProvider[]).map((p) => {
            const mine = social.filter((c) => c.provider === p);
            return (
              <li key={p} className="rounded-2xl bg-be-mist p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-be-navy">{PROVIDERS[p].label}</p>
                  {ctx.mode === "live" && configured(p) ? (
                    <a href={`/api/connect/${p}/start`} className="rounded-full bg-be-navy px-4 py-2 text-sm font-semibold text-white">{mine.length ? "Connect another" : "Connect"}</a>
                  ) : (
                    <span className="text-xs text-be-grey">{ctx.mode === "demo" ? "Available once connected" : "Not set up in this preview"}</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-be-grey">{p === "instagram" ? "Needs an Instagram Business or Creator account." : "Posts to your personal LinkedIn profile. Company pages need extra LinkedIn approval."}</p>
                {mine.map((c) => {
                  const exp = expiries[c.id];
                  const soon = exp && Date.parse(exp) - Date.now() < 7 * 86400_000;
                  return (
                    <div key={c.id} className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-sm">
                      <span className="text-be-navy">{c.display_name}{c.status !== "connected" ? " · needs reconnecting" : soon ? ` · reconnect before ${new Date(exp).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}</span>
                      <span className="flex gap-3">
                        {(c.status !== "connected" || soon) && configured(p) && <a href={`/api/connect/${p}/start`} className="font-semibold text-be-navy underline">Reconnect</a>}
                        <form action={disconnectAccount}><input type="hidden" name="connection" value={c.id} /><button className="text-be-grey underline">Disconnect</button></form>
                      </span>
                    </div>
                  );
                })}
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <CardTitle>{editing ? "Edit post" : "New post"}</CardTitle>
        <form action={saveSocialPost} className="mt-3 space-y-4">
          {editing && <input type="hidden" name="post" value={editing.id} />}
          <input type="hidden" name="existing_media" value={JSON.stringify(editing?.media ?? [])} />
          <Composer
            tz={tz}
            accounts={social.map((c) => ({ id: c.id, provider: c.provider as SocialProvider, name: c.display_name ?? PROVIDERS[c.provider].label, ok: c.status === "connected" }))}
            initialBody={editing?.body}
            initialMedia={editing?.media}
            initialWhen={editing?.scheduled_for ? utcToZonedInput(editing.scheduled_for, tz) : ""}
            initialAccounts={editing?.social_post_targets.map((t) => t.connection_id)}
          />
          <div className="flex flex-wrap gap-2">
            <button name="intent" value="draft" className="rounded-full px-5 py-2.5 text-sm font-semibold text-be-navy ring-1 ring-gray-300">Save draft</button>
            <button name="intent" value="schedule" className={submitCls}>Schedule</button>
          </div>
        </form>
      </Card>

      <Card>
        <CardTitle>Coming up</CardTitle>
        {Object.keys(byDay).length === 0 && <p className="mt-2 text-sm text-be-grey">Nothing scheduled.</p>}
        {Object.entries(byDay).map(([day, list]) => (
          <div key={day} className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-be-grey">{dayLabel(day)}</p>
            <ul className="mt-1 space-y-2">
              {list.map((p) => (
                <li key={p.id} className="flex items-start justify-between gap-3 rounded-2xl bg-be-mist px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-be-navy">{time(p.scheduled_for!)} · {p.social_post_targets.map((t) => (t.provider === "instagram" ? "Instagram" : "LinkedIn")).join(", ")}</p>
                    <p className="truncate text-be-grey">{p.body || "(media only)"}</p>
                  </div>
                  {p.status === "scheduled" && (
                    <span className="flex shrink-0 gap-3">
                      <Link href={`/business/marketing?edit=${p.id}`} className="font-semibold text-be-navy underline">Edit</Link>
                      <form action={cancelSocialPost}><input type="hidden" name="post" value={p.id} /><button className="text-be-grey underline">Cancel</button></form>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {drafts.length > 0 && (
          <>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-be-grey">Drafts</p>
            <ul className="mt-1 space-y-2">
              {drafts.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2 text-sm ring-1 ring-gray-200">
                  <span className="truncate text-be-navy">{p.body || "(media only)"}</span>
                  <Link href={`/business/marketing?edit=${p.id}`} className="shrink-0 font-semibold text-be-navy underline">Edit</Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Card>
        <CardTitle>Outcomes</CardTitle>
        <p className="mt-1 text-xs text-be-grey">Only posts the provider confirmed are marked Published. Engagement numbers aren’t available for these accounts yet.</p>
        {done.length === 0 && <p className="mt-2 text-sm text-be-grey">No posts have gone out yet.</p>}
        <ul className="mt-2 space-y-2">
          {done.map((p) => (
            <li key={p.id} className="rounded-2xl bg-be-mist px-3 py-2 text-sm">
              <p className="font-semibold text-be-navy">{STATUS[p.status]} · {p.scheduled_for ? new Date(p.scheduled_for).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: tz }) : ""}</p>
              <p className="truncate text-be-grey">{p.body}</p>
              <ul className="mt-1 space-y-0.5">
                {p.social_post_targets.map((t) => (
                  <li key={t.id} className="text-xs">
                    {t.provider === "instagram" ? "Instagram" : "LinkedIn"}: {t.status === "published" ? (t.external_url ? <a href={t.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-be-navy underline">view post <ExternalLink size={11} aria-hidden /></a> : "published") : <span className="text-rose-700">{t.last_error ?? t.status}</span>}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
