import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";

export default function NotFound() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="font-caveat text-2xl text-be-cyan">Oops</p>
        <h1 className="mt-1 text-3xl font-bold text-be-navy md:text-4xl">We couldn’t find that page</h1>
        <p className="mt-3 text-be-grey">The business or page may have moved, or isn’t part of this testing preview.</p>
        <Link href="/directory" className="mt-8 inline-flex rounded-full bg-be-cyan px-6 py-3 font-semibold text-be-navy">
          View all businesses
        </Link>
      </section>
    </SiteShell>
  );
}
