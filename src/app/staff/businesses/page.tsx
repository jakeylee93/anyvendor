import type { Metadata } from "next";
import Link from "next/link";
import { AvTile } from "@/components/site/BrandMark";
import { Card, Notice, inputCls, submitCls } from "@/components/business/ui";
import { businessContext } from "@/lib/business/data";
import { BUSINESSES } from "@/lib/directory";
import { selectBusiness } from "@/app/business/actions";
import { provisionBusiness } from "./actions";

export const metadata: Metadata = { title: "Businesses — AnyVendor staff", robots: { index: false, follow: false } };
type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function StaffBusinesses({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await businessContext();
  const shell = (body: React.ReactNode) => (
    <main className="min-h-screen bg-be-mist">
      <header className="border-b border-gray-200 bg-white"><div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4"><AvTile className="h-9 w-9" /><p className="font-bold text-be-navy">Businesses</p><span className="rounded-full bg-be-navy px-2.5 py-0.5 text-xs font-semibold text-white">Staff</span><Link href="/staff" className="ml-auto text-sm font-semibold text-be-navy underline">Request queue</Link></div></header>
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">{body}</div>
    </main>
  );
  if (ctx.mode !== "live" || !ctx.staff) return shell(<Notice tone="danger">This page is for the AnyVendor team.</Notice>);
  const [{ data: rows }, { data: ents }, { data: members }] = await Promise.all([
    ctx.sb.from("businesses").select("id, name, slug, directory_slug, listing_claim_note, created_at, websites(kind, published_at)").order("name"),
    ctx.sb.from("internal_entitlements").select("business_id, plan, label"),
    ctx.sb.from("memberships").select("business_id"),
  ]);
  const ent = new Map((ents ?? []).map((e) => [e.business_id, e]));
  const count = new Map<string, number>();
  for (const m of members ?? []) count.set(m.business_id, (count.get(m.business_id) ?? 0) + 1);

  return shell(
    <>
      {sp.error && <Notice tone="danger">{String(sp.error)}</Notice>}
      <Card>
        <h2 className="font-bold text-be-navy">All businesses</h2>
        <ul className="mt-3 divide-y divide-gray-100">
          {(rows ?? []).map((b) => {
            const w = (Array.isArray(b.websites) ? b.websites[0] : b.websites) as { kind: string; published_at: string | null } | null;
            const e = ent.get(b.id);
            return (
              <li key={b.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/staff/businesses/${b.id}`} className="font-semibold text-be-navy underline decoration-be-cyan decoration-2 underline-offset-4">{b.name}</Link>
                  <p className="text-xs text-be-grey">/{b.slug} · {w?.kind ?? "?"} site{w?.published_at ? ", published" : ""} · {count.get(b.id) ?? 0} member{(count.get(b.id) ?? 0) === 1 ? "" : "s"}
                    {b.directory_slug ? ` · listing ${b.directory_slug}` : b.listing_claim_note ? ` · claims listing “${b.listing_claim_note}” (unverified)` : ""}
                    {e ? ` · internal ${e.plan} plan (${e.label})` : ""}</p>
                </div>
                <form action={selectBusiness}><input type="hidden" name="business" value={b.id} /><button className="rounded-full bg-be-navy px-4 py-2 text-sm font-semibold text-white">Open as staff</button></form>
              </li>
            );
          })}
          {(rows ?? []).length === 0 && <li className="py-6 text-center text-sm text-be-grey">No businesses yet.</li>}
        </ul>
      </Card>
      <Card>
        <h2 className="font-bold text-be-navy">Add a business workspace</h2>
        <p className="mt-1 text-xs text-be-grey">Idempotent by web address. No one is emailed; give people access on the business page afterwards.</p>
        <form action={provisionBusiness} className="mt-3 grid gap-2 sm:grid-cols-2">
          <input name="name" required placeholder="Business name" className={inputCls} />
          <input name="slug" required pattern="[a-z0-9-]{2,60}" placeholder="web-address" className={inputCls} />
          <select name="directory_slug" defaultValue="" className={inputCls}><option value="">No directory listing</option>{BUSINESSES.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}</select>
          <select name="kind" defaultValue="bespoke" className={inputCls}><option value="bespoke">Bespoke site (built elsewhere, content from AnyVendor)</option><option value="hosted">AnyVendor-hosted template</option><option value="external">External site (requests only)</option></select>
          <button className={`${submitCls} sm:col-span-2`}>Create workspace</button>
        </form>
      </Card>
    </>,
  );
}
