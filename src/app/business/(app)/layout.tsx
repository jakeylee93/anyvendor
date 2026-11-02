import type { Metadata } from "next";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { AvTile } from "@/components/site/BrandMark";
import BusinessNav, { type NavKey } from "@/components/business/BusinessNav";
import { Notice } from "@/components/business/ui";
import { loadAccess, requireBusiness } from "@/lib/business/data";
import { selectBusiness } from "../actions";

export const metadata: Metadata = { title: "Your business — AnyVendor", robots: { index: false, follow: false } };

export default async function BusinessLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireBusiness();
  const access = await loadAccess(ctx);
  const items: { key: NavKey; href: string; label: string }[] = [
    { key: "home", href: "/business", label: "Home" },
    { key: "requests", href: "/business/requests", label: "Requests" },
    { key: "website", href: "/business/website", label: "Website" },
  ];
  if (access.modules.includes("seo")) items.push({ key: "seo", href: "/business/seo", label: "SEO" });
  if (access.modules.includes("social")) items.push({ key: "social", href: "/business/social", label: "Social" });

  return (
    <div className="min-h-screen bg-be-mist pb-24 md:pb-10">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
          <Link href="/business" aria-label="AnyVendor business home" className="shrink-0">
            <AvTile className="h-9 w-9" />
          </Link>
          <div className="min-w-0 flex-1">
            {ctx.businesses.length > 1 ? (
              <details className="relative">
                <summary className="cursor-pointer list-none truncate font-bold text-be-navy">{ctx.business.name} ▾</summary>
                <form action={selectBusiness} className="absolute left-0 top-8 z-40 w-64 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-gray-200">
                  {ctx.businesses.map((b) => (
                    <button key={b.id} name="business" value={b.id} className="block w-full truncate rounded-xl px-3 py-2 text-left text-sm text-be-navy hover:bg-be-mist">
                      {b.name}
                    </button>
                  ))}
                  <Link href="/business/new" className="block rounded-xl px-3 py-2 text-sm font-semibold text-be-navy hover:bg-be-mist">+ Add a business</Link>
                </form>
              </details>
            ) : (
              <p className="truncate font-bold text-be-navy">{ctx.business.name}</p>
            )}
            <p className="text-xs text-be-grey">AnyVendor business</p>
          </div>
          <BusinessNav items={items} />
          <Link href="/business/account" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-be-mist text-be-navy hover:bg-gray-200" aria-label="Account, plan and billing">
            <UserRound size={20} aria-hidden />
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-5 md:py-8">
        {ctx.mode === "demo" && (
          <Notice tone="warning">
            <strong>Demo.</strong> This is a sample business showing the layout. Sign-in, requests, billing and posting switch on when the AnyVendor database and Stripe are connected.
          </Notice>
        )}
        {access.notice && <Notice tone={access.notice.tone}>{access.notice.text} <Link href="/business/account" className="font-semibold underline">Billing</Link></Notice>}
        {children}
      </main>
    </div>
  );
}
