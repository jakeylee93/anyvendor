import Link from "next/link";
import { MapPin } from "lucide-react";
import { type Business, categoriesOf } from "@/lib/directory";

const TINTS = [
  ["#33ccff", "#212235"],
  ["#fbb102", "#212235"],
  ["#9966cc", "#ffffff"],
  ["#ff69eb", "#212235"],
  ["#65bc7b", "#212235"],
  ["#212235", "#33ccff"],
];

function initials(name: string) {
  const words = name.replace(/[&]/g, " ").split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
}

/** Stand-in for the original logo/photo, which could not be recovered. */
export function Monogram({ business, className = "" }: { business: Business; className?: string }) {
  const i = [...business.slug].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length;
  const [bg, fg] = TINTS[i];
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ background: `linear-gradient(135deg, ${bg}, ${bg}cc)`, color: fg }}
      role="img"
      aria-label={`${business.name} (original image not yet recovered)`}
    >
      <span className="text-4xl font-bold tracking-tight">{initials(business.name)}</span>
    </div>
  );
}

export function locationLabel(b: Business) {
  return b.address ?? "No Address";
}

export default function BusinessCard({ business }: { business: Business }) {
  const cats = categoriesOf(business);
  const inferred = !business.listedCategories.length && cats.length > 0;
  return (
    <Link
      href={`/businesses/${business.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-be-cyan"
    >
      <Monogram business={business} className="aspect-4/3 w-full" />
      <div className="flex flex-1 flex-col px-4 pt-4">
        <h3 className="truncate text-lg font-semibold text-be-navy group-hover:text-be-cyan">{business.name}</h3>
        <p className="text-xs font-light text-be-grey">{business.established}</p>
        {cats.length > 0 && (
          <p className="mt-2 text-xs text-be-navy">
            {cats.join("  ·  ")}
            {inferred && <span className="ml-1 text-be-grey">(unconfirmed)</span>}
          </p>
        )}
        <p className="mt-2 flex items-start gap-1 text-xs text-be-grey">
          <MapPin size={13} className="mt-0.5 shrink-0" aria-hidden />
          <span className="line-clamp-2">{locationLabel(business)}</span>
        </p>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-2 border-t border-gray-100 px-4 py-3">
        <span className="text-xs text-be-grey">Price from:</span>
        <span className="text-right">
          <strong className="text-base font-semibold text-be-navy">{business.price.from}</strong>{" "}
          <span className="text-xs text-be-grey">{business.price.unit}</span>
        </span>
      </div>
    </Link>
  );
}
