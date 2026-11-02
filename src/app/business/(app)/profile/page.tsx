import { ActionFeedback, Card, CardTitle, Notice, inputCls, submitCls } from "@/components/business/ui";
import { requireBusiness } from "@/lib/business/data";
import { normaliseProfile, profileCompleteness, type VendorProfile } from "@/lib/business/profile-content";
import { INDUSTRIES } from "@/lib/directory";
import { getProfile } from "@/lib/profiles";
import { saveProfile } from "../../kit-actions";

type SP = Promise<Record<string, string | string[] | undefined>>;
const label = "text-sm font-semibold text-be-navy";

/** Starts from the existing AnyVendor directory listing when the business is linked to one. */
function fromDirectory(slug: string | null, name: string): VendorProfile {
  const p = slug ? getProfile(slug) : undefined;
  return normaliseProfile({
    displayName: p?.displayName ?? name,
    tagline: p?.tagline ?? "",
    intro: p?.intro ?? "",
    about: p?.about?.join("\n\n") ?? "",
    services: p?.services?.map((s) => ({ title: s.name, text: s.description })) ?? [],
    areas: p?.areasServed ?? [],
    travels: p?.coverage?.travels ?? "regional",
    priceFrom: p?.cardPrice ? `${p.cardPrice.from} ${p.cardPrice.unit}` : "",
    contact: { website: p?.website ?? "" },
    socials: { instagram: p?.socials?.instagram ?? "", facebook: p?.socials?.facebook ?? "", tiktok: p?.socials?.tiktok ?? "" },
  });
}

export default async function ProfilePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await requireBusiness();
  const b = ctx.business;
  let version = 0;
  let profile = fromDirectory(b.directory_slug, b.name);
  if (ctx.mode === "live") {
    const { data } = await ctx.sb.from("vendor_profiles").select("draft, version").eq("business_id", b.id).maybeSingle();
    if (data && data.version > 0) {
      profile = normaliseProfile(data.draft);
      version = data.version;
    }
  } else {
    profile = normaliseProfile({ displayName: b.name, tagline: "Mobile bars for weddings and parties (demo)", areas: ["Essex", "London"], categories: ["Mobile Bars"] });
  }
  const done = profileCompleteness(profile);
  const categories = INDUSTRIES.flatMap((i) => i.categories as readonly string[]);
  const services = [...profile.services, { title: "", text: "" }, { title: "", text: "" }].slice(0, 12);

  return (
    <>
      <ActionFeedback sp={sp} />
      <div>
        <h1 className="text-2xl font-bold text-be-navy md:text-3xl">My profile</h1>
        <p className="mt-1 text-sm text-be-grey">How you appear in the AnyVendor directory. Changes are reviewed by the AnyVendor team before they go live.</p>
      </div>
      <Card>
        <div className="flex items-center justify-between gap-3">
          <p className="font-bold text-be-navy">{done.percent}% complete</p>
          {done.next && <p className="text-sm text-be-grey">Next: add {done.next}.</p>}
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-be-mist"><div className="h-full rounded-full bg-be-cyan" style={{ width: `${done.percent}%` }} /></div>
      </Card>
      {ctx.mode === "demo" && <Notice tone="info">Demo: changes here aren’t saved.</Notice>}

      <form action={saveProfile} className="space-y-4">
        <input type="hidden" name="expected_version" value={version} />
        <Card>
          <CardTitle>The basics</CardTitle>
          <div className="mt-3 space-y-3">
            <label className="block"><span className={label}>Business name</span><input name="displayName" defaultValue={profile.displayName} maxLength={120} className={`${inputCls} mt-1`} /></label>
            <label className="block"><span className={label}>Tagline</span><input name="tagline" defaultValue={profile.tagline} maxLength={140} placeholder="One line people remember you by" className={`${inputCls} mt-1`} /></label>
            <label className="block"><span className={label}>Short introduction</span><textarea name="intro" rows={2} defaultValue={profile.intro} maxLength={400} className={`${inputCls} mt-1`} /></label>
            <label className="block"><span className={label}>About you</span><textarea name="about" rows={6} defaultValue={profile.about} maxLength={4000} className={`${inputCls} mt-1`} /></label>
          </div>
        </Card>
        <Card>
          <CardTitle>What you do</CardTitle>
          <p className="mt-1 text-xs text-be-grey">Pick up to six.</p>
          <div className="mt-3 flex max-h-64 flex-wrap gap-2 overflow-y-auto">
            {categories.map((c) => (
              <label key={c} className="cursor-pointer">
                <input type="checkbox" name="categories" value={c} defaultChecked={profile.categories.includes(c)} className="peer sr-only" />
                <span className="inline-block rounded-full px-3 py-1.5 text-sm text-be-navy ring-1 ring-gray-300 peer-checked:bg-be-navy peer-checked:text-white peer-checked:ring-be-navy peer-focus-visible:ring-be-cyan">{c}</span>
              </label>
            ))}
          </div>
          <ul className="mt-4 space-y-2">
            {services.map((s, i) => (
              <li key={i} className="grid gap-2 sm:grid-cols-[1fr_2fr]">
                <input name={`services.${i}.title`} defaultValue={s.title} placeholder="Service" maxLength={80} className={inputCls} />
                <input name={`services.${i}.text`} defaultValue={s.text} placeholder="One line about it" maxLength={400} className={inputCls} />
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardTitle>Where you work and prices</CardTitle>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block"><span className={label}>Areas you cover (one per line)</span><textarea name="areas" rows={3} defaultValue={profile.areas.join("\n")} className={`${inputCls} mt-1`} /></label>
            <div className="space-y-3">
              <label className="block"><span className={label}>How far you travel</span>
                <select name="travels" defaultValue={profile.travels} className={`${inputCls} mt-1`}>
                  <option value="local">Local only</option><option value="regional">Around my region</option><option value="nationwide">Anywhere in the UK</option><option value="international">Worldwide</option>
                </select>
              </label>
              <label className="block"><span className={label}>Prices from</span><input name="priceFrom" defaultValue={profile.priceFrom} placeholder="e.g. £350 per event" className={`${inputCls} mt-1`} /></label>
            </div>
          </div>
        </Card>
        <Card>
          <CardTitle>Contact and social</CardTitle>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block"><span className={label}>Email</span><input name="contact.email" type="email" defaultValue={profile.contact.email} className={`${inputCls} mt-1`} /></label>
            <label className="block"><span className={label}>Phone</span><input name="contact.phone" defaultValue={profile.contact.phone} className={`${inputCls} mt-1`} /></label>
            <label className="block sm:col-span-2"><span className={label}>Website (https://…)</span><input name="contact.website" type="url" defaultValue={profile.contact.website} className={`${inputCls} mt-1`} /></label>
            {(["instagram", "facebook", "tiktok", "linkedin"] as const).map((k) => (
              <label key={k} className="block"><span className={`${label} capitalize`}>{k}</span><input name={`socials.${k}`} type="url" defaultValue={profile.socials[k]} placeholder="https://…" className={`${inputCls} mt-1`} /></label>
            ))}
          </div>
        </Card>
        <div className="sticky bottom-20 z-20 rounded-3xl bg-white/95 p-3 shadow-lg ring-1 ring-gray-200 backdrop-blur md:bottom-4">
          <button className={submitCls}>Save profile</button>
        </div>
      </form>
    </>
  );
}
