"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search, User, Heart, LogOut, Shield } from "lucide-react";
import { categoryList } from "./CategoryIcon";
import { useAuth } from "@/context/AuthContext";
import SearchModal from "./SearchModal";

const navLinks = [
  { href: "/directory", label: "Directory" },
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      {/* Top bar — white & clean */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-2xl font-black tracking-tight text-gray-900">
                any<span className="text-[#d4a843]">vendor</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => setSearchOpen(true)} className="text-gray-400 hover:text-gray-900 text-sm transition-colors"><Search size={16} /></button>

              {user ? (
                <>
                  <Link href="/favourites" className="text-gray-400 hover:text-gray-900 text-sm transition-colors"><Heart size={16} /></Link>
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 text-gray-400 hover:text-gray-900 text-sm transition-colors"
                    >
                      <div className="w-7 h-7 bg-[#d4a843] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-gray-900 text-xs font-bold truncate">{user.name}</p>
                          <p className="text-gray-400 text-[10px] truncate">{user.email}</p>
                          {user.role === "admin" && (
                            <span className="text-[#d4a843] text-[10px] font-bold flex items-center gap-1 mt-0.5"><Shield size={8} /> Admin</span>
                          )}
                        </div>
                        <Link href="/favourites" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-gray-600 text-xs hover:bg-gray-50 transition-colors">My Favourites</Link>
                        {user.role === "vendor" && user.vendorSlug && (
                          <Link href={`/vendor/${user.vendorSlug}`} onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-gray-600 text-xs hover:bg-gray-50 transition-colors">My Profile</Link>
                        )}
                        {user.role === "admin" && (
                          <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-[#d4a843] text-xs font-semibold hover:bg-gray-50 transition-colors">Admin Panel</Link>
                        )}
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2 text-red-500 text-xs hover:bg-red-50 transition-colors flex items-center gap-1.5"
                        >
                          <LogOut size={12} /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link href="/login" className="text-gray-400 hover:text-gray-900 text-sm transition-colors"><User size={16} /></Link>
              )}

              <Link href="/list-your-business" className="bg-[#d4a843] hover:bg-[#e8c36a] text-white font-bold text-xs px-4 py-2 rounded-full transition-colors">
                LIST MY BUSINESS
              </Link>
              <Link href="/plan-my-event" className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded-full transition-colors">
                PLAN MY EVENT
              </Link>
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-gray-900 p-2">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Sliding category ticker — sticky */}
      <div className="bg-white border-b border-gray-100 overflow-hidden sticky top-0 z-40">
        <div className="relative">
          <div className="flex animate-ticker">
            {[...categoryList, ...categoryList].map((cat, i) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={`${cat.key}-${i}`}
                  href={cat.href}
                  className="flex items-center gap-2 px-5 py-3 text-gray-400 hover:text-gray-900 hover:bg-gray-50 text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0"
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
        <div className="md:hidden bg-white border-b border-gray-100">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block text-gray-600 hover:text-gray-900 text-sm font-medium py-2">{link.label}</Link>
            ))}
            {user ? (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <p className="text-gray-900 text-xs font-bold">{user.name}</p>
                <Link href="/favourites" onClick={() => setMobileOpen(false)} className="block text-gray-500 text-sm py-1">My Favourites</Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="text-red-500 text-sm py-1">Sign Out</button>
              </div>
            ) : (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block bg-gray-100 text-gray-900 font-bold text-sm px-4 py-2.5 rounded-full text-center">Sign In</Link>
              </div>
            )}
            <Link href="/list-your-business" onClick={() => setMobileOpen(false)} className="block bg-[#d4a843] text-white font-bold text-sm px-4 py-2.5 rounded-full text-center">LIST MY BUSINESS</Link>
          </div>
        </div>
      )}

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
