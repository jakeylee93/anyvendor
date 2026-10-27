import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Mail, Phone, MapPin, CalendarDays, Info } from "lucide-react";
import SiteShell from "@/components/site/SiteShell";
import BusinessCard, { Monogram, locationLabel } from "@/components/site/BusinessCard";
import Showreel from "@/components/site/Showreel";
import Gallery from "@/components/site/Gallery";
import { BUSINESSES, getBusiness, categoriesOf, industryOf, industryName, type Business } from "@/lib/directory";
import { getProfile, type Profile } from "@/lib/profiles";

export const dynamicParams = false;

export function generateStaticParams() {
  return BUSINESSES.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const b = getBusiness(slug);
  const p = getProfile(slug);
  if (!b) return { title: "Business not found — Anyvendor" };
  return {
    title: `${p?.displayName ?? b.name} — Anyvendor`,
    description: p?.intro ?? `${b.name} on the Anyvendor event directory.`,
  };
}

const SOCIAL_LABEL: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  vimeo: "Vimeo",
};

function LogoMark({ p, className = "" }: { p: Profile; className?: string }) {
  if (!p.logo) return null;
  const plate = p.logo.plate === "light" ? "bg-white p-3 shadow-lg" : p.logo.plate === "dark" ? "bg-be-deep p-3 shadow-lg" : "";
  return (
    <span className={`inline-flex items-center justify-center rounded-2xl ${plate} ${className}`}>
      <img src={p.logo.src} alt={`${p.displayName} logo`} width={p.logo.width} height={p.logo.height} className="h-full w-auto max-w-full object-contain" />
    </span>
  );
}

function Fact({ icon, label, value, source, note }: { icon?: React.ReactNode; label: string; value: string; source?: string; note?: string }) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-be-grey">
        {icon} {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold text-be-navy">{value}</dd>
      {note && <dd className="mt-0.5 text-xs text-be-grey">{note}</dd>}
      {source && (
        <dd className="mt-0.5 text-xs">
          <a href={source} target="_blank" rel="noopener noreferrer" className="text-be-grey underline decoration-gray-300 underline-offset-2 hover:text-be-navy">
            Source: {new URL(source).hostname.replace(/^www\./, "")}
          </a>
        </dd>
      )}
    </div>
  );
}

