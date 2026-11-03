import type { Metadata } from "next";
import Link from "next/link";
import { BrandLockup } from "@/components/site/BrandMark";
import { Notice, inputCls, submitCls } from "@/components/business/ui";
import { backendReady } from "@/lib/supabase/env";
import { signIn } from "../actions";

export const metadata: Metadata = { title: "Sign in — AnyVendor for business", robots: { index: false, follow: false } };
type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ready = backendReady();
  const error = { email: "Enter a valid email address.", send: "We couldn’t send the link. Try again in a minute.", link: "That sign-in link has expired or was already used. Send a new one.", offline: "Sign-in opens when the AnyVendor database is connected." }[String(sp.error ?? "")];
  return (
    <main className="flex min-h-screen items-center justify-center bg-be-mist px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center"><BrandLockup /></div>
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h1 className="text-xl font-bold text-be-navy">Sign in to your business</h1>
          <p className="mt-1 text-sm text-be-grey">We’ll email you a secure link. No password needed.</p>
          <div className="mt-4 space-y-3">
            {!ready && <Notice tone="warning">Sign-in isn’t switched on in this preview yet.</Notice>}
            {error && <Notice tone="danger">{error}</Notice>}
            {sp.sent && <Notice tone="success">Check your email for the sign-in link.</Notice>}
          </div>
          <form action={signIn} className="mt-4 space-y-3">
            {typeof sp.next === "string" && sp.next.startsWith("/") && <input type="hidden" name="next" value={sp.next} />}
            <label className="block">
              <span className="text-sm font-semibold text-be-navy">Email</span>
              <input name="email" type="email" required autoComplete="email" className={`${inputCls} mt-1`} disabled={!ready} />
            </label>
            <button className={`${submitCls} w-full`} disabled={!ready}>Email me a link</button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-be-grey">
          <Link href="/business/demo" prefetch={false} className="font-semibold text-be-navy underline">Look around the demo</Link> · <Link href="/" className="underline">Back to AnyVendor</Link>
        </p>
      </div>
    </main>
  );
}
