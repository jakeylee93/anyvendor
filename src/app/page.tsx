"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VendorCard from "@/components/VendorCard";
import { categoryList } from "@/components/CategoryIcon";
import { allVendors, getActiveCategories } from "@/data/vendors";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  Users,
  Shield,
  Zap,
  Star,
  MessageSquare,
  PartyPopper,
  MapPin,
} from "lucide-react";

import type { Vendor } from "@/components/VendorCard";
import { Heart as HeartIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const activeCategories = getActiveCategories();

/* Pokémon-card style featured vendor */
function FeaturedCard({ vendor }: { vendor: Vendor }) {
  const { user, toggleFavourite, isFavourite } = useAuth();
  const isFav = isFavourite(vendor.slug);

  return (
    <Link
      href={`/vendor/${vendor.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-36 sm:h-44 overflow-hidden">
        <img
          src={vendor.image_url}
          alt={vendor.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {/* Fav button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (user) toggleFavourite(vendor.slug);
            else window.location.href = "/login";
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors ${
            isFav ? "bg-red-500 text-white" : "bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500"
          }`}
        >
          <HeartIcon size={16} fill={isFav ? "currentColor" : "none"} />
        </button>
        {/* Premium badge */}
        {vendor.tier === "premium" && (
          <div className="absolute top-3 left-3 bg-[#e2b33e] text-[#1a1a2e] text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Star size={10} fill="currentColor" /> Premium
          </div>
        )}
        {/* Name overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-black text-sm leading-tight drop-shadow-lg">{vendor.name}</h3>
          <span className="bg-white/20 backdrop-blur-sm text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-1 inline-block">{vendor.category}</span>
        </div>
      </div>

      {/* Info section — compact */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <MapPin size={10} className="text-gray-400" />
            <span className="text-gray-500 text-[10px] truncate">{vendor.location}</span>
          </div>
          {vendor.review_count > 0 && (
            <div className="flex items-center gap-0.5">
              <Star size={10} className="text-[#e2b33e] fill-[#e2b33e]" />
              <span className="text-gray-900 text-[11px] font-bold">{vendor.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-0.5 mt-2">
          <span className="text-[#1a1a2e] font-black text-base">£{vendor.price_from}</span>
          <span className="text-gray-400 text-[9px]">{vendor.price_unit}</span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero with video background */}
      <section className="relative bg-[#1a1a2e] overflow-hidden min-h-[520px] flex items-center">
        {/* Vimeo video background */}
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            src="https://player.vimeo.com/video/1039846245?background=1&autoplay=1&loop=1&muted=1&title=0&byline=0&portrait=0"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] min-w-full h-[56.25vw] min-h-full opacity-30"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/70 via-[#1a1a2e]/50 to-[#1a1a2e]/90" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 w-full">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
              Find the perfect{" "}
              <span className="text-[#e2b33e]">event suppliers</span>{" "}
              for any occasion
            </h1>
            <p className="text-gray-300 text-lg mt-4 max-w-xl mx-auto">
              Browse hundreds of verified vendors — from bars to DJs, caterers to photographers. No commission, no hassle.
            </p>

            {/* Search bar */}
            <div className="mt-8 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="What are you looking for? e.g. Mobile Bar, DJ, Caterer..."
                  className="w-full bg-white rounded-full pl-12 pr-4 py-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e2b33e] shadow-lg"
                />
              </div>
              <button className="bg-[#e2b33e] hover:bg-[#f0c75e] text-[#1a1a2e] font-bold text-sm px-8 py-4 rounded-full transition-colors shadow-lg whitespace-nowrap">
                Search
              </button>
            </div>

            {/* Quick stats */}
            <div className="mt-10 flex items-center justify-center gap-8 text-white/60 text-sm">
              <span><strong className="text-white">200+</strong> Vendors</span>
              <span className="w-1 h-1 bg-white/30 rounded-full" />
              <span><strong className="text-white">50+</strong> Categories</span>
              <span className="w-1 h-1 bg-white/30 rounded-full" />
              <span><strong className="text-white">1,000+</strong> Events Booked</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Browse by Category</h2>
            <p className="text-gray-500 text-sm mt-1">Find suppliers across every event category</p>
          </div>
          <Link href="/directory" className="hidden md:flex items-center gap-1.5 text-[#1a1a2e] text-sm font-semibold hover:text-[#e2b33e] transition-colors">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-hidden">
          <div className="flex animate-ticker-slow">
            {[...categoryList.filter((cat) => activeCategories.some((ac) => ac.key === cat.key)),
              ...categoryList.filter((cat) => activeCategories.some((ac) => ac.key === cat.key))].map((cat, i) => {
              const Icon = cat.icon;
              const count = activeCategories.find((ac) => ac.key === cat.key)?.count || 0;
              return (
                <Link
                  key={`${cat.key}-${i}`}
                  href={cat.href}
                  className="group bg-white border border-gray-100 hover:border-[#e2b33e]/30 rounded-2xl p-5 text-center transition-all hover:shadow-md flex-shrink-0 w-[160px] mx-1.5"
                >
                  <div className="w-12 h-12 bg-[#1a1a2e]/5 group-hover:bg-[#e2b33e]/10 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors">
                    <Icon size={22} className="text-[#1a1a2e] group-hover:text-[#e2b33e] transition-colors" strokeWidth={1.8} />
                  </div>
                  <p className="text-gray-900 font-bold text-sm">{cat.label}</p>
                  <p className="text-gray-400 text-xs mt-1">{count} vendor{count !== 1 ? "s" : ""}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Vendors */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Featured Vendors</h2>
              <p className="text-gray-500 text-sm mt-1">Handpicked suppliers ready to make your event unforgettable</p>
            </div>
            <Link href="/directory" className="hidden md:flex items-center gap-1.5 text-[#1a1a2e] text-sm font-semibold hover:text-[#e2b33e] transition-colors">
              View All Vendors <ArrowRight size={14} />
            </Link>
          </div>

          {/* Horizontal swipeable vendor showcase — Pokémon card style */}
          <div className="overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex gap-4 animate-vendor-h-scroll w-max">
              {[...allVendors].sort(() => Math.random() - 0.5).concat([...allVendors].sort(() => Math.random() - 0.5)).map((vendor, i) => (
                <div key={`${vendor.slug}-${i}`} className="flex-shrink-0 w-[44vw] sm:w-[240px] lg:w-[230px] snap-center">
                  <FeaturedCard vendor={vendor} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works — compact & playful */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-xl font-black text-gray-900 text-center mb-6">How it Works</h2>
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
          {[
            { icon: Search, num: "1", title: "Search", desc: "Browse vendors by category, location & price", color: "#e2b33e" },
            { icon: MessageSquare, num: "2", title: "Connect", desc: "Contact directly — no middlemen or fees", color: "#2ec4b6" },
            { icon: PartyPopper, num: "3", title: "Book!", desc: "Confirm & celebrate your perfect event", color: "#e2b33e" },
          ].map((item) => (
            <div key={item.num} className="flex-shrink-0 flex-1 min-w-[140px] bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: `${item.color}15` }}>
                <item.icon size={18} style={{ color: item.color }} />
              </div>
              <span className="text-[10px] font-black text-gray-300">{item.num}</span>
              <h3 className="text-gray-900 font-bold text-sm">{item.title}</h3>
              <p className="text-gray-400 text-[10px] mt-1 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA for businesses — compact & punchy */}
      <section className="bg-[#1a1a2e] py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-black text-white">Are You an Event Supplier? ✨</h2>
          <p className="text-gray-400 text-sm mt-2">List your business for free. No commission, ever.</p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <Link href="/list-your-business" className="bg-[#e2b33e] hover:bg-[#f0c75e] text-[#1a1a2e] font-bold text-sm px-6 py-3 rounded-full transition-colors">
              List My Business
            </Link>
            <Link href="/services" className="text-gray-300 hover:text-white text-sm font-medium transition-colors flex items-center gap-1">
              Our Services <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex items-center justify-center gap-4 mt-5 text-gray-500 text-[10px]">
            <span className="flex items-center gap-1"><Shield size={11} className="text-[#2ec4b6]" /> Verified</span>
            <span className="flex items-center gap-1"><Star size={11} className="text-[#e2b33e]" /> Reviews</span>
            <span className="flex items-center gap-1"><Zap size={11} className="text-[#e2b33e]" /> Zero fees</span>
          </div>
        </div>
      </section>

      {/* Testimonial — compact */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-8 text-center">
          <div className="flex items-center justify-center gap-0.5 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={14} className="text-[#e2b33e] fill-[#e2b33e]" />
            ))}
          </div>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed italic">
            &ldquo;We found our bar, DJ, and caterer all in one place. No hidden fees — just honest pricing and amazing service.&rdquo;
          </p>
          <p className="text-gray-900 font-bold text-xs mt-3">Sarah & Tom <span className="text-gray-400 font-normal">— Wedding in Essex</span></p>
        </div>
      </section>

      <Footer />
    </>
  );
}
