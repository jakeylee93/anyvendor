import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ActionFeedback, Card, DueLabel, StatusPill, inputCls, submitCls } from "@/components/business/ui";
import { businessContext } from "@/lib/business/data";
import { STATUS_LABEL, nextStaffMoves, type RequestStatus } from "@/lib/business/requests";
import { staffMessage, staffMove, staffScope } from "../../actions";

type SP = Promise<Record<string, string | string[] | undefined>>;
const stamp = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });

export default async function StaffRequest({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const ctx = await businessContext();
  if (ctx.mode !== "live" || !ctx.staff) redirect("/staff");
  const { data: r } = await ctx.sb
    .from("update_requests")
    .select("id, ref, title, body, status, kind, scope, scope_note, submitted_at, due_at, completed_at, completion_note, preview_url, businesses(name, slug)")
    .eq("id", id)
    .maybeSingle();
  if (!r) notFound();
  const { data: events } = await ctx.sb.from("request_events").select("id, author_kind, internal, body, status_to, created_at").eq("request_id", id).order("created_at");
  const biz = (Array.isArray(r.businesses) ? r.businesses[0] : r.businesses) as { name: string; slug: string } | null;
  const moves = nextStaffMoves(r.status as RequestStatus);

  return (
    <main className="min-h-screen bg-be-mist px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <Link href="/staff" className="inline-flex items-center gap-1 text-sm font-semibold text-be-navy"><ArrowLeft size={16} aria-hidden /> Queue</Link>
        <ActionFeedback sp={sp} />
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-be-grey">{biz?.name} · #{r.ref} · {r.kind}</p>
              <h1 className="mt-1 text-xl font-bold text-be-navy">{r.title}</h1>
              <p className="mt-1 text-sm text-be-grey">Received {stamp(r.submitted_at)} · due {stamp(r.due_at)} · <DueLabel r={r as never} /></p>
            </div>
            <StatusPill status={r.status as RequestStatus} />
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm text-be-navy">{r.body}</p>
        </Card>

        <Card>
          <h2 className="font-bold text-be-navy">Move this request</h2>
          <form action={staffMove} className="mt-3 space-y-3">
            <input type="hidden" name="request" value={r.id} />
            <select name="to" className={inputCls} required defaultValue="">
              <option value="" disabled>Choose the next stage…</option>
              {moves.map((m) => <option key={m} value={m}>{STATUS_LABEL[m]}</option>)}
            </select>
            <input name="note" placeholder="Note to the customer (required for Needs information)" className={inputCls} />
            <input name="preview_url" type="url" placeholder="Preview link https://… (required for Ready to review)" defaultValue={r.preview_url ?? ""} className={inputCls} />
            <textarea name="completion_note" rows={2} placeholder="Completion evidence: what was done and where (required to complete)" className={inputCls} />
            <button className={submitCls}>Update status</button>
          </form>
        </Card>

        <Card>
          <h2 className="font-bold text-be-navy">Scope</h2>
          <p className="mt-1 text-sm text-be-grey">Flag work that is bigger than an update or waits on something outside our control. The customer sees this note.</p>
          <form action={staffScope} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input type="hidden" name="request" value={r.id} />
            <select name="scope" defaultValue={r.scope} className={`${inputCls} sm:w-56`}>
              <option value="standard">Standard update</option>
              <option value="larger_feature">Larger feature</option>
              <option value="external_dependency">External dependency</option>
            </select>
            <input name="note" defaultValue={r.scope_note ?? ""} placeholder="What’s involved / what we need" className={inputCls} />
            <button className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-be-navy ring-1 ring-gray-300">Save</button>
          </form>
        </Card>

        <Card>
          <h2 className="font-bold text-be-navy">Conversation</h2>
          <ol className="mt-3 space-y-2">
            {(events ?? []).map((e) => (
              <li key={e.id} className={`rounded-2xl px-4 py-2 text-sm ${e.internal ? "bg-amber-50 text-amber-900" : e.author_kind === "customer" ? "bg-be-cyan-pale text-be-navy" : "bg-be-mist text-be-navy"}`}>
                {e.body && <p className="whitespace-pre-wrap">{e.body}</p>}
                <p className="mt-0.5 text-[11px] opacity-70">{e.internal ? "Internal note" : e.author_kind} · {stamp(e.created_at)}{e.status_to ? ` · ${STATUS_LABEL[e.status_to as RequestStatus]}` : ""}</p>
              </li>
            ))}
          </ol>
          <form action={staffMessage} className="mt-4 space-y-2">
            <input type="hidden" name="request" value={r.id} />
            <textarea name="body" rows={3} required placeholder="Message" className={inputCls} />
            <label className="flex items-center gap-2 text-sm text-be-navy"><input type="checkbox" name="internal" /> Internal note (hidden from the customer)</label>
            <button className={submitCls}>Send</button>
          </form>
        </Card>
      </div>
    </main>
  );
}
