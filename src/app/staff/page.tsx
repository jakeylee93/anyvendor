import type { Metadata } from "next";
import Link from "next/link";
import { AvTile } from "@/components/site/BrandMark";
import { Card, DueLabel, Notice, StatusPill } from "@/components/business/ui";
import { businessContext } from "@/lib/business/data";
import { nowMs, type RequestScope, type RequestStatus } from "@/lib/business/requests";

export const metadata: Metadata = { title: "Request queue — AnyVendor staff", robots: { index: false, follow: false } };
type SP = Promise<Record<string, string | string[] | undefined>>;
interface Row { id: string; ref: number; title: string; status: RequestStatus; kind: string; scope: RequestScope; submitted_at: string; due_at: string; completed_at: string | null; preview_url: string | null; businesses: { name: string } | { name: string }[] | null }

export default async function StaffQueue({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await businessContext();
  const shell = (body: React.ReactNode) => (
    <main className="min-h-screen bg-be-mist">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <AvTile className="h-9 w-9" />
          <p className="font-bold text-be-navy">Request queue</p>
          <Link href="/staff/businesses" className="ml-auto text-sm font-semibold text-be-navy underline">Businesses</Link>
          <span className="rounded-full bg-be-navy px-2.5 py-0.5 text-xs font-semibold text-white">Staff</span>
        </div>
      </header>
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-6">{body}</div>
    </main>
  );
  if (ctx.mode === "demo") return shell(<Notice tone="warning">The staff queue needs the AnyVendor database. It is not connected in this preview yet.</Notice>);
  if (!ctx.staff) return shell(<Notice tone="danger">This page is for the AnyVendor team. Ask an administrator to add you as staff.</Notice>);

  const showDone = sp.done === "1";
  let q = ctx.sb
    .from("update_requests")
    .select("id, ref, title, status, kind, scope, submitted_at, due_at, completed_at, preview_url, businesses(name)")
    .order("due_at", { ascending: true })
    .limit(300);
  q = showDone ? q.eq("status", "completed") : q.neq("status", "completed");
  const { data } = await q;
  const rows = (data ?? []) as Row[];
  const now = nowMs();
  const overdue = rows.filter((r) => r.status !== "completed" && new Date(r.due_at).getTime() < now).length;

  return shell(
    <>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href="/staff" className={`rounded-full px-4 py-2 font-semibold ${!showDone ? "bg-be-navy text-white" : "bg-white text-be-navy ring-1 ring-gray-300"}`}>Open ({showDone ? "…" : rows.length})</Link>
        <Link href="/staff?done=1" className={`rounded-full px-4 py-2 font-semibold ${showDone ? "bg-be-navy text-white" : "bg-white text-be-navy ring-1 ring-gray-300"}`}>Completed</Link>
        {!showDone && overdue > 0 && <span className="rounded-full bg-rose-100 px-3 py-1.5 font-semibold text-rose-800">{overdue} overdue</span>}
      </div>
      <Card flush>
        <ul className="divide-y divide-gray-100">
          {rows.map((r) => {
            const late = r.status !== "completed" && new Date(r.due_at).getTime() < now;
            const biz = Array.isArray(r.businesses) ? r.businesses[0]?.name : r.businesses?.name;
            return (
              <li key={r.id} className={late ? "bg-rose-50/60" : ""}>
                <Link href={`/staff/requests/${r.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-be-mist">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-be-navy">{r.title}</p>
                    <p className="text-xs text-be-grey">{biz} · #{r.ref} · {r.kind === "feature" ? "Feature" : "Update"}{r.scope !== "standard" ? " · scope flagged" : ""}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusPill status={r.status} />
                    <DueLabel r={r} />
                  </div>
                </Link>
              </li>
            );
          })}
          {rows.length === 0 && <li className="px-4 py-8 text-center text-sm text-be-grey">Nothing here.</li>}
        </ul>
      </Card>
    </>,
  );
}
