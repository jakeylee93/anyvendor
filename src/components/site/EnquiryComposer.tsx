"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { composeEnquiry, type EnquiryVendor } from "@/lib/enquiry";
import { useShortlist } from "./ShortlistProvider";

export interface ComposerVendor extends EnquiryVendor {
  slug: string;
  email: string | null;
  website: string | null;
}

const FIELD = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-be-navy focus:outline-none focus:ring-2 focus:ring-be-cyan";

/** One brief from the visitor; a message written for each vendor on the plan. */
export default function EnquiryComposer({ vendors }: { vendors: ComposerVendor[] }) {
  const { event, brief, setBrief } = useShortlist();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const ev = { ask: event?.ask ?? null, event: event?.event ?? null, location: event?.location ?? null, date: event?.date ?? null, guests: event?.guests ?? null };
  const message = brief.message || event?.ask || "";

  async function copy(slug: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(slug);
      window.setTimeout(() => setCopied((c) => (c === slug ? null : c)), 2000);
    } catch {
      /* clipboard unavailable: the text is selectable in the box */
    }
  }

  return (
    <section className="mt-12 print:hidden" aria-labelledby="contact-heading">
      <h2 id="contact-heading" className="text-2xl font-bold text-be-navy md:text-3xl">
        Contact your shortlist
      </h2>
      <p className="mt-2 max-w-2xl text-be-grey">
        Describe your party once. Each vendor gets a message written for them, mentioning what they do and where they are. Change anything you like, then email it or copy it into their contact form.
      </p>
      <div className="mt-5 grid gap-3 rounded-2xl bg-be-mist p-4 sm:grid-cols-[1fr_2fr]">
        <label className="block text-xs font-semibold text-be-grey">
          Your name
          <input value={brief.name} onChange={(e) => setBrief({ name: e.target.value })} placeholder="e.g. Alex Smith" autoComplete="name" className={`${FIELD} mt-1`} />
        </label>
        <label className="block text-xs font-semibold text-be-grey">
          Your party in a few lines
          <textarea
            value={brief.message}
            onChange={(e) => {
              setBrief({ message: e.target.value });
              setEdits({});
            }}
            rows={3}
            placeholder={event?.ask ?? "e.g. relaxed 40th in the garden, live music and cocktails, about 80 of us"}
            className={`${FIELD} mt-1 resize-none`}
          />
        </label>
      </div>
      <ul className="mt-6 space-y-5">
        {vendors.map((v) => {
          const { subject, body } = composeEnquiry(ev, v, { name: brief.name, message });
          const text = edits[v.slug] ?? body;
          const mailto = v.email ? `mailto:${v.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}` : null;
          return (
            <li key={v.slug} className="rounded-2xl border border-gray-200 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-bold text-be-navy">To: {v.name}</p>
                <p className="text-xs text-be-grey">Subject: {subject}</p>
              </div>
              <textarea
                value={text}
                onChange={(e) => setEdits({ ...edits, [v.slug]: e.target.value })}
                rows={8}
                aria-label={`Message to ${v.name}`}
                className={`${FIELD} mt-3 leading-relaxed`}
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {mailto && (
                  <a href={mailto} className="inline-flex items-center gap-2 rounded-full bg-be-amber px-4 py-2 text-sm font-semibold text-be-navy hover:brightness-95">
                    <Mail size={15} aria-hidden /> Email {v.name}
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => copy(v.slug, text)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${mailto ? "border border-be-navy text-be-navy hover:bg-be-mist" : "bg-be-amber text-be-navy hover:brightness-95"}`}
                >
                  {copied === v.slug ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />} {copied === v.slug ? "Copied" : "Copy message"}
                </button>
                {v.website && !mailto && (
                  <a href={v.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-be-navy px-4 py-2 text-sm font-semibold text-be-navy hover:bg-be-mist">
                    Open their website <ArrowUpRight size={14} aria-hidden />
                  </a>
                )}
                {edits[v.slug] !== undefined && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...edits };
                      delete next[v.slug];
                      setEdits(next);
                    }}
                    className="text-sm font-semibold text-be-grey underline underline-offset-2 hover:text-be-navy"
                  >
                    Back to the suggested message
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm text-be-grey">Sending to everyone at once from Anyvendor, with the replies in one inbox, arrives with vendor accounts. Until then each message goes from you.</p>
    </section>
  );
}
