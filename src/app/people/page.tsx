import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";

export const metadata: Metadata = { title: "People — Anyvendor" };

const ROLES = ["Musicians", "Singers", "DJs", "Mixologists", "Hosts & MCs", "Brand ambassadors", "Magicians", "Photographers", "Event crew"];

export default function PeoplePage() {
  return (
    <SiteShell>
      <section className="bg-be-mist">
        <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
          <p className="font-caveat text-3xl text-be-cyan">the talent</p>
          <h1 className="mt-1 text-4xl font-bold text-be-navy md:text-6xl">People</h1>
          <p className="mt-4 max-w-2xl text-lg text-be-grey">
            Individual event professionals you can book directly: musicians, hosts, mixologists, performers and crew. Each person gets a profile card like a business, linked to the companies they work with.
          </p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <li key={r} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-be-navy ring-1 ring-gray-200">
                {r}
              </li>
            ))}
          </ul>
          <div className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-gray-200">
            <h2 className="text-xl font-semibold text-be-navy">Opening soon</h2>
            <p className="mt-2 text-be-grey">
              We’re building the first profiles now. If you’re a performer or professional who’d like to be listed, use the List my business page and tell us you’re an individual.
            </p>
            <Link href="/list-my-business" className="mt-5 inline-flex rounded-full bg-be-cyan px-6 py-3 font-semibold text-be-navy">
              Register interest
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
