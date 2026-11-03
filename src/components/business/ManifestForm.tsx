import type { Field, Manifest, Section, SiteContent } from "@/lib/business/manifest";
import { inputCls } from "./ui";

const label = "text-sm font-semibold text-be-navy";
const title = (k: string, l?: string) => l ?? k.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
const fileCls = "mt-1 block w-full text-sm text-be-grey file:mr-3 file:rounded-full file:border-0 file:bg-be-mist file:px-3 file:py-1.5 file:text-be-navy";

function FieldInput({ name, f, value }: { name: string; f: Field; value: unknown }) {
  const v = value as never;
  switch (f.type) {
    case "text":
      return <input name={name} defaultValue={(v as string) ?? ""} maxLength={f.max ?? 200} className={inputCls} />;
    case "textarea":
      return <textarea name={name} rows={3} defaultValue={(v as string) ?? ""} maxLength={f.max ?? 2000} className={inputCls} />;
    case "richtext":
      return <textarea name={name} rows={8} defaultValue={(v as string) ?? ""} maxLength={f.max ?? 10000} className={inputCls} />;
    case "number":
      return <input name={name} type="number" defaultValue={(v as number) ?? ""} className={inputCls} />;
    case "boolean":
      return <label className="flex items-center gap-2 text-sm text-be-navy"><input type="checkbox" name={name} defaultChecked={Boolean(v)} /> Yes</label>;
    case "select":
      return <select name={name} defaultValue={(v as string) ?? f.options?.[0]} className={inputCls}>{(f.options ?? []).map((o) => <option key={o}>{o}</option>)}</select>;
    case "link": {
      const l = (v as { href?: string; label?: string }) ?? {};
      return <div className="grid gap-2 sm:grid-cols-2"><input name={`${name}.label`} defaultValue={l.label ?? ""} placeholder="Button text" className={inputCls} /><input name={`${name}.href`} defaultValue={l.href ?? ""} placeholder="https://…" className={inputCls} /></div>;
    }
    case "image": {
      const im = (v as { src?: string; alt?: string }) ?? {};
      return (
        <div className="flex flex-wrap items-start gap-3">
          {im.src && /* eslint-disable-next-line @next/next/no-img-element */ <img src={im.src} alt="" className="h-20 w-28 rounded-xl object-cover ring-1 ring-gray-200" />}
          <div className="min-w-0 flex-1">
            <input type="hidden" name={`${name}.src`} value={im.src ?? ""} />
            <input name={`file:${name}`} type="file" accept="image/jpeg,image/png,image/webp" className={fileCls} />
            <input name={`${name}.alt`} defaultValue={im.alt ?? ""} placeholder="Describe the image" className={`${inputCls} mt-1`} />
            {im.src && <label className="mt-1 flex items-center gap-1.5 text-xs text-be-grey"><input type="checkbox" name={`${name}.src`} value="" /> Remove image</label>}
          </div>
        </div>
      );
    }
    case "list": {
      const rows = Array.isArray(v) ? (v as Record<string, unknown>[]) : [];
      const all = [...rows, {}, {}].slice(0, f.max ?? 24);
      return (
        <ul className="space-y-3">
          {all.map((row, i) => (
            <li key={i} className={`rounded-2xl p-3 ring-1 ring-gray-200 ${i >= rows.length ? "bg-be-mist/50" : "bg-white"}`}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-be-grey">{i >= rows.length ? "New item" : `Item ${i + 1}`}</p>
              <div className="space-y-2">
                {(f.fields ?? []).map((sub) => (
                  <div key={sub.key}><span className="text-xs font-semibold text-be-navy">{title(sub.key, sub.label)}</span><div className="mt-1"><FieldInput name={`${name}.${i}.${sub.key}`} f={sub} value={row[sub.key]} /></div></div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      );
    }
  }
}

/** Editor form rendered from the site's manifest. Leaves a list item's text fields empty to remove it. */
export default function ManifestForm({ manifest, content }: { manifest: Manifest; content: SiteContent }) {
  return (
    <>
      {manifest.sections.map((s: Section) => (
        <section key={s.key} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200/80 md:p-6">
          <h2 className="text-lg font-bold text-be-navy">{title(s.key, s.label)}</h2>
          {s.help && <p className="mt-1 text-sm text-be-grey">{s.help}</p>}
          <div className="mt-3 space-y-4">
            {s.fields.map((f) => (
              <div key={f.key}>
                <span className={label}>{title(f.key, f.label)}</span>
                {f.help && <span className="block text-xs text-be-grey">{f.help}</span>}
                <div className="mt-1"><FieldInput name={`${s.key}.${f.key}`} f={f} value={content[s.key]?.[f.key]} /></div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
