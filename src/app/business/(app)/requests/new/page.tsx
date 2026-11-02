import Link from "next/link";
import { ActionFeedback, Card, Notice, inputCls, submitCls } from "@/components/business/ui";
import { loadAccess, requireBusiness } from "@/lib/business/data";
import { createRequest } from "../../../actions";

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function NewRequestPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await requireBusiness();
  const access = await loadAccess(ctx);
  const v = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const allowed = access.modules.includes("requests");
  return (
    <>
      <ActionFeedback sp={sp} />
      <h1 className="text-2xl font-bold text-be-navy md:text-3xl">Request an update</h1>
      {!allowed && ctx.mode === "live" && (
        <Notice tone="warning">
          Requests need an active plan. <Link href="/business/account" className="font-semibold underline">Choose a plan</Link>
        </Notice>
      )}
      <Card>
        <form action={createRequest} className="space-y-4">
          <fieldset>
            <legend className="text-sm font-semibold text-be-navy">What kind of request?</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {[
                ["update", "A change", "Words, photos, prices, pages"],
                ["feature", "A new feature", "Something your site doesn’t do yet"],
              ].map(([val, label, hint]) => (
                <label key={val} className="flex cursor-pointer items-start gap-3 rounded-2xl p-3 ring-1 ring-gray-300 has-[:checked]:bg-be-cyan-pale has-[:checked]:ring-be-cyan">
                  <input type="radio" name="kind" value={val} defaultChecked={(v("kind") || "update") === val} className="mt-1" />
                  <span>
                    <span className="block font-semibold text-be-navy">{label}</span>
                    <span className="block text-sm text-be-grey">{hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="text-sm font-semibold text-be-navy">Short title</span>
            <input name="title" required minLength={3} maxLength={140} defaultValue={v("title")} placeholder="e.g. Add our winter cocktail menu" className={`${inputCls} mt-1`} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-be-navy">What would you like?</span>
            <textarea name="body" required rows={6} maxLength={8000} placeholder="Describe the change, where it goes and anything we should know." className={`${inputCls} mt-1`} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-be-navy">Attachments (optional)</span>
            <input name="files" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" className="mt-1 block w-full text-sm text-be-grey file:mr-3 file:rounded-full file:border-0 file:bg-be-mist file:px-4 file:py-2 file:font-semibold file:text-be-navy" />
            <span className="mt-1 block text-xs text-be-grey">Images or PDFs, up to 10 MB each.</span>
          </label>
          <p className="text-sm text-be-grey">When you send this, the 24-hour clock starts. Bigger features may need a quick conversation about scope; we’ll tell you here if so.</p>
          <button type="submit" className={submitCls} disabled={ctx.mode === "live" && !allowed}>Send request</button>
        </form>
      </Card>
    </>
  );
}
