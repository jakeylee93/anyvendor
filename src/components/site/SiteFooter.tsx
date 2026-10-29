import Link from "next/link";
import { Logo, ListButton } from "./SiteHeader";

export function SupplierCta() {
  return (
    <section className="bg-be-navy text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-caveat text-2xl text-be-cyan">Grow with us</p>
          <h2 className="mt-1 text-3xl font-semibold md:text-4xl">Are You An Event Supplier?</h2>
          <p className="mt-3 max-w-xl text-white/75">
            Get your business in front of people planning their next event. Listing is free while we onboard.
          </p>
        </div>
        <ListButton className="px-7 py-3.5" />
      </div>
    </section>
  );
}

export function Newsletter() {
  return (
    <section className="bg-be-mist">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-be-navy">Keep up to date with Anyvendor</h2>
        <div className="flex w-full max-w-md flex-col gap-1">
          <div className="flex gap-2">
            <input
              type="email"
              disabled
              aria-label="Email address (sign-up not connected in this preview)"
              placeholder="Email address"
              className="min-w-0 flex-1 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm disabled:opacity-60"
            />
            <button type="button" disabled className="rounded-full bg-be-navy px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-be-grey">Newsletter sign-up is not connected in this testing preview.</p>
        </div>
      </div>
    </section>
  );
}

const COLS = [
  {
    title: "Find",
    links: [
      ["/directory", "Directory"],
      ["/people", "People"],
      ["/venues", "Venues"],
      ["/#plan", "Plan my event"],
    ],
  },
  {
    title: "Anyvendor",
    links: [
      ["/how-it-works", "How it works"],
      ["/list-my-business", "List my business"],
      ["/contact", "Contact"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["/privacy-policy", "Privacy Policy"],
      ["/cookies-policy", "Cookies Policy"],
      ["/terms-conditions", "Terms & Conditions"],
    ],
  },
] as const;

export default function SiteFooter() {
  return (
    <footer className="bg-be-deep text-white print:hidden">
      <div className="be-gradient-line" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="inline-block rounded-lg bg-white px-3 py-2">
            <Logo />
          </div>
          <p className="mt-4 text-sm text-white/70">Find Top Event Professionals. No middlemen, no markups.</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-be-cyan">{c.title}</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              {c.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-white/60">
          © {new Date().getFullYear()} Anyvendor · Testing preview reconstructed from Booked Events. Listings are historical and
          unconfirmed; enquiries, bookings and payments are not active.
        </p>
      </div>
    </footer>
  );
}
