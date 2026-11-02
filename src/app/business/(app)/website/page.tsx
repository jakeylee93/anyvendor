import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ActionFeedback, Btn, Card, CardTitle, Notice, inputCls, submitCls } from "@/components/business/ui";
import { loadAccess, loadWebsite, requireBusiness } from "@/lib/business/data";
import { ACCENTS, normaliseContent } from "@/lib/business/site-content";
import { restoreRevision, saveWebsite } from "../../website-actions";

type SP = Promise<Record<string, string | string[] | undefined>>;
const stamp = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
const label = "text-sm font-semibold text-be-navy";

export default async function WebsiteEditor({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await requireBusiness();
  const [website, access] = await Promise.all([loadWebsite(ctx), loadAccess(ctx)]);
  if (!website) return <Notice tone="danger">No website record found for this business.</Notice>;
  if (website.kind === "external") {
    return (
      <Card>
        <CardTitle>Your website</CardTitle>
        <p className="mt-2 text-sm text-be-grey">Your site is hosted at {website.external_url}. Direct editing isn’t available for sites hosted elsewhere; send a request and we’ll make the change.</p>
        <div className="mt-4 flex gap-2">
          <Btn href="/business/requests/new" tone="secondary">Request an update</Btn>
          {website.external_url && <a href={website.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold text-be-navy ring-1 ring-gray-300">Open site <ExternalLink size={14} aria-hidden /></a>}
        </div>
      </Card>
    );
  }
  const c = normaliseContent(website.draft);
  let history: { id: string; version: number; action: string; created_at: string }[] = [];
  if (ctx.mode === "live") {
    const { data } = await ctx.sb.from("website_revisions").select("id, version, action, created_at").eq("business_id", ctx.business.id).order("created_at", { ascending: false }).limit(12);
    history = data ?? [];
  }
  const canPublish = access.modules.includes("website");
  const services = [...c.services, { title: "", text: "" }, { title: "", text: "" }].slice(0, 12);

  return (
    <>
      <ActionFeedback sp={sp} />
      {sp.published && <Notice tone="success">Published. Your site is live with these changes.</Notice>}
      {sp.restored && <Notice tone="success">That version is back in your draft. Publish when you’re happy.</Notice>}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-be-navy md:text-3xl">Edit website</h1>
          <p className="mt-1 text-sm text-be-grey">
            Draft version {website.draft_version}. {website.published_at ? `Last published ${stamp(website.published_at)}.` : "Not published yet."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/business/preview" target="_blank" className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-be-navy ring-1 ring-gray-300">Preview draft <ExternalLink size={14} aria-hidden /></Link>
          {website.published_revision_id && <a href={`/site/${ctx.business.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-be-navy ring-1 ring-gray-300">Live site <ExternalLink size={14} aria-hidden /></a>}
        </div>
      </div>
      {!canPublish && ctx.mode === "live" && <Notice tone="warning">You can edit and preview now. Publishing needs a plan. <Link href="/business/account" className="font-semibold underline">Choose a plan</Link></Notice>}

      <form action={saveWebsite} className="space-y-4">
        <input type="hidden" name="expected_version" value={website.draft_version} />
        <Card>
          <CardTitle>Top of the page</CardTitle>
          <div className="mt-3 space-y-3">
            <label className="block"><span className={label}>Headline</span><input name="headline" maxLength={120} defaultValue={c.headline} className={`${inputCls} mt-1`} /></label>
            <label className="block"><span className={label}>Short introduction</span><textarea name="intro" rows={2} maxLength={300} defaultValue={c.intro} className={`${inputCls} mt-1`} /></label>
            <label className="block">
              <span className={label}>Main photo</span>
              <input type="hidden" name="heroImage" value={c.heroImage} />
              <input name="heroFile" type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block w-full text-sm text-be-grey file:mr-3 file:rounded-full file:border-0 file:bg-be-mist file:px-4 file:py-2 file:font-semibold file:text-be-navy" />
              {c.heroImage && <span className="mt-1 block text-xs text-be-grey">A photo is set. Choose a new file to replace it.</span>}
            </label>
            <fieldset>
              <legend className={label}>Accent colour</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(Object.keys(ACCENTS) as (keyof typeof ACCENTS)[]).map((k) => (
                  <label key={k} className="cursor-pointer">
                    <input type="radio" name="accent" value={k} defaultChecked={c.accent === k} className="peer sr-only" />
                    <span className="block h-9 w-9 rounded-full ring-2 ring-transparent ring-offset-2 peer-checked:ring-be-navy peer-focus-visible:ring-be-cyan" style={{ background: ACCENTS[k] }} title={k} />
                    <span className="sr-only">{k}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </Card>
        <Card>
          <CardTitle>About</CardTitle>
          <textarea name="about" rows={6} maxLength={3000} defaultValue={c.about} className={`${inputCls} mt-3`} />
        </Card>
        <Card>
          <CardTitle>Services</CardTitle>
          <p className="mt-1 text-xs text-be-grey">Leave a title empty to remove that service.</p>
          <ul className="mt-3 space-y-3">
            {services.map((s, i) => (
              <li key={i} className="grid gap-2 sm:grid-cols-[1fr_2fr]">
                <input name={`services.${i}.title`} defaultValue={s.title} maxLength={80} placeholder="Service" className={inputCls} />
                <input name={`services.${i}.text`} defaultValue={s.text} maxLength={400} placeholder="One line about it" className={inputCls} />
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardTitle>Gallery</CardTitle>
          {c.gallery.length > 0 && (
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {c.gallery.map((g, i) => (
                <li key={g.src} className="space-y-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.src} alt="" className="aspect-4/3 w-full rounded-xl object-cover" />
                  <input type="hidden" name={`gallery.${i}.src`} value={g.src} />
                  <input name={`gallery.${i}.alt`} defaultValue={g.alt} placeholder="Describe the photo" className={`${inputCls} py-1.5 text-sm`} />
                  <label className="flex items-center gap-1.5 text-xs text-be-grey"><input type="checkbox" name={`gallery.${i}.src`} value="" /> Remove</label>
                </li>
              ))}
            </ul>
          )}
          <input name="galleryFiles" type="file" multiple accept="image/jpeg,image/png,image/webp" className="mt-3 block w-full text-sm text-be-grey file:mr-3 file:rounded-full file:border-0 file:bg-be-mist file:px-4 file:py-2 file:font-semibold file:text-be-navy" />
        </Card>
        <Card>
          <CardTitle>Contact</CardTitle>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block"><span className={label}>Email</span><input name="contact.email" type="email" defaultValue={c.contact.email} className={`${inputCls} mt-1`} /></label>
            <label className="block"><span className={label}>Phone</span><input name="contact.phone" defaultValue={c.contact.phone} className={`${inputCls} mt-1`} /></label>
            <label className="block"><span className={label}>Area you cover</span><input name="contact.area" defaultValue={c.contact.area} className={`${inputCls} mt-1`} /></label>
            <label className="block"><span className={label}>Booking link (https://…)</span><input name="contact.bookingUrl" type="url" defaultValue={c.contact.bookingUrl} className={`${inputCls} mt-1`} /></label>
          </div>
        </Card>
        <div className="sticky bottom-20 z-20 flex flex-wrap gap-2 rounded-3xl bg-white/95 p-3 shadow-lg ring-1 ring-gray-200 backdrop-blur md:bottom-4">
          <button name="intent" value="save" className={submitCls}>Save draft</button>
          <button name="intent" value="publish" className="inline-flex items-center rounded-full bg-be-cyan px-5 py-2.5 text-sm font-semibold text-be-navy disabled:opacity-50" disabled={!canPublish}>Save and publish</button>
        </div>
      </form>

      {history.length > 0 && (
        <Card>
          <CardTitle>History</CardTitle>
          <ul className="mt-2 divide-y divide-gray-100 text-sm">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3 py-2">
                <span className="text-be-navy">v{h.version} · {h.action === "publish" ? "Published" : h.action === "restore" ? "Restored" : "Saved"} <span className="text-be-grey">{stamp(h.created_at)}</span></span>
                <form action={restoreRevision}>
                  <input type="hidden" name="revision" value={h.id} />
                  <input type="hidden" name="expected_version" value={website.draft_version} />
                  <button className="text-sm font-semibold text-be-navy underline">Restore</button>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
