"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VendorCard from "@/components/VendorCard";
import type { Vendor } from "@/components/VendorCard";
import { useState } from "react";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";

// Demo data — same vendors as homepage plus more
const allVendors: Vendor[] = [
  { slug: "the-bar-people", name: "The Bar People", category: "Mobile Bar", location: "Essex, UK", established: 2014, price_from: 500, price_unit: "per head", image_url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=400&fit=crop", rating: 4.9, review_count: 47, verified: true },
  { slug: "grape-and-fig", name: "Grape & Fig", category: "Caterer", location: "London", established: 2014, price_from: 100, price_unit: "per head", image_url: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&h=400&fit=crop", rating: 4.8, review_count: 32, verified: true },
  { slug: "tony-poole-discos", name: "Tony Poole Discos", category: "DJ Services", location: "London", established: 2019, price_from: 400, price_unit: "per event", image_url: "https://images.unsplash.com/photo-1571266028243-3716f02d3e2d?w=600&h=400&fit=crop", rating: 4.7, review_count: 18, verified: true },
  { slug: "toot-sweet-candy-cart", name: "Toot Sweet Candy Cart", category: "Candy Carts", location: "Essex, UK", established: 2020, price_from: 300, price_unit: "per event", image_url: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&h=400&fit=crop", rating: 5.0, review_count: 12, verified: true },
  { slug: "magpie-catering", name: "Magpie Catering", category: "Caterer", location: "London", established: 1995, price_from: 100, price_unit: "per head", image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop", rating: 4.6, review_count: 28, verified: true },
  { slug: "cj-sax", name: "CJ Sax", category: "Musician", location: "London", established: 2015, price_from: 500, price_unit: "per event", image_url: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=400&fit=crop", rating: 4.9, review_count: 22, verified: true },
  { slug: "tm-event-hire", name: "TM Event Hire", category: "Equipment Hire", location: "London", established: 2018, price_from: 250, price_unit: "per event", image_url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop", rating: 4.5, review_count: 15, verified: false },
  { slug: "ozzy-stix", name: "Ozzy & Stix", category: "Band", location: "UK Wide", established: 2010, price_from: 500, price_unit: "per event", image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop", rating: 4.8, review_count: 35, verified: true },
  { slug: "lucy-jane-cakes", name: "Lucy Jane Cakes", category: "Cakes", location: "Essex, UK", established: 2016, price_from: 350, price_unit: "per event", image_url: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=600&h=400&fit=crop", rating: 4.9, review_count: 41, verified: true },
  { slug: "ray-elton-johnson", name: "Ray Elton Johnson", category: "Singer", location: "London", established: 2009, price_from: 750, price_unit: "per event", image_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop", rating: 4.7, review_count: 19, verified: true },
  { slug: "paint-and-pour", name: "Paint and Pour", category: "Entertainment", location: "London", established: 2021, price_from: 400, price_unit: "per event", image_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop", rating: 4.6, review_count: 8, verified: false },
  { slug: "tl-executive-cars", name: "TL Executive Cars", category: "Transport", location: "London", established: 2015, price_from: 200, price_unit: "per event", image_url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=600&h=400&fit=crop", rating: 4.8, review_count: 14, verified: true },
];

const categoryFilters = ["All", "Mobile Bar", "Caterer", "DJ Services", "Musician", "Band", "Singer", "Cakes", "Candy Carts", "Equipment Hire", "Entertainment", "Transport"];
const locationFilters = ["All Locations", "London", "Essex, UK", "UK Wide"];

export default function DirectoryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All Locations");

  const filtered = allVendors.filter((v) => {
    if (category !== "All" && v.category !== category) return false;
    if (location !== "All Locations" && v.location !== location) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !v.name.toLowerCase().includes(q) &&
        !v.category.toLowerCase().includes(q) &&
        !v.location.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Event Directory</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} vendor{filtered.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendors..."
              className="w-full bg-white border border-gray-200 rounded-full pl-11 pr-4 py-2.5 text-sm focus:border-[#1a1a2e] focus:outline-none"
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:border-[#1a1a2e] focus:outline-none appearance-none cursor-pointer"
          >
            {categoryFilters.map((c) => (
              <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
            ))}
          </select>

          {/* Location */}
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-white border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:border-[#1a1a2e] focus:outline-none appearance-none cursor-pointer"
          >
            {locationFilters.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <SlidersHorizontal size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-gray-900 font-bold text-lg">No vendors found</h3>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((vendor) => (
              <VendorCard key={vendor.slug} vendor={vendor} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
