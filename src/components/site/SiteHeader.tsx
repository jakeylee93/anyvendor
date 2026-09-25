"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, User, Heart, ShoppingBasket } from "lucide-react";

const UTILITY = [
  { href: "/trending", label: "Trending" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/contact", label: "Contact" },
];

const MAIN = [
  { href: "/directory", label: "Directory" },
  { href: "/shop", label: "Shop" },
  { href: "/hire", label: "Hire" },
  { href: "/trade", label: "Trade" },
  { href: "/agency", label: "Agency" },
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
    <Link
      href="/list-my-business"
      className={`inline-flex items-center justify-center rounded-full bg-be-cyan px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-be-navy hover:brightness-95 ${className}`}
    >
      List my business
    </Link>
  );
}

export function PlanButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/plan-my-event"
      className={`inline-flex items-center justify-center rounded-full bg-be-amber px-5 py-2.5 text-sm font-semibold text-be-navy hover:brightness-95 ${className}`}
    >
      Plan My Event
    </Link>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header>
      {/* Slim navy utility bar */}
      <div className="bg-be-navy text-white text-xs">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4">
          <nav className="flex gap-5" aria-label="Utility">
            {UTILITY.map((l) => (
              <Link key={l.href} href={l.href} className="opacity-85 hover:opacity-100">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/my-account" className="flex items-center gap-1.5 opacity-85 hover:opacity-100">
              <User size={14} aria-hidden /> <span className="hidden sm:inline">My Account</span>
            </Link>
            <Link href="/wishlist" className="flex items-center gap-1.5 opacity-85 hover:opacity-100">
              <Heart size={14} aria-hidden /> <span className="hidden sm:inline">Wishlist</span>
            </Link>
            <Link href="/basket" className="flex items-center gap-1.5 opacity-85 hover:opacity-100" aria-label="My Basket, 0 items">
              <ShoppingBasket size={14} aria-hidden /> <span className="rounded-full bg-be-cyan px-1.5 text-[10px] font-bold text-be-navy">0</span>
            </Link>
          </div>
        </div>
      </div>

      {/* White main navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-4 py-3">
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
          <button
            type="button"
            className="rounded-lg p-2 text-be-navy lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
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
      </div>

      {/* Pale cyan onboarding strip */}
      <div className="bg-be-cyan-pale">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-2.5 text-center text-sm text-be-navy">
          <p>
            <strong className="font-semibold">Onboarding Today</strong> – List your business for Free Today!
          </p>
          <Link href="/list-my-business" className="text-xs font-bold uppercase tracking-wider text-be-navy underline decoration-be-cyan decoration-2 underline-offset-4">
            List my business
          </Link>
        </div>
      </div>
    </header>
  );
}
