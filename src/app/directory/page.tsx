"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VendorCard from "@/components/VendorCard";
import { allVendors, categoryMapping, getActiveCategories } from "@/data/vendors";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Suspense } from "react";

function DirectoryContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "";

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [location, setLocation] = useState("All Locations");

  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  const activeCategories = getActiveCategories();

  // Get unique locations
  const locations = ["All Locations", ...Array.from(new Set(allVendors.map((v) => v.location))).sort()];

  // Filter vendors — also load from localStorage
  const storedVendors = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("anyvendor_vendors") || "[]")
    : [];

  const combined = [...allVendors, ...storedVendors.map((v: any) => ({
    slug: v.slug,
    name: v.name,
    category: v.category,
    location: v.location,
    established: v.established || new Date().getFullYear(),
    price_from: v.price_from || 0,
    price_unit: v.price_unit || "per event",
    image_url: v.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop",
    rating: v.rating || 0,
    review_count: v.review_count || 0,
    verified: v.verified || false,
  }))];

  const filtered = combined.filter((v) => {
    // Category filter
    if (activeCategory) {
      const categoryLabel = categoryMapping[activeCategory];
      if (categoryLabel && v.category !== categoryLabel) return false;
    }

    // Location filter
    if (location !== "All Locations" && v.location !== location) return false;

    // Search
    if (search) {
      const q = search.toLowerCase();
      if (
        !v.name.toLowerCase().includes(q) &&
        !v.category.toLowerCase().includes(q) &&
        !v.location.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const activeCategoryLabel = activeCategory ? categoryMapping[activeCategory] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-900">
          {activeCategoryLabel || "Event Directory"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {filtered.length} vendor{filtered.length !== 1 ? "s" : ""}
          {activeCategoryLabel ? ` in ${activeCategoryLabel}` : " available"}
        </p>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory("")}
          className={`text-xs px-4 py-2 rounded-full border transition-colors font-medium ${
            !activeCategory
              ? "bg-[#1a1a2e] text-white border-[#1a1a2e]"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          All
        </button>
        {activeCategories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key === activeCategory ? "" : cat.key)}
            className={`text-xs px-4 py-2 rounded-full border transition-colors font-medium ${
              activeCategory === cat.key
                ? "bg-[#1a1a2e] text-white border-[#1a1a2e]"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* Search + Location */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors..."
            className="w-full bg-white border border-gray-200 rounded-full pl-11 pr-4 py-2.5 text-sm focus:border-[#1a1a2e] focus:outline-none"
          />
        </div>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="bg-white border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:border-[#1a1a2e] focus:outline-none"
        >
          {locations.map((l) => (
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
  );
}

export default function DirectoryPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="p-8 text-gray-400 text-sm">Loading...</div>}>
        <DirectoryContent />
      </Suspense>
      <Footer />
    </>
  );
}
