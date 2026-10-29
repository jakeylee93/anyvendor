import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import PlanDocument, { type PlanVendor } from "@/components/site/PlanDocument";
import { BUSINESSES, categoriesOf } from "@/lib/directory";
import { getProfile } from "@/lib/profiles";

export const metadata: Metadata = { title: "My plan — Anyvendor" };

export default function MyPlanPage() {
  // Compact vendor facts for the client-side document (no profile text, no galleries).
  const vendors: Record<string, PlanVendor> = {};
  for (const b of BUSINESSES) {
    const p = getProfile(b.slug);
    vendors[b.slug] = {
      slug: b.slug,
      name: p?.displayName ?? b.name,
      categories: categoriesOf(b),
      place: p?.basedIn?.text.split(/[,(]/)[0].trim() ?? b.region ?? null,
      price: p?.cardPrice ?? null,
      logo: p?.logo ? { src: p.logo.src, plate: p.logo.plate } : null,
      photo: p?.card?.src ?? null,
      website: p?.website ?? null,
      email: p?.contact?.email ?? null,
      phone: p?.contact?.phone ?? null,
    };
  }
  return (
    <SiteShell>
      <PlanDocument vendors={vendors} />
    </SiteShell>
  );
}