function HeroText({ b, p }: { b: Business; p: Profile }) {
  const industry = industryOf(b);
  const cats = categoriesOf(b);
  const enquireHref = p.contact?.email ? `mailto:${p.contact.email}?subject=${encodeURIComponent("Event enquiry via Anyvendor")}` : "#enquire";
  return (
    <div className="max-w-3xl">
      <LogoMark p={p} className="mb-5 h-20 md:h-24" />
      {industry && <p className="text-xs font-bold uppercase tracking-[0.22em] text-be-cyan">{cats.length ? cats.join(" · ") : industryName(industry)}</p>}
      <h1 className="mt-2 text-4xl font-bold leading-[1.05] tracking-tight md:text-7xl">{p.displayName}</h1>
      {p.tagline && <p className="mt-3 max-w-xl text-lg text-white/85 md:text-xl">{p.tagline}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={enquireHref} className="inline-flex items-center gap-2 rounded-full bg-be-amber px-6 py-3 font-semibold text-be-navy hover:brightness-95">
          {p.contact?.email ? <Mail size={18} aria-hidden /> : null} Enquire
        </a>
        {p.website && (
          <a
            href={p.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-6 py-3 font-semibold text-white ring-1 ring-white/35 backdrop-blur hover:bg-white/20"
          >
            Visit website <ArrowUpRight size={18} aria-hidden />
          </a>
        )}
      </div>
    </div>
  );
}

function FullProfile({ b, p }: { b: Business; p: Profile }) {
  const industry = industryOf(b);
  const related = BUSINESSES.filter((x) => x.slug !== b.slug && industry && industryOf(x) === industry).slice(0, 4);
  // Without a reel, the first real photo becomes a still hero instead of the photo band.
  const stillHero = !p.reel ? p.gallery[0] : undefined;
  const band = stillHero ? undefined : p.gallery[0];
  const rest = p.gallery.slice(1);
  const socials = Object.entries(p.socials).filter(([, v]) => v);

  return (
    <>
      {p.reel ? (
        <Showreel desktop={p.reel.outputs.desktop} mobile={p.reel.outputs.mobile} label={`${p.displayName} showreel`}>
          <HeroText b={b} p={p} />
        </Showreel>
      ) : stillHero ? (
        <section aria-label={`${p.displayName} photo`} className="relative isolate h-[calc(100svh-196px)] min-h-[540px] overflow-hidden bg-be-deep text-white lg:h-[calc(100svh-150px)] lg:min-h-[600px]">
          <img src={stillHero.src} alt={stillHero.alt} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,0,48,0.35)_0%,rgba(8,0,48,0)_30%,rgba(8,0,48,0.15)_55%,rgba(8,0,48,0.88)_100%)]" />
          <div className="relative flex h-full items-end">
            <div className="mx-auto w-full max-w-7xl px-4 pb-10 md:pb-16">
              <HeroText b={b} p={p} />
            </div>
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden bg-be-navy text-white">
          <div className="mx-auto max-w-7xl px-4 pb-14 pt-20 md:pt-28">
            <HeroText b={b} p={p} />
          </div>
        </section>
      )}

      <nav aria-label="Breadcrumb" className="border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <Link href="/directory" className="inline-flex items-center gap-1.5 text-sm font-medium text-be-navy hover:text-be-cyan">
            <ArrowLeft size={16} aria-hidden /> Back to Directory
          </Link>
        </div>
      </nav>

      {/* About */}
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:py-24 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-be-grey">About</h2>
          <p className="mt-4 text-2xl font-semibold leading-snug text-be-navy md:text-3xl">{p.intro}</p>
          <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-gray-700">
            {p.about.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </div>
        <dl className="grid content-start gap-6 text-sm">
          {p.established && <Fact icon={<CalendarDays size={16} aria-hidden />} label="Established" value={p.established.label} source={p.established.sourceUrl} />}
          {p.basedIn ? (
            <Fact icon={<MapPin size={16} aria-hidden />} label="Based in" value={p.basedIn.text} source={p.basedIn.sourceUrl} />
          ) : (
            b.region && <Fact icon={<MapPin size={16} aria-hidden />} label="Area" value={b.region} note="From the 2025 directory listing" />
          )}
          {p.areasServed.length > 0 && <Fact label="Areas covered" value={p.areasServed.join(", ")} />}
          {p.price ? (
            <Fact label="Pricing" value={p.price.text} source={p.price.sourceUrl} />
          ) : (
            <Fact label="Pricing" value="Quote on request" note={`Booked Events listing (2025): ${b.price.from} ${b.price.unit}`} />
          )}
        </dl>
      </section>

      {/* Services */}
      {p.services.length > 0 && (
        <section className="bg-be-mist">
          <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
            <h2 className="text-3xl font-bold text-be-navy md:text-5xl">Services</h2>
            <ul className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
              {p.services.map((s, n) => (
                <li key={s.name}>
                  <p className="font-caveat text-2xl text-be-cyan">{String(n + 1).padStart(2, "0")}</p>
                  <h3 className="mt-1 text-xl font-semibold text-be-navy">{s.name}</h3>
                  <p className="mt-2 leading-relaxed text-gray-700">{s.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Full-width photograph */}
      {band && (
        <figure className="relative h-[56svh] min-h-[340px] w-full overflow-hidden md:h-[72vh]">
          <img src={band.src} alt={band.alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
        </figure>
      )}

      {/* Events */}
      {p.eventTypes.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <h2 className="text-3xl font-bold text-be-navy md:text-4xl">Events</h2>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {p.eventTypes.map((e) => (
              <li key={e} className="rounded-full bg-be-mist px-4 py-2 text-sm font-medium text-be-navy">
                {e}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Gallery */}
      {rest.length > 0 && (
        <section className={`mx-auto max-w-7xl px-4 pb-16 md:pb-24 ${p.eventTypes.length ? "" : "pt-16 md:pt-20"}`}>
          <h2 className="mb-8 text-3xl font-bold text-be-navy md:text-4xl">Gallery</h2>
          <Gallery images={rest} name={p.displayName} />
        </section>
      )}

      {/* Enquire */}
      <section id="enquire" className="scroll-mt-4 bg-be-navy text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.3fr_1fr] md:items-center md:py-24">
          <div>
            <p className="font-caveat text-3xl text-be-cyan">Planning an event?</p>
            <h2 className="mt-1 text-3xl font-bold md:text-5xl">Talk to {p.displayName}</h2>
            {p.contact?.email || p.contact?.phone ? (
              <p className="mt-4 max-w-xl text-white/75">Send your date, venue, guest numbers and what you have in mind, and the team will come back to you.</p>
            ) : (
              <p className="mt-4 max-w-xl text-white/75">
                Enquiries through Anyvendor are not connected in this testing preview. You can reach {p.displayName} directly through their own website or social
                channels.
              </p>
            )}
          </div>
          <div className="grid gap-3">
            {p.contact?.email && (
              <a
                href={`mailto:${p.contact.email}?subject=${encodeURIComponent("Event enquiry via Anyvendor")}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-be-amber px-6 py-3.5 font-semibold text-be-navy hover:brightness-95"
              >
                <Mail size={18} aria-hidden /> {p.contact.email}
              </a>
            )}
            {p.contact?.phone && (
              <a
                href={`tel:${p.contact.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/12 px-6 py-3.5 font-semibold ring-1 ring-white/35 hover:bg-white/20"
              >
                <Phone size={18} aria-hidden /> {p.contact.phone}
              </a>
            )}
            {p.website && (
              <a
                href={p.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/12 px-6 py-3.5 font-semibold ring-1 ring-white/35 hover:bg-white/20"
              >
                Visit website <ArrowUpRight size={18} aria-hidden />
              </a>
            )}
            {socials.length > 0 && (
              <ul className="mt-1 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-white/80">
                {socials.map(([k, v]) => (
                  <li key={k}>
                    <a href={v} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline decoration-white/30 underline-offset-4 hover:text-white">
                      {SOCIAL_LABEL[k] ?? k} <ArrowUpRight size={13} aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Provenance */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <details className="rounded-xl border border-gray-200 p-4 text-sm text-be-grey">
          <summary className="cursor-pointer font-medium text-be-navy">Profile sources and media credits</summary>
          <div className="mt-3 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-be-navy">Information</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Listing details from the Booked Events directory (Wayback capture, 31 March 2025).</li>
                {p.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="break-all underline underline-offset-2">
                      {s.label}
                    </a>
                  </li>
                ))}
                {p.identity.note && <li>{p.identity.note}</li>}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-be-navy">Media</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {p.logo && (
                  <li>
                    Logo:{" "}
                    {p.logo.kind === "svg-original"
                      ? "the business’s own SVG"
                      : p.logo.kind === "svg-traced"
                        ? "vector redrawn from the business’s own logo file"
                        : "the business’s own logo file"}{" "}
                    (
                    <a href={p.logo.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                      source
                    </a>
                    )
                  </li>
                )}
                {p.reel && (
                  <li>
                    Showreel: {p.reel.segments.length} clips from the business’s own published media, audio removed:
                    <ul className="mt-1 list-[circle] space-y-0.5 pl-5">
                      {p.reel.segments.map((s, n) => (
                        <li key={n}>
                          <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                            {s.kind === "video" ? `video ${s.startSec?.toFixed(1)}–${s.endSec?.toFixed(1)}s` : "photo"}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
                {p.gallery.length > 0 && (
                  <li>
                    Photos from the business’s own channels:
                    <ul className="mt-1 list-[circle] space-y-0.5 pl-5">
                      {p.gallery.map((g) => (
                        <li key={g.src}>
                          <a href={g.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                            {g.alt}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs">
            <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
            Testing preview. Content is drawn from the business’s public channels and has not yet been reviewed by the business.
          </p>
        </details>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-6">
          <h2 className="text-2xl font-bold text-be-navy">More in {industryName(industry!)}</h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <li key={r.slug}>
                <BusinessCard business={r} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function ListingOnly({ b }: { b: Business }) {
  const cats = categoriesOf(b);
  return (
    <article className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1.1fr_1fr]">
      <Monogram business={b} className="aspect-4/3 w-full rounded-2xl" />
      <div>
        <h1 className="text-3xl font-bold text-be-navy md:text-5xl">{b.name}</h1>
        <p className="mt-4 text-be-grey">
          Est. {b.established} · {locationLabel(b)}
          {cats.length ? ` · ${cats.join(" · ")}` : ""}
        </p>
        <p className="mt-6">
          <strong className="text-3xl font-bold text-be-navy">{b.price.from}</strong> <span className="text-be-grey">{b.price.unit}</span>
        </p>
        <p className="mt-6 text-sm text-be-grey">A full profile for this business has not been verified yet.</p>
      </div>
    </article>
  );
}

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const b = getBusiness(slug);
  if (!b) notFound();
  const p = getProfile(slug);
  return <SiteShell>{p ? <FullProfile b={b} p={p} /> : <ListingOnly b={b} />}</SiteShell>;
}
