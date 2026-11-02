import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Paperclip } from "lucide-react";
import { ActionFeedback, Card, DueLabel, Notice, StatusPill, inputCls, submitCls } from "@/components/business/ui";
import { requireBusiness, type RequestRow } from "@/lib/business/data";
import { demoRequests } from "@/lib/business/demo";
import { SCOPE_LABEL, STATUS_LABEL, type RequestStatus } from "@/lib/business/requests";
import { customerDecision, replyToRequest } from "../../../actions";

type SP = Promise<Record<string, string | string[] | undefined>>;
interface EventRow { id: string; author_kind: "customer" | "staff" | "system"; body: string | null; status_from: RequestStatus | null; status_to: RequestStatus | null; created_at: string }
interface Attachment { id: string; filename: string; url: string | null; created_at: string }

const stamp = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });

export default async function RequestPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const ctx = await requireBusiness();
  type Full = RequestRow & { body: string; scope_note: string | null; completion_note: string | null };
  let r: Full | null = null;
  let events: EventRow[] = [];
  let files: Attachment[] = [];
  if (ctx.mode === "demo") {
    const d = demoRequests().find((x) => x.id === id);
    if (!d) notFound();
    r = { ...(d as RequestRow), body: "Demo request text.", scope_note: d.scope === "larger_feature" ? "Demo: taking deposits needs a payments account; we’ll agree the scope with you." : null, completion_note: null };
    events = [{ id: "e1", author_kind: "customer", body: "Demo request text.", status_from: null, status_to: "received", created_at: d.submitted_at }];
  } else {
    const { data } = await ctx.sb
      .from("update_requests")
      .select("id, ref, title, body, status, kind, scope, scope_note, submitted_at, due_at, completed_at, completion_note, preview_url")
      .eq("id", id)
      .eq("business_id", ctx.business.id)
      .maybeSingle();
    if (!data) notFound();
    r = data as unknown as Full;
    const [{ data: ev }, { data: att }] = await Promise.all([
      ctx.sb.from("request_events").select("id, author_kind, body, status_from, status_to, created_at").eq("request_id", id).order("created_at"),
      ctx.sb.from("request_attachments").select("id, filename, storage_path, created_at").eq("request_id", id).order("created_at"),
    ]);
    events = (ev ?? []) as EventRow[];
    files = await Promise.all(
      (att ?? []).map(async (a) => {
        const { data: signed } = await ctx.sb.storage.from("request-attachments").createSignedUrl(a.storage_path, 600);
        return { id: a.id, filename: a.filename, url: signed?.signedUrl ?? null, created_at: a.created_at };
      }),
    );
  }
  if (!r) notFound();

  return (
    <>
      <Link href="/business/requests" className="inline-flex items-center gap-1 text-sm font-semibold text-be-navy"><ArrowLeft size={16} aria-hidden /> Requests</Link>
      <ActionFeedback sp={sp} />
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-be-grey">#{r.ref} · {r.kind === "feature" ? "New feature" : "Update"}</p>
            <h1 className="mt-1 text-xl font-bold text-be-navy md:text-2xl">{r.title}</h1>
            <p className="mt-1 text-sm text-be-grey">Sent {stamp(r.submitted_at)} · due {stamp(r.due_at)} · <DueLabel r={r} /></p>
          </div>
          <StatusPill status={r.status} />
        </div>
        {r.scope !== "standard" && (
          <div className="mt-4"><Notice tone="warning"><strong>{SCOPE_LABEL[r.scope]}.</strong> {r.scope_note}</Notice></div>
        )}
        {r.preview_url && (
          <a href={r.preview_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-be-cyan px-4 py-2 text-sm font-semibold text-be-navy">
            Open preview <ExternalLink size={14} aria-hidden />
          </a>
        )}
        {r.status === "completed" && r.completion_note && <p className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-900"><strong>What was done:</strong> {r.completion_note}</p>}
      </Card>

      {r.status === "ready_to_review" && (
        <Card>
          <h2 className="font-bold text-be-navy">Ready for you to review</h2>
          <p className="mt-1 text-sm text-be-grey">Check the preview. Approve it, or tell us what to change.</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <form action={customerDecision}>
              <input type="hidden" name="request" value={r.id} />
              <input type="hidden" name="to" value="completed" />
              <button className={submitCls}>Approve and complete</button>
            </form>
            <form action={customerDecision} className="flex flex-1 gap-2">
              <input type="hidden" name="request" value={r.id} />
              <input type="hidden" name="to" value="in_progress" />
              <input name="note" required placeholder="What should change?" className={inputCls} />
              <button className="shrink-0 rounded-full px-4 text-sm font-semibold text-be-navy ring-1 ring-gray-300">Ask for changes</button>
            </form>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="font-bold text-be-navy">Conversation</h2>
        <ol className="mt-3 space-y-3">
          {events.map((e) =>
            e.body ? (
              <li key={e.id} className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm ${e.author_kind === "customer" ? "ml-auto bg-be-navy text-white" : "bg-be-mist text-be-navy"}`}>
                <p className="whitespace-pre-wrap">{e.body}</p>
                <p className={`mt-1 text-[11px] ${e.author_kind === "customer" ? "text-white/60" : "text-be-grey"}`}>
                  {e.author_kind === "customer" ? "You" : e.author_kind === "staff" ? "AnyVendor team" : "Update"} · {stamp(e.created_at)}
                  {e.status_to && ` · ${STATUS_LABEL[e.status_to]}`}
                </p>
              </li>
            ) : (
              <li key={e.id} className="text-center text-xs text-be-grey">{e.status_to ? `${STATUS_LABEL[e.status_to]} · ${stamp(e.created_at)}` : stamp(e.created_at)}</li>
            ),
          )}
        </ol>
        {files.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {files.map((f) => (
              <li key={f.id}>
                {f.url ? (
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-be-mist px-3 py-1.5 text-sm text-be-navy"><Paperclip size={14} aria-hidden /> {f.filename}</a>
                ) : (
                  <span className="text-sm text-be-grey">{f.filename}</span>
                )}
              </li>
            ))}
          </ul>
        )}
        {r.status === "completed" ? (
          <form action={customerDecision} className="mt-5 flex gap-2">
            <input type="hidden" name="request" value={r.id} />
            <input type="hidden" name="to" value="in_progress" />
            <input name="note" required placeholder="Something not right? Tell us and we’ll reopen it." className={inputCls} />
            <button className="shrink-0 rounded-full px-4 text-sm font-semibold text-be-navy ring-1 ring-gray-300">Reopen</button>
          </form>
        ) : (
          <form action={replyToRequest} className="mt-5 space-y-2">
            <input type="hidden" name="request" value={r.id} />
            <label className="block">
              <span className="sr-only">Message</span>
              <textarea name="body" rows={3} placeholder={r.status === "needs_information" ? "Answer the question above…" : "Add a message…"} className={inputCls} />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <input name="files" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" className="text-sm text-be-grey file:mr-2 file:rounded-full file:border-0 file:bg-be-mist file:px-3 file:py-1.5 file:text-be-navy" />
              <button className={submitCls}>Send</button>
            </div>
          </form>
        )}
      </Card>
    </>
  );
}
