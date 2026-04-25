"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VendorCard from "@/components/VendorCard";
import type { Vendor } from "@/components/VendorCard";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  Star,
  MapPin,
  Calendar,
  Heart,
  Share2,
  Mail,
  Phone,
  Globe,
  ChevronLeft,
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
  Users,
  Award,
  Loader2,
  Wine,
  Baby,
  PartyPopper,
  Briefcase,
  Theater,
  Gem,
  Tent,
  Flower2,
  Home,
  Music,
  Rocket,
  Sparkles,
  Church,
} from "lucide-react";

const eventTypeIcons: Record<string, any> = {
  Weddings: Gem, "Baby Showers": Baby, Parties: PartyPopper,
  "Corporate Events": Briefcase, Festivals: Theater, Engagements: Gem,
  Exhibitions: Tent, "Garden Parties": Flower2, "House Parties": Home,
  "Club Events": Music, "Product Launches": Rocket, Galas: Sparkles,
  Ceremonies: Church, "Birthday Parties": PartyPopper,
  "Christmas Parties": PartyPopper, "Charity Events": Heart,
  Funerals: Church,
};

// Demo vendor data
const vendorData: Record<string, any> = {
  "the-bar-people": {
    name: "The Bar People", category: "Mobile Bar", location: "Essex, UK", established: 2014,
    price_from: 500, price_unit: "per head",
    image_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&h=500&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=300&fit=crop",
    ],
    rating: 4.9, review_count: 47, verified: true,
    description: "The Bar People is a premier mobile bar service specialising in creating unforgettable experiences for events of all kinds. With over a decade of expertise, we offer all-inclusive packages that include stylish mobile bars, expert bartenders, bespoke drinks menus, and all the equipment needed to bring your event to life.\n\nFrom weddings to corporate events, we're committed to delivering exceptional service with a personal touch, making every occasion one to remember.",
    eventTypes: ["Weddings", "Baby Showers", "Parties", "Corporate Events", "Festivals", "Engagements", "Exhibitions", "Garden Parties", "House Parties", "Club Events", "Product Launches", "Galas", "Ceremonies"],
    size_range: "50 to 2,000+ guests",
    licenses: ["Personal License", "Temporary Event Notice (TEN)"],
    bookingPolicy: "A deposit is required to confirm your booking, with the remaining balance due no later than 14 days before your event. We recommend booking as early as possible to secure your date.",
    cancellationPolicy: "Cancellations made at least 30 days prior to your event will receive a full refund. For cancellations within 30 days of the event, we are unable to offer a refund as resources will have been allocated.",
    listed_date: "Oct 13, 2024",
    website: "https://thebarpeople.co.uk", email: "hello@thebarpeople.co.uk", phone: "07700 900000",
  },
};

