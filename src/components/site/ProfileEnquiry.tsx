"use client";

import { useState } from "react";
import { ArrowUpRight, CalendarDays, Check, Copy, Mail, MapPin, Users } from "lucide-react";
import { LOCATIONS } from "@/lib/directory";
import { composeEnquiry, type EnquiryVendor } from "@/lib/enquiry";
import { useShortlist } from "./ShortlistProvider";

const FIELD = "w-full rounded-xl bg-be-mist px-3 py-2.5 text-sm text-be-navy focus:outline-none focus:ring-2 focus:ring-be-cyan";

/**
 * Quick enquiry form on a profile. The visitor's details are remembered on the
 * device, and the message is written for this vendor from them. Delivery is
 * the visitor's own email app or clipboard until vendor accounts exist.
 */
export default function ProfileEnquiry({ vendor, email, website }: { vendor: EnquiryVendor; email: string | null; website: string | null }) {
  const { event, setEvent, brief, setBrief } = useShortlist();
  const [edited, setEdited] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const ev = { ask: event?.ask ?? null, event: event?.event ?? null, location: event?.location ?? null, date: event?.date ?? null, guests: event?.guests ?? null };
  const { subject, body } = composeEnquiry(ev, vendor, { name: brief.name, message: brief.message || event?.ask || "" });
  const text = edited ?? body;
  const patch = (p: Partial<typeof ev>) => setEvent({ ...ev, needs: event?.needs ?? [], ...p });
  const mailto = email ? `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}` : null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable: the text is selectable in the box */
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="rounded-[24px] bg-white p-5 text-be-navy shadow-2xl md:p-6">
      <h3 className="text-lg font-bold">Send an enquiry</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-be-grey">
          Your name
          <input value={brief.name} onChange={(e) => setBrief({ name: e.target.value })} placeholder="e.g. Alex Smith" autoComplete="name" className={`${FIELD} mt-1`} />
        </label>
        <label className="block text-xs font-semibold text-be-grey">
          Where
          <span className="mt-1 flex items-center gap-2 rounded-xl bg-be-mist px-3">
            <MapPin size={15} className="shrink-0 text-be-grey" aria-hidden />
            <select value={ev.location ?? ""} onChange={(e) => patch({ location: e.target.value || null })} className="w-full bg-transparent py-2.5 text-sm text-be-navy focus:outline-none">
              <option value="">Choose a county</option>
              {LOCATIONS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </span>
        </label>
        <label className="block text-xs font-semibold text-be-grey">
          Event date
          <span className="mt-1 flex items-center gap-2 rounded-xl bg-be-mist px-3">
            <CalendarDays size={15} className="shrink-0 text-be-grey" aria-hidden />
            <input type="date" value={ev.date ?? ""} onChange={(e) => patch({ date: e.target.value || null })} className="w-full bg-transparent py-2.5 text-sm text-be-navy focus:outline-none" />
          </span>
        </label>
        <label className="block text-xs font-semibold text-be-grey">
          Guests
          <span className="mt-1 flex items-center gap-2 rounded-xl bg-be-mist px-3">
            <Users size={15} className="shrink-0 text-be-grey" aria-hidden />
            <input
              type="number"
              min={1}
              max={5000}
              value={ev.guests ?? ""}
              onChange={(e) => patch({ guests: e.target.value ? Number(e.target.value) : null })}
              placeholder="How many?"
              className="w-full bg-transparent py-2.5 text-sm text-be-navy focus:outline-none"
            />
          </span>
        </label>
      </div>
      <label className="mt-3 block text-xs font-semibold text-be-grey">
        Your party in a few lines
        <textarea
          value={brief.message}
          onChange={(e) => {
            setBrief({ message: e.target.value });
            setEdited(null);
          }}
          rows={2}
          placeholder={event?.ask ?? "e.g. relaxed 40th in the garden, live music and cocktails"}
          className={`${FIELD} mt-1 resize-none`}
        />
      </label>
      <label className="mt-3 block text-xs font-semibold text-be-grey">
        <span className="flex items-center justify-between">
          Your message to {vendor.name}
          {edited !== null && (
            <button type="button" onClick={() => setEdited(null)} className="font-semibold text-be-navy underline decoration-be-cyan decoration-2 underline-offset-2">
              Back to the suggested message
            </button>
          )}
        </span>
        <textarea value={text} onChange={(e) => setEdited(e.target.value)} rows={9} className={`${FIELD} mt-1 leading-relaxed`} />
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        {mailto && (
          <a href={mailto} className="inline-flex items-center gap-2 rounded-full bg-be-amber px-5 py-3 text-sm font-semibold text-be-navy hover:brightness-95">
            <Mail size={16} aria-hidden /> Email {vendor.name}
          </a>
        )}
        <button
          type="button"
          onClick={copy}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${mailto ? "border border-be-navy text-be-navy hover:bg-be-mist" : "bg-be-amber text-be-navy hover:brightness-95"}`}
        >
          {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />} {copied ? "Copied" : "Copy message"}
        </button>
        {website && !mailto && (
          <a href={website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-be-navy px-5 py-3 text-sm font-semibold text-be-navy hover:bg-be-mist">
            Open their website <ArrowUpRight size={15} aria-hidden />
          </a>
        )}
      </div>
      <p className="mt-3 text-xs text-be-grey">
        {mailto ? "Opens your email app with the message filled in." : "Copy the message and paste it into their contact form or messages. Sending straight from Anyvendor arrives with vendor accounts."}
      </p>
    </form>
  );
}
