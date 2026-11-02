import Link from "next/link";
import { STATUS_LABEL, STATUS_STYLE, dueInfo, type RequestStatus } from "@/lib/business/requests";
import { friendlyError } from "@/lib/business/errors";
import type { RequestRow } from "@/lib/business/data";

export function Card({ children, className = "", flush = false }: { children: React.ReactNode; className?: string; flush?: boolean }) {
  return <section className={`rounded-3xl bg-white shadow-sm ring-1 ring-gray-200/80 ${flush ? "overflow-hidden" : "p-5 md:p-6"} ${className}`}>{children}</section>;
}

export function CardTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-bold text-be-navy">{children}</h2>
      {action}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warning" | "danger" | "success"; children: React.ReactNode }) {
  const style = {
    info: "bg-be-cyan-pale text-be-navy ring-be-cyan/30",
    warning: "bg-amber-50 text-amber-900 ring-amber-200",
    danger: "bg-rose-50 text-rose-900 ring-rose-200",
    success: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  }[tone];
  return <div role={tone === "danger" ? "alert" : "status"} className={`rounded-2xl px-4 py-3 text-sm ring-1 ${style}`}>{children}</div>;
}

/** Shows ?error= / ?ok= feedback from server actions. */
export function ActionFeedback({ sp }: { sp: Record<string, string | string[] | undefined> }) {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const err = friendlyError(one("error"));
  if (err) return <Notice tone="danger">{err}</Notice>;
  if (one("demo")) return <Notice tone="info">This is the demo. Nothing is saved until the AnyVendor database is connected.</Notice>;
  if (one("attach")) return <Notice tone="warning">These files couldn’t be attached: {one("attach")}. Use images or PDFs under 10 MB.</Notice>;
  if (one("sent")) return <Notice tone="success">Request sent. The 24-hour clock has started.</Notice>;
  if (one("ok")) return <Notice tone="success">Saved.</Notice>;
  return null;
}

export function StatusPill({ status }: { status: RequestStatus }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[status]}`}>{STATUS_LABEL[status]}</span>;
}

export function DueLabel({ r }: { r: Pick<RequestRow, "due_at" | "status" | "completed_at"> }) {
  const d = dueInfo(r.due_at, r.status, r.completed_at);
  return <span className={`text-xs ${d.overdue ? "font-semibold text-rose-700" : "text-be-grey"}`}>{d.label}</span>;
}

export function RequestList({ rows, hrefBase = "/business/requests" }: { rows: RequestRow[]; hrefBase?: string }) {
  if (!rows.length) return <p className="py-6 text-center text-sm text-be-grey">No requests yet.</p>;
  return (
    <ul className="divide-y divide-gray-100">
      {rows.map((r) => (
        <li key={r.id}>
          <Link href={`${hrefBase}/${r.id}`} className="flex items-center gap-3 py-3 hover:bg-be-mist/60 md:px-2">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-be-navy">
                <span className="text-be-grey">#{r.ref}</span> {r.title}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2">
                <DueLabel r={r} />
                {r.kind === "feature" && <span className="text-xs text-be-grey">· Feature</span>}
                {r.scope !== "standard" && <span className="text-xs font-medium text-amber-800">· Scope agreed with you</span>}
              </p>
            </div>
            <StatusPill status={r.status} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Btn({ href, children, tone = "primary", className = "" }: { href: string; children: React.ReactNode; tone?: "primary" | "secondary" | "ghost"; className?: string }) {
  const t = {
    primary: "bg-be-navy text-white hover:bg-be-deep",
    secondary: "bg-be-cyan text-be-navy hover:brightness-95",
    ghost: "bg-white text-be-navy ring-1 ring-gray-300 hover:bg-be-mist",
  }[tone];
  return (
    <Link href={href} className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${t} ${className}`}>
      {children}
    </Link>
  );
}

export const inputCls = "w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-[15px] text-be-navy placeholder:text-gray-400 focus:border-be-cyan focus:outline-none focus:ring-2 focus:ring-be-cyan/30";
export const submitCls = "inline-flex items-center justify-center gap-2 rounded-full bg-be-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-be-deep disabled:opacity-50";
