import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandLockup } from "@/components/site/BrandMark";
import { ActionFeedback, inputCls, submitCls } from "@/components/business/ui";
import { businessContext } from "@/lib/business/data";
import { createBusiness } from "../actions";

export const metadata: Metadata = { title: "Set up your business — AnyVendor", robots: { index: false, follow: false } };
type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function NewBusinessPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await businessContext();
  if (ctx.mode === "demo") redirect("/business");
  const v = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  return (
    <main className="min-h-screen bg-be-mist px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="flex justify-center"><BrandLockup layout="row" /></div>
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h1 className="text-xl font-bold text-be-navy">Set up your business</h1>
          <p className="mt-1 text-sm text-be-grey">You’ll be the owner. You can add teammates later.</p>
          <div className="mt-3"><ActionFeedback sp={sp} /></div>
          <form action={createBusiness} className="mt-4 space-y-4">
            {v("plan") && <input type="hidden" name="plan" value={v("plan")} />}
            {v("interval") && <input type="hidden" name="interval" value={v("interval")} />}
            <label className="block">
              <span className="text-sm font-semibold text-be-navy">Business name</span>
              <input name="name" required minLength={2} maxLength={120} defaultValue={v("name")} className={`${inputCls} mt-1`} />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-be-navy">Website address</span>
              <span className="mt-1 flex items-center rounded-xl border border-gray-300 bg-white pl-3 text-sm text-be-grey focus-within:ring-2 focus-within:ring-be-cyan/30">
                anyvendor/site/
                <input name="slug" required pattern="[a-z0-9-]{2,60}" defaultValue={v("slug")} placeholder="your-business" className="w-full rounded-r-xl px-1 py-2.5 text-[15px] text-be-navy focus:outline-none" />
              </span>
              <span className="mt-1 block text-xs text-be-grey">Lowercase letters, numbers and hyphens.</span>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-be-navy">Already listed on AnyVendor? (optional)</span>
              <input name="directory_slug" maxLength={120} defaultValue={v("directory_slug")} placeholder="Tell us the listing name" className={`${inputCls} mt-1`} />
              <span className="mt-1 block text-xs text-be-grey">The AnyVendor team checks you own the listing before it’s linked. Naming it here doesn’t change anything public.</span>
            </label>
            <button className={`${submitCls} w-full`}>Create business</button>
          </form>
        </div>
      </div>
    </main>
  );
}
