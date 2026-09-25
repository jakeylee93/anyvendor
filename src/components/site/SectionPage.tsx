import Link from "next/link";
import SiteShell from "./SiteShell";
import { SECTIONS } from "@/lib/sections";

export default function SectionPage({ section }: { section: string }) {
  const s = SECTIONS[section];
  return (
    <SiteShell>
      <section className="bg-be-mist">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
          <h1 className="text-3xl font-bold text-be-navy md:text-5xl">{s.title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-be-grey">{s.lead}</p>
          <p className="mx-auto mt-6 inline-block rounded-full bg-white px-4 py-2 text-xs text-be-grey ring-1 ring-gray-200">
            Testing preview — this section is not live yet.
          </p>
          <div className="mt-8">
            <Link href="/directory" className="inline-flex rounded-full bg-be-cyan px-6 py-3 font-semibold text-be-navy">
              Browse the Directory
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
