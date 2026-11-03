import type { Metadata } from "next";
import SiteShell from "@/components/site/SiteShell";
import PricingPlans from "@/components/site/PricingPlans";

export const metadata: Metadata = { title: "Pricing — AnyVendor", description: "Five simple plans for event businesses, from a directory listing to a bespoke website, marketing, social scheduling and your own AI assistant. All prices include VAT." };

export default function PricingPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-14 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-caveat text-2xl text-be-cyan">plans</p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight text-be-navy md:text-6xl">Simple plans. Everything included.</h1>
          <p className="mt-4 text-lg text-be-navy/70">Start with a listing. Add a website, marketing, social scheduling or your own assistant when you’re ready. Each plan includes everything below it.</p>
        </div>
        <div className="mt-10"><PricingPlans /></div>
        <div className="mx-auto mt-14 max-w-3xl space-y-4 text-sm text-be-navy/80">
          <h2 className="text-xl font-bold text-be-navy">What the words mean</h2>
          <p><strong>Unlimited website updates</strong> means unlimited requests. Normal edits (copy, photos, prices, dates, a new section) are usually done within 24 hours. A larger new feature, such as online booking or a shop, is scoped and scheduled with you first.</p>
          <p><strong>SEO workflows</strong> are the technical and content work we do on your site and the Search Console reporting in your dashboard. We cannot promise rankings.</p>
          <p><strong>Social scheduling</strong> posts to accounts you connect, when you choose. You write and approve what goes out.</p>
          <p><strong>Featured placement</strong> on the homepage is a separate, clearly labelled local promotion. It is not included in any plan and its price will be published separately.</p>
          <p><strong>AI Plus</strong> gives you an assistant hosted by us that only works inside your own AnyVendor business. Anything that reaches a customer or spends money waits for your approval, and every action is logged. Included usage and overages will be published before it goes on sale.</p>
        </div>
      </section>
    </SiteShell>
  );
}
