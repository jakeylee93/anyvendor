import { Mail, MapPin, Phone } from "lucide-react";
import { ACCENTS, type SiteContent } from "@/lib/business/site-content";

/** The AnyVendor-hosted website template. Content is pre-validated by normaliseContent. */
export default function SiteRenderer({ name, content, ribbon }: { name: string; content: SiteContent; ribbon?: string }) {
  const accent = ACCENTS[content.accent];
  const dark = content.accent === "navy";
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {ribbon && <p className="bg-amber-400 px-4 py-2 text-center text-sm font-semibold text-be-navy">{ribbon}</p>}
      <header className="relative isolate overflow-hidden bg-be-navy text-white">
        {content.heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={content.heroImage} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-55" />
        ) : (
          <div className="absolute inset-0 -z-10" style={{ background: `radial-gradient(circle at 20% 20%, ${accent}66, transparent 55%), #212235` }} aria-hidden />
        )}
        <div className="mx-auto max-w-5xl px-5 pb-16 pt-10 md:pb-24 md:pt-14">
          <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: dark ? "#33ccff" : accent }}>{name}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">{content.headline || name}</h1>
          {content.intro && <p className="mt-4 max-w-2xl text-lg text-white/85">{content.intro}</p>}
          {content.contact.bookingUrl ? (
            <a href={content.contact.bookingUrl} className="mt-8 inline-flex rounded-full px-6 py-3 font-semibold text-be-navy" style={{ background: dark ? "#33ccff" : accent }}>Enquire now</a>
          ) : content.contact.email ? (
            <a href={`mailto:${content.contact.email}`} className="mt-8 inline-flex rounded-full px-6 py-3 font-semibold text-be-navy" style={{ background: dark ? "#33ccff" : accent }}>Get in touch</a>
          ) : null}
        </div>
      </header>
      {content.about && (
        <section className="mx-auto max-w-3xl px-5 py-14">
          <h2 className="text-2xl font-bold text-be-navy">About us</h2>
          <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-gray-700">{content.about}</p>
        </section>
      )}
      {content.services.length > 0 && (
        <section className="bg-be-mist py-14">
          <div className="mx-auto max-w-5xl px-5">
            <h2 className="text-2xl font-bold text-be-navy">What we do</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.services.map((s) => (
                <li key={s.title} className="rounded-3xl bg-white p-5 ring-1 ring-gray-200">
                  <span className="block h-1.5 w-10 rounded-full" style={{ background: accent }} aria-hidden />
                  <h3 className="mt-3 font-bold text-be-navy">{s.title}</h3>
                  {s.text && <p className="mt-1 text-sm text-gray-600">{s.text}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      {content.gallery.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 py-14">
          <h2 className="text-2xl font-bold text-be-navy">Gallery</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {content.gallery.map((g) => (
              <li key={g.src} className="aspect-4/3 overflow-hidden rounded-2xl bg-be-mist">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.src} alt={g.alt} loading="lazy" className="h-full w-full object-cover" />
              </li>
            ))}
          </ul>
        </section>
      )}
      <footer className="bg-be-navy text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-10 text-sm md:flex-row md:items-center md:justify-between">
          <p className="font-bold">{name}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-white/80">
            {content.contact.area && <li className="flex items-center gap-1.5"><MapPin size={15} aria-hidden /> {content.contact.area}</li>}
            {content.contact.phone && <li><a href={`tel:${content.contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5"><Phone size={15} aria-hidden /> {content.contact.phone}</a></li>}
            {content.contact.email && <li><a href={`mailto:${content.contact.email}`} className="flex items-center gap-1.5"><Mail size={15} aria-hidden /> {content.contact.email}</a></li>}
          </ul>
        </div>
        <p className="pb-6 text-center text-xs text-white/50">Website by AnyVendor</p>
      </footer>
    </div>
  );
}
