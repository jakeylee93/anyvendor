import { Download, ExternalLink, FileText, Trash2 } from "lucide-react";
import { ActionFeedback, Card, CardTitle, Notice, inputCls, submitCls } from "@/components/business/ui";
import { requireBusiness } from "@/lib/business/data";
import { companiesHouseLinks, normaliseKit } from "@/lib/business/brand-kit";
import { removeBrandFile, saveBrandKit, uploadBrandFiles } from "../../kit-actions";

type SP = Promise<Record<string, string | string[] | undefined>>;
interface FileRow { id: string; kind: string; label: string; content_type: string; size_bytes: number; url: string | null; download: string | null }
const label = "text-sm font-semibold text-be-navy";
const kb = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default async function BrandPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await requireBusiness();
  const b = ctx.business;
  let version = 0;
  let kit = normaliseKit({});
  let files: FileRow[] = [];
  if (ctx.mode === "live") {
    const [{ data: k }, { data: f }] = await Promise.all([
      ctx.sb.from("brand_kits").select("data, version").eq("business_id", b.id).maybeSingle(),
      ctx.sb.from("brand_files").select("id, kind, label, content_type, size_bytes, storage_path").eq("business_id", b.id).order("created_at", { ascending: false }),
    ]);
    kit = normaliseKit(k?.data);
    version = k?.version ?? 0;
    files = await Promise.all(
      (f ?? []).map(async (x) => {
        const [view, dl] = await Promise.all([
          ctx.sb.storage.from("brand-assets").createSignedUrl(x.storage_path, 600),
          ctx.sb.storage.from("brand-assets").createSignedUrl(x.storage_path, 600, { download: x.label.replace(/[^\w .-]/g, "") || true }),
        ]);
        return { id: x.id, kind: x.kind, label: x.label, content_type: x.content_type, size_bytes: x.size_bytes, url: view.data?.signedUrl ?? null, download: dl.data?.signedUrl ?? null };
      }),
    );
  } else {
    kit = normaliseKit({ colours: [{ name: "Navy", hex: "#212235" }, { name: "Cyan", hex: "#33ccff" }, { name: "Amber", hex: "#fbb102" }], fonts: ["Lexend Deca"], legalName: "Demo Events Co. Ltd (demo)" });
  }
  const logos = files.filter((f) => f.kind === "logo");
  const docs = files.filter((f) => f.kind !== "logo");
  const ch = companiesHouseLinks(kit.companyNumber);
  const colours = [...kit.colours, { name: "", hex: "" }, { name: "", hex: "" }].slice(0, 12);

  const fileList = (list: FileRow[], empty: string) =>
    list.length === 0 ? (
      <p className="mt-2 text-sm text-be-grey">{empty}</p>
    ) : (
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {list.map((f) => (
          <li key={f.id} className="flex items-center gap-3 rounded-2xl bg-be-mist p-3">
            {f.content_type.startsWith("image/") && f.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.url} alt="" className="h-14 w-14 shrink-0 rounded-xl bg-white object-contain p-1 ring-1 ring-gray-200" />
            ) : (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-gray-200"><FileText size={22} className="text-be-navy" aria-hidden /></span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-be-navy">{f.label}</p>
              <p className="text-xs text-be-grey">{f.content_type.split("/")[1].replace("svg+xml", "SVG").toUpperCase()} · {kb(f.size_bytes)}</p>
            </div>
            {f.download && <a href={f.download} className="rounded-full bg-be-navy p-2 text-white" aria-label={`Download ${f.label}`}><Download size={16} aria-hidden /></a>}
            <form action={removeBrandFile}><input type="hidden" name="file" value={f.id} /><button className="rounded-full p-2 text-be-grey hover:text-rose-700" aria-label={`Remove ${f.label}`}><Trash2 size={16} aria-hidden /></button></form>
          </li>
        ))}
      </ul>
    );

  const uploader = (kind: string, accept: string, hint: string) => (
    <form action={uploadBrandFiles} className="mt-4 flex flex-col gap-2 rounded-2xl border border-dashed border-gray-300 p-3 sm:flex-row sm:items-center">
      <input type="hidden" name="kind" value={kind} />
      <input name="label" placeholder={hint} className={`${inputCls} sm:w-56`} />
      <input name="files" type="file" multiple accept={accept} className="text-sm text-be-grey file:mr-2 file:rounded-full file:border-0 file:bg-be-mist file:px-3 file:py-1.5 file:text-be-navy" />
      <button className={submitCls}>Upload</button>
    </form>
  );

  return (
    <>
      <ActionFeedback sp={sp} />
      <div>
        <h1 className="text-2xl font-bold text-be-navy md:text-3xl">Brand</h1>
        <p className="mt-1 text-sm text-be-grey">Your logo, colours, fonts and company documents in one place, ready to download and share.</p>
      </div>
      {ctx.mode === "demo" && <Notice tone="info">Demo: sample colours shown; uploads and changes aren’t saved.</Notice>}

      <Card>
        <CardTitle>Logos</CardTitle>
        {fileList(logos, "Upload your logo files (SVG is best, plus PNG) so they’re always to hand.")}
        {uploader("logo", "image/svg+xml,image/png,image/jpeg,image/webp", "e.g. Main logo, white version")}
      </Card>

      <form action={saveBrandKit} className="space-y-4">
        <input type="hidden" name="expected_version" value={version} />
        <Card>
          <CardTitle>Colours and fonts</CardTitle>
          {kit.colours.length > 0 && (
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {kit.colours.map((c) => (
                <li key={c.hex} className="overflow-hidden rounded-2xl ring-1 ring-gray-200">
                  <div className="h-16" style={{ background: c.hex }} />
                  <div className="px-3 py-2 text-sm"><p className="font-semibold text-be-navy">{c.name || "Colour"}</p><p className="font-mono text-xs text-be-grey">{c.hex}</p></div>
                </li>
              ))}
            </ul>
          )}
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {colours.map((c, i) => (
              <li key={i} className="flex gap-2">
                <input name={`colours.${i}.name`} defaultValue={c.name} placeholder="Name" className={inputCls} />
                <input name={`colours.${i}.hex`} defaultValue={c.hex} placeholder="#212235" pattern="#[0-9a-fA-F]{6}" className={`${inputCls} w-32 font-mono`} />
              </li>
            ))}
          </ul>
          <label className="mt-4 block"><span className={label}>Fonts (one per line)</span><textarea name="fonts" rows={2} defaultValue={kit.fonts.join("\n")} className={`${inputCls} mt-1`} /></label>
        </Card>
        <Card>
          <CardTitle>Company details</CardTitle>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block"><span className={label}>Registered company name</span><input name="legalName" defaultValue={kit.legalName} className={`${inputCls} mt-1`} /></label>
            <label className="block"><span className={label}>Company number</span><input name="companyNumber" defaultValue={kit.companyNumber} placeholder="8 characters, e.g. 01234567" className={`${inputCls} mt-1`} /></label>
            <label className="block"><span className={label}>VAT number</span><input name="vatNumber" defaultValue={kit.vatNumber} className={`${inputCls} mt-1`} /></label>
            <label className="block"><span className={label}>Registered address</span><input name="registeredAddress" defaultValue={kit.registeredAddress} className={`${inputCls} mt-1`} /></label>
            <label className="block sm:col-span-2"><span className={label}>Notes (tone of voice, logo rules…)</span><textarea name="notes" rows={3} defaultValue={kit.notes} className={`${inputCls} mt-1`} /></label>
          </div>
          {ch && (
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={ch.overview} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-be-mist px-4 py-2 text-sm font-semibold text-be-navy">Companies House record <ExternalLink size={14} aria-hidden /></a>
              <a href={ch.filings} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-be-mist px-4 py-2 text-sm font-semibold text-be-navy">Filing history and documents <ExternalLink size={14} aria-hidden /></a>
              <a href={ch.officers} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-be-mist px-4 py-2 text-sm font-semibold text-be-navy">Officers <ExternalLink size={14} aria-hidden /></a>
            </div>
          )}
          <div className="mt-4"><button className={submitCls}>Save brand details</button></div>
        </Card>
      </form>

      <Card>
        <CardTitle>Documents</CardTitle>
        <p className="mt-1 text-sm text-be-grey">Certificate of incorporation, insurance, food hygiene, licences: anything you’re often asked for.</p>
        {fileList(docs, "No documents yet.")}
        {uploader("document", "application/pdf,image/jpeg,image/png", "e.g. Public liability insurance 2026")}
      </Card>
    </>
  );
}
