import type { Metadata } from "next";
import Link from "next/link";
import { BrandLockup } from "@/components/site/BrandMark";
import { Notice, inputCls, submitCls } from "@/components/business/ui";
import { backendReady } from "@/lib/supabase/env";
import { signIn, verifyCode } from "../actions";

export const metadata: Metadata = { title: "Sign in — AnyVendor for business", robots: { index: false, follow: false } };
type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ready = backendReady();
  const error = { email: "Enter a valid email address.", send: "We couldn’t send the email. Try again in a minute.", link: "That sign-in link has expired, was already used, or was opened in a different browser. Type the code from the email below instead, or send a new one.", code: "That code didn’t match. Check the digits or send a new email.", offline: "Sign-in opens when the AnyVendor database is connected." }[String(sp.error ?? "")];
  const email = typeof sp.email === "string" ? sp.email : "";
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "";
  return (
    <main className="flex min-h-screen items-center justify-center bg-be-mist px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center"><BrandLockup /></div>
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h1 className="text-xl font-bold text-be-navy">{sp.sent ? "Check your email" : "Sign in or get started"}</h1>
          <p className="mt-1 text-sm text-be-grey">{sp.sent ? `We’ve emailed ${email || "you"}. Open the link on this device, or type the code from the email below.` : "Use the email address on your AnyVendor listing. We’ll email you a secure link and a code. No password needed."}</p>
          <div className="mt-4 space-y-3">
            {!ready && <Notice tone="warning">Sign-in isn’t switched on in this preview yet.</Notice>}
            {error && <Notice tone="danger">{error}</Notice>}
          </div>
          {sp.sent && (
            <form action={verifyCode} className="mt-4 space-y-3">
              <input type="hidden" name="email" value={email} />
              {next && <input type="hidden" name="next" value={next} />}
              <label className="block">
                <span className="text-sm font-semibold text-be-navy">Code from the email</span>
                <input name="token" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,9}" required placeholder="6-digit code" className={`${inputCls} mt-1 text-center text-lg tracking-[0.3em]`} />
              </label>
              <button className={`${submitCls} w-full`}>Sign in with the code</button>
              <p className="text-xs text-be-grey">The link in the same email also signs you in when opened in this browser.</p>
            </form>
          )}
          <form action={signIn} className="mt-4 space-y-3">
            {typeof sp.next === "string" && sp.next.startsWith("/") && <input type="hidden" name="next" value={sp.next} />}
            <label className="block">
              <span className="text-sm font-semibold text-be-navy">Email</span>
              <input name="email" type="email" required autoComplete="email" defaultValue={email} className={`${inputCls} mt-1`} disabled={!ready} />
            </label>
            <button className={`${submitCls} w-full ${sp.sent ? "bg-white !text-be-navy ring-1 ring-gray-300" : ""}`} disabled={!ready}>{sp.sent ? "Send a new email" : "Continue with email"}</button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-be-grey">
          <Link href="/business/demo" prefetch={false} className="font-semibold text-be-navy underline">Look around the demo</Link> · <Link href="/" className="underline">Back to AnyVendor</Link>
        </p>
      </div>
    </main>
  );
}
