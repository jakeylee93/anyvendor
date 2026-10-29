"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const MAIN = [
  { href: "/directory", label: "Directory" },
  { href: "/people", label: "People" },
  { href: "/venues", label: "Venues" },
  { href: "/how-it-works", label: "How it works" },
];

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-baseline gap-0.5 font-bold tracking-tight ${className}`} aria-label="Anyvendor home">
      <span className="be-gradient-text text-[1.7rem] leading-none">any</span>
      <span className="text-be-navy text-[1.7rem] leading-none">vendor</span>
    </Link>
  );
}

export function ListButton({ className = "" }: { className?: string }) {
  return (
    <Link href="/list-my-business" className={`inline-flex items-center justify-center rounded-full bg-be-cyan px-5 py-2.5 text-sm font-semibold text-be-navy hover:brightness-95 ${className}`}>
      List my business
    </Link>
  );
}

export function PlanButton({ className = "" }: { className?: string }) {
  return (
    <Link href="/#plan" className={`inline-flex items-center justify-center rounded-full bg-be-amber px-5 py-2.5 text-sm font-semibold text-be-navy hover:brightness-95 ${className}`}>
      Plan my event
    </Link>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/90 backdrop-blur print:hidden">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-4">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {MAIN.map((l) => (
            <Link key={l.href} href={l.href} className="text-[15px] font-medium text-be-navy hover:text-be-cyan">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <ListButton />
          <PlanButton />
        </div>
        <button type="button" className="rounded-lg p-2 text-be-navy lg:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-gray-100 px-4 pb-5 lg:hidden" aria-label="Mobile">
          <ul className="divide-y divide-gray-100">
            {MAIN.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block py-3 font-medium text-be-navy" onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-3">
            <ListButton />
            <PlanButton />
          </div>
        </nav>
      )}
    </header>
  );
}
