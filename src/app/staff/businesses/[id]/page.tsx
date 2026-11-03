import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, Notice, inputCls, submitCls } from "@/components/business/ui";
import { businessContext } from "@/lib/business/data";
import { BUSINESSES } from "@/lib/directory";
import { STARTER_MANIFEST } from "@/lib/business/manifest";
import { PLANS, gbp } from "@/lib/business/plans";
import { selectBusiness } from "@/app/business/actions";
import { addPendingAccess, grantInternalPlan, linkListing, revokePendingAccess, rotatePreviewToken, setManifest, setSiteKind } from "../actions";

type SP = Promise<Record<string, string | string[] | undefined>>;
const stamp = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });

export default async function StaffBusiness({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SP }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const ctx = await businessContext();
  if (ctx.mode !== "live" || !ctx.staff) redirect("/staff");
  const [{ data: b }, { data: w }, { data: pend }, { data: ent }, { data: mem }, { data: log }] = await Promise.all([
    ctx.sb.from("businesses").select("id, name, slug, directory_slug, listing_claim_note, created_at").eq("id", id).maybeSingle(),
    ctx.sb.from("websites").select("kind, external_url, revalidate_url, manifest, manifest_version, preview_token, draft_version, published_at").eq("business_id", id).maybeSingle(),
    ctx.sb.from("pending_access").select("id, email, role, make_staff, note, claimed_at").eq("business_id", id).order("created_at"),
    ctx.sb.from("internal_entitlements").select("plan, label, expires_at").eq("business_id", id).maybeSingle(),
    ctx.sb.from("memberships").select("user_id, role").eq("business_id", id),
    ctx.sb.from("audit_log").select("at, action, detail").eq("business_id", id).order("id", { ascending: false }).limit(15),
  ]);
  if (!b) notFound();
  const origin = process.env.APP_URL?.replace(/\/$/, "") ?? "";
  const err = typeof sp.error === "string" ? sp.error : null;

  return (
    <main className="min-h-screen bg-be-mist px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <Link href="/staff/businesses" className="text-sm font-semibold text-be-navy">← Businesses</Link>
        {err && <Notice tone="danger">{err === "manifest_invalid" ? `Manifest rejected: ${sp.why}` : err === "manifest_json" ? "The manifest isn’t valid JSON." : err}</Notice>}
        {sp.ok && <Notice tone="success">Saved.</Notice>}
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-be-navy">{b.name}</h1>
              <p className="text-sm text-be-grey">/{b.slug} · created {stamp(b.created_at)} · {(mem ?? []).length} member{(mem ?? []).length === 1 ? "" : "s"}</p>
            </div>
            <form action={selectBusiness}><input type="hidden" name="business" value={b.id} /><button className={submitCls}>Open as staff</button></form>
          </div>
        </Card>

        <Card>
          <h2 className="font-bold text-be-navy">Directory listing</h2>
          <p className="mt-1 text-sm text-be-grey">{b.directory_slug ? `Linked to “${b.directory_slug}”.` : b.listing_claim_note ? `They say they are listed as “${b.listing_claim_note}”. Verify before linking.` : "Not linked."}</p>
          <form action={linkListing} className="mt-3 flex gap-2">
            <input type="hidden" name="business" value={b.id} />
            <select name="directory_slug" defaultValue={b.directory_slug ?? ""} className={inputCls}><option value="">No listing</option>{BUSINESSES.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}</select>
            <button className="shrink-0 rounded-full px-4 text-sm font-semibold text-be-navy ring-1 ring-gray-300">Link</button>
          </form>
        </Card>

        <Card>
          <h2 className="font-bold text-be-navy">People</h2>
          <p className="mt-1 text-sm text-be-grey">Access is keyed to the exact email. If that person already has an AnyVendor account it applies now; otherwise it applies the moment they sign in. Nothing is emailed from here.</p>
          <ul className="mt-3 space-y-1 text-sm">
            {(pend ?? []).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 rounded-xl bg-be-mist px-3 py-2">
                <span className="text-be-navy">{p.email} · {p.make_staff ? "staff" : p.role}{p.note ? ` · ${p.note}` : ""} · {p.claimed_at ? `granted ${stamp(p.claimed_at)}` : "pending sign-in"}</span>
                {!p.claimed_at && <form action={revokePendingAccess}><input type="hidden" name="business" value={b.id} /><input type="hidden" name="pending" value={p.id} /><button className="text-be-grey underline">Remove</button></form>}
              </li>
            ))}
            {(pend ?? []).length === 0 && <li className="text-be-grey">No one added yet.</li>}
          </ul>
          <form action={addPendingAccess} className="mt-3 grid gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
            <input type="hidden" name="business" value={b.id} />
            <input name="email" type="email" required placeholder="person@business.co.uk" className={inputCls} />
            <select name="role" defaultValue="owner" className={inputCls}><option value="owner">Owner</option><option value="editor">Editor</option></select>
            <input name="note" placeholder="Note" className={inputCls} />
            <button className={submitCls}>Add</button>
          </form>
        </Card>

        <Card>
          <h2 className="font-bold text-be-navy">Internal test plan</h2>
          <p className="mt-1 text-sm text-be-grey">{ent ? `${ent.plan} · ${ent.label}${ent.expires_at ? ` · until ${stamp(ent.expires_at)}` : ""}. Shown to the business as an internal test plan, never as a paid subscription.` : "None. Paid access comes only from Stripe."}</p>
          <form action={grantInternalPlan} className="mt-3 grid gap-2 sm:grid-cols-[1fr_2fr_1fr_auto]">
            <input type="hidden" name="business" value={b.id} />
            <select name="plan" defaultValue={ent?.plan ?? "social"} className={inputCls}><option value="">Remove</option>{PLANS.map((p) => <option key={p.code} value={p.code}>{p.name} ({gbp(p.monthlyPence)})</option>)}</select>
            <input name="label" defaultValue={ent?.label ?? "Internal test plan"} className={inputCls} />
            <input name="expires" type="date" className={inputCls} />
            <button className={submitCls}>Set</button>
          </form>
        </Card>

        <Card>
          <h2 className="font-bold text-be-navy">Website</h2>
          <p className="mt-1 text-sm text-be-grey">Draft v{w?.draft_version ?? 0}{w?.published_at ? `, published ${stamp(w.published_at)}` : ", not published"}. Manifest v{w?.manifest_version ?? 0}.</p>
          <form action={setSiteKind} className="mt-3 grid gap-2">
            <input type="hidden" name="business" value={b.id} />
            <select name="kind" defaultValue={w?.kind ?? "hosted"} className={inputCls}><option value="bespoke">Bespoke site (content from AnyVendor)</option><option value="hosted">AnyVendor-hosted template</option><option value="external">External site (requests only)</option></select>
            <input name="external_url" type="url" defaultValue={w?.external_url ?? ""} placeholder="https://their-site.vercel.app (the live site)" className={inputCls} />
            <input name="revalidate_url" type="url" defaultValue={w?.revalidate_url ?? ""} placeholder="https://their-site.vercel.app/api/revalidate (optional)" className={inputCls} />
            <button className={`${submitCls} w-fit`}>Save site settings</button>
          </form>
          <p className="mt-4 text-sm text-be-navy">Public content: <code className="rounded bg-be-mist px-1">{origin || "<app>"}/api/sites/{b.slug}/content</code></p>
          <p className="text-sm text-be-navy">Draft preview: <code className="rounded bg-be-mist px-1">{origin || "<app>"}/api/sites/{b.slug}/content?preview={w?.preview_token ?? "…"}</code></p>
          <form action={rotatePreviewToken} className="mt-1"><input type="hidden" name="business" value={b.id} /><button className="text-xs text-be-grey underline">Rotate preview token</button></form>
          <form action={setManifest} className="mt-4">
            <input type="hidden" name="business" value={b.id} />
            <label className="block text-sm font-semibold text-be-navy">Manifest (JSON, contract v1)</label>
            <textarea name="manifest" rows={14} defaultValue={JSON.stringify(w?.manifest && Object.keys(w.manifest as object).length ? w.manifest : STARTER_MANIFEST, null, 2)} className={`${inputCls} mt-1 font-mono text-xs`} />
            <button className={`${submitCls} mt-2`}>Save manifest</button>
          </form>
        </Card>

        <Card>
          <h2 className="font-bold text-be-navy">Recent activity</h2>
          <ul className="mt-2 space-y-1 text-xs text-be-grey">
            {(log ?? []).map((l, i) => <li key={i}>{stamp(l.at)} · {l.action} {Object.keys(l.detail ?? {}).length ? JSON.stringify(l.detail) : ""}</li>)}
            {(log ?? []).length === 0 && <li>Nothing yet.</li>}
          </ul>
        </Card>
      </div>
    </main>
  );
}