const similarVendors: Vendor[] = [
  { slug: "grape-and-fig", name: "Grape & Fig", category: "Caterer", location: "London", established: 2014, price_from: 100, price_unit: "per head", image_url: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&h=400&fit=crop", rating: 4.8, review_count: 32, verified: true },
  { slug: "magpie-catering", name: "Magpie Catering", category: "Caterer", location: "London", established: 1995, price_from: 100, price_unit: "per head", image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop", rating: 4.6, review_count: 28, verified: true },
  { slug: "ozzy-stix", name: "Ozzy & Stix", category: "Band", location: "UK Wide", established: 2010, price_from: 500, price_unit: "per event", image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop", rating: 4.8, review_count: 35, verified: true },
  { slug: "cj-sax", name: "CJ Sax", category: "Musician", location: "London", established: 2015, price_from: 500, price_unit: "per event", image_url: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=400&fit=crop", rating: 4.9, review_count: 22, verified: true },
];

export default function VendorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check hardcoded data first, then localStorage
    if (vendorData[slug]) {
      setVendor(vendorData[slug]);
    } else {
      const stored = JSON.parse(localStorage.getItem("anyvendor_vendors") || "[]");
      const found = stored.find((v: any) => v.slug === slug);
      if (found) {
        setVendor({
          ...found,
          image_url: found.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=500&fit=crop",
          gallery: [],
          size_range: null,
          licenses: [],
          listed_date: new Date(found.createdAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" }),
        });
      }
    }
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
        <Footer />
      </>
    );
  }

  if (!vendor) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Vendor not found</h1>
          <p className="text-gray-500 mt-2">This vendor profile doesn&apos;t exist or has been removed.</p>
          <Link href="/directory" className="text-[#e2b33e] font-semibold mt-4 inline-block hover:underline">Back to Directory</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Cover */}
      <div className="relative h-64 md:h-80 bg-gray-200 overflow-hidden">
        <img src={vendor.image_url} alt={vendor.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Link href="/directory" className="text-white/80 text-xs hover:text-white flex items-center gap-1 mb-3 transition-colors">
              <ChevronLeft size={14} /> Back to Directory
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-black text-gray-900">{vendor.name}</h1>
                    {vendor.verified && (
                      <span className="bg-[#2ec4b6]/10 text-[#2ec4b6] text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">{vendor.category}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {vendor.location}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> Est. {vendor.established}</span>
                  </div>
                  {vendor.review_count > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((i) => (
                          <Star key={i} size={14} className={i <= Math.round(vendor.rating) ? "text-[#e2b33e] fill-[#e2b33e]" : "text-gray-300"} />
                        ))}
                      </div>
                      <span className="text-gray-900 text-sm font-bold">{vendor.rating}</span>
                      <span className="text-gray-400 text-xs">({vendor.review_count} reviews)</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors"><Heart size={16} /></button>
                  <button className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors"><Share2 size={16} /></button>
                </div>
              </div>
            </div>

            {/* Gallery */}
            {vendor.gallery && vendor.gallery.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden">
                {vendor.gallery.map((img: string, i: number) => (
                  <div key={i} className="h-32 md:h-40 bg-gray-100 overflow-hidden">
                    <img src={img} alt={`${vendor.name} photo ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            )}

            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{vendor.description}</p>
            </div>

            {/* Event Types */}
            {vendor.eventTypes && vendor.eventTypes.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Event Types We Cover</h2>
                <div className="flex flex-wrap gap-2">
                  {vendor.eventTypes.map((type: string) => {
                    const Icon = eventTypeIcons[type] || PartyPopper;
                    return (
                      <span key={type} className="bg-gray-50 border border-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <Icon size={12} className="text-gray-400" /> {type}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Policies */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-900">Important Information</h2>
              {vendor.size_range && (
                <div className="flex items-start gap-3">
                  <Users size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div><p className="text-gray-900 text-sm font-semibold">Size of Events</p><p className="text-gray-500 text-xs mt-0.5">{vendor.size_range}</p></div>
                </div>
              )}
              {vendor.licenses && vendor.licenses.length > 0 && (
                <div className="flex items-start gap-3">
                  <Award size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div><p className="text-gray-900 text-sm font-semibold">Licenses & Insurance</p><p className="text-gray-500 text-xs mt-0.5">{vendor.licenses.join(" · ")}</p></div>
                </div>
              )}
              {vendor.bookingPolicy && (
                <div className="flex items-start gap-3">
                  <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div><p className="text-gray-900 text-sm font-semibold">Booking Policy</p><p className="text-gray-500 text-xs mt-1 leading-relaxed">{vendor.bookingPolicy}</p></div>
                </div>
              )}
              {vendor.cancellationPolicy && (
                <div className="flex items-start gap-3">
                  <XCircle size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div><p className="text-gray-900 text-sm font-semibold">Cancellation Policy</p><p className="text-gray-500 text-xs mt-1 leading-relaxed">{vendor.cancellationPolicy}</p></div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-4">
              <div className="text-center mb-5">
                <p className="text-gray-400 text-xs">Price from</p>
                <p className="text-3xl font-black text-gray-900 mt-1">£{vendor.price_from}</p>
                <p className="text-gray-500 text-xs">{vendor.price_unit}</p>
              </div>
              <div className="space-y-2">
                <button className="w-full bg-[#e2b33e] hover:bg-[#f0c75e] text-[#1a1a2e] font-bold text-sm py-3 rounded-full transition-colors">Get a Quote</button>
                <button className="w-full bg-[#1a1a2e] hover:bg-[#16213e] text-white font-bold text-sm py-3 rounded-full transition-colors flex items-center justify-center gap-2"><Mail size={14} /> Contact Vendor</button>
              </div>
              <div className="border-t border-gray-100 mt-5 pt-5 space-y-3">
                {vendor.phone && <a href={`tel:${vendor.phone}`} className="flex items-center gap-2 text-gray-600 text-sm hover:text-[#1a1a2e] transition-colors"><Phone size={14} /> {vendor.phone}</a>}
                {vendor.email && <a href={`mailto:${vendor.email}`} className="flex items-center gap-2 text-gray-600 text-sm hover:text-[#1a1a2e] transition-colors"><Mail size={14} /> {vendor.email}</a>}
                {vendor.website && <a href={vendor.website} target="_blank" rel="noopener" className="flex items-center gap-2 text-gray-600 text-sm hover:text-[#1a1a2e] transition-colors"><Globe size={14} /> Visit Website</a>}
              </div>
              <p className="text-gray-400 text-[10px] text-center mt-4 flex items-center justify-center gap-1"><Clock size={10} /> Listed {vendor.listed_date}</p>
            </div>
          </div>
        </div>

        {/* Similar */}
        <div className="mt-16">
          <h2 className="text-xl font-black text-gray-900 mb-6">Similar Vendors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {similarVendors.map((v) => (<VendorCard key={v.slug} vendor={v} />))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
