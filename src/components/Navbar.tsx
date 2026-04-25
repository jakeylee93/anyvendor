"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search, User, Heart } from "lucide-react";
import { categoryList } from "./CategoryIcon";

const navLinks = [
  { href: "/directory", label: "Directory" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Top bar */}
      <div className="bg-[#1a1a2e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1">
              <span className="text-2xl font-black tracking-tight">
                any<span className="text-[#e2b33e]">vendor</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/directory" className="flex items-center gap-1.5 text-gray-300 hover:text-white text-sm transition-colors">
                <Search size={16} />
              </Link>
              <Link href="/favourites" className="flex items-center gap-1.5 text-gray-300 hover:text-white text-sm transition-colors">
                <Heart size={16} />
              </Link>
              <Link href="/login" className="flex items-center gap-1.5 text-gray-300 hover:text-white text-sm transition-colors">
                <User size={16} />
              </Link>
              <Link href="/list-your-business" className="bg-[#e2b33e] hover:bg-[#f0c75e] text-[#1a1a2e] font-bold text-xs px-4 py-2 rounded-full transition-colors">
                LIST MY BUSINESS
              </Link>
              <Link href="/plan-my-event" className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2 rounded-full border border-white/20 transition-colors">
                PLAN MY EVENT
              </Link>
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white p-2">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Sliding category ticker */}
      <div className="bg-white border-b border-gray-200 overflow-hidden">
        <div className="relative">
          <div className="flex animate-scroll">
            {/* Double the items for seamless loop */}
            {[...categoryList, ...categoryList].map((cat, i) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={`${cat.key}-${i}`}
                  href={cat.href}
                  className="flex items-center gap-2 px-5 py-3 text-gray-600 hover:text-[#1a1a2e] hover:bg-gray-50 text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0"
                >
                  <Icon size={14} strokeWidth={2} />
                  {cat.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#1a1a2e] border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block text-gray-300 hover:text-white text-sm font-medium py-2">
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <Link href="/list-your-business" onClick={() => setMobileOpen(false)} className="block bg-[#e2b33e] text-[#1a1a2e] font-bold text-sm px-4 py-2.5 rounded-full text-center">
                LIST MY BUSINESS
              </Link>
              <Link href="/plan-my-event" onClick={() => setMobileOpen(false)} className="block bg-white/10 text-white font-bold text-sm px-4 py-2.5 rounded-full text-center border border-white/20">
                PLAN MY EVENT
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
}
