"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VendorCard from "@/components/VendorCard";
import type { Vendor } from "@/components/VendorCard";
import { categoryList } from "@/components/CategoryIcon";
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
} from "lucide-react";

// Demo vendors
const featuredVendors: Vendor[] = [
  { slug: "the-bar-people", name: "The Bar People", category: "Mobile Bar", location: "Essex, UK", established: 2014, price_from: 500, price_unit: "per head", image_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=400&fit=crop", rating: 4.9, review_count: 47, verified: true },
  { slug: "grape-and-fig", name: "Grape & Fig", category: "Caterer", location: "London", established: 2014, price_from: 100, price_unit: "per head", image_url: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&h=400&fit=crop", rating: 4.8, review_count: 32, verified: true },
  { slug: "tony-poole-discos", name: "Tony Poole Discos", category: "DJ Services", location: "London", established: 2019, price_from: 400, price_unit: "per event", image_url: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&h=400&fit=crop", rating: 4.7, review_count: 18, verified: true },
  { slug: "toot-sweet-candy-cart", name: "Toot Sweet Candy Cart", category: "Candy Carts", location: "Essex, UK", established: 2020, price_from: 300, price_unit: "per event", image_url: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&h=400&fit=crop", rating: 5.0, review_count: 12, verified: true },
  { slug: "magpie-catering", name: "Magpie Catering", category: "Caterer", location: "London", established: 1995, price_from: 100, price_unit: "per head", image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop", rating: 4.6, review_count: 28, verified: true },
  { slug: "cj-sax", name: "CJ Sax", category: "Musician", location: "London", established: 2015, price_from: 500, price_unit: "per event", image_url: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=400&fit=crop", rating: 4.9, review_count: 22, verified: true },
  { slug: "tm-event-hire", name: "TM Event Hire", category: "Equipment Hire", location: "London", established: 2018, price_from: 250, price_unit: "per event", image_url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop", rating: 4.5, review_count: 15, verified: false },
  { slug: "ozzy-stix", name: "Ozzy & Stix", category: "Band", location: "UK Wide", established: 2010, price_from: 500, price_unit: "per event", image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop", rating: 4.8, review_count: 35, verified: true },
];

const categoryCounts: Record<string, number> = {
  bars: 24, catering: 31, music: 18, photography: 12,
  venues: 8, entertainment: 15, decor: 9, transport: 6, cakes: 7, hire: 11,
};

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero with video background */}
      <section className="relative bg-[#1a1a2e] overflow-hidden min-h-[520px] flex items-center">
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="https://videos.pexels.com/video-files/3249935/3249935-uhd_2560_1440_25fps.mp4" type="video/mp4" />
        </video>
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

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {categoryList.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.key}
                href={cat.href}
                className="group bg-white border border-gray-100 hover:border-[#e2b33e]/30 rounded-2xl p-5 text-center transition-all hover:shadow-md"
              >
                <div className="w-12 h-12 bg-[#1a1a2e]/5 group-hover:bg-[#e2b33e]/10 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors">
                  <Icon size={22} className="text-[#1a1a2e] group-hover:text-[#e2b33e] transition-colors" strokeWidth={1.8} />
                </div>
                <p className="text-gray-900 font-bold text-sm">{cat.label}</p>
                <p className="text-gray-400 text-xs mt-1">{categoryCounts[cat.key] || 0} vendors</p>
              </Link>
            );
          })}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredVendors.map((vendor) => (
              <VendorCard key={vendor.slug} vendor={vendor} />
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black text-gray-900">How it Works</h2>
          <p className="text-gray-500 text-sm mt-2">Three simple steps to your perfect event</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Search, step: "01", title: "Search & Discover", desc: "Browse our directory of verified event suppliers. Filter by category, location, price, and event type to find exactly what you need." },
            { icon: MessageSquare, step: "02", title: "Connect & Compare", desc: "View profiles, read reviews, and compare quotes. Contact vendors directly — no middlemen, no commission fees." },
            { icon: PartyPopper, step: "03", title: "Book & Celebrate", desc: "Confirm your booking directly with the vendor. Plan with confidence knowing you've found verified, trusted suppliers." },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 bg-[#1a1a2e] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <item.icon size={24} className="text-[#e2b33e]" />
              </div>
              <span className="text-[#e2b33e] text-xs font-bold">STEP {item.step}</span>
              <h3 className="text-gray-900 font-bold text-lg mt-2">{item.title}</h3>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA for businesses */}
      <section className="bg-[#1a1a2e] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-black text-white">Are You an Event Supplier?</h2>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              Showcase your services and connect with people ready to book.
              No commission on bookings — just a platform that puts your business in front of the right audience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <Link href="/list-your-business" className="bg-[#e2b33e] hover:bg-[#f0c75e] text-[#1a1a2e] font-bold text-sm px-8 py-3.5 rounded-full transition-colors">
                List My Business — It&apos;s Free
              </Link>
              <Link href="/how-it-works" className="text-gray-300 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5">
                Learn More <ArrowRight size={14} />
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-gray-500 text-xs">
              <span className="flex items-center gap-1.5"><Shield size={14} className="text-[#2ec4b6]" /> Verified vendors</span>
              <span className="flex items-center gap-1.5"><Star size={14} className="text-[#e2b33e]" /> Genuine reviews</span>
              <span className="flex items-center gap-1.5"><Zap size={14} className="text-[#e2b33e]" /> Zero commission</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={16} className="text-[#e2b33e] fill-[#e2b33e]" />
            ))}
          </div>
          <p className="text-gray-700 text-lg leading-relaxed italic">
            &ldquo;AnyVendor made planning our wedding so much easier. We found our bar, DJ, and caterer all in one place. The direct contact with vendors meant no hidden fees — just honest pricing and amazing service.&rdquo;
          </p>
          <div className="mt-6">
            <p className="text-gray-900 font-bold text-sm">Sarah & Tom</p>
            <p className="text-gray-400 text-xs">Wedding in Essex, 2025</p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
