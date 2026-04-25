"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VendorCard from "@/components/VendorCard";
import { allVendors, categoryMapping, getActiveCategories } from "@/data/vendors";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ArrowUpDown, Star, Filter } from "lucide-react";

type SortOption = "relevance" | "rating-high" | "price-low" | "price-high" | "newest" | "most-reviewed";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "rating-high", label: "Highest Rated" },
  { value: "most-reviewed", label: "Most Reviewed" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest Listed" },
];

function DirectoryContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "";

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [location, setLocation] = useState("All Locations");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  const activeCategories = getActiveCategories();
  const locations = ["All Locations", ...Array.from(new Set(allVendors.map((v) => v.location))).sort()];

  // Combine hardcoded + localStorage vendors
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

  // Filter
  let filtered = combined.filter((v) => {
    if (activeCategory) {
      const categoryLabel = categoryMapping[activeCategory];
      if (categoryLabel && v.category !== categoryLabel) return false;
    }
    if (location !== "All Locations" && v.location !== location) return false;
    if (verifiedOnly && !v.verified) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!v.name.toLowerCase().includes(q) && !v.category.toLowerCase().includes(q) && !v.location.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Sort
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "rating-high": return b.rating - a.rating;
      case "most-reviewed": return b.review_count - a.review_count;
      case "price-low": return a.price_from - b.price_from;
      case "price-high": return b.price_from - a.price_from;
      case "newest": return b.established - a.established;
      default: return 0;
    }
  });

  const activeCategoryLabel = activeCategory ? categoryMapping[activeCategory] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            {activeCategoryLabel || "Event Directory"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} vendor{filtered.length !== 1 ? "s" : ""}
            {activeCategoryLabel ? ` in ${activeCategoryLabel}` : " available"}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`md:hidden flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full border transition-colors ${
            showFilters ? "bg-[#1a1a2e] text-white border-[#1a1a2e]" : "bg-white text-gray-600 border-gray-200"
          }`}
        >
          <Filter size={14} /> Filters
        </button>
      </div>

      {/* Category pills — horizontal scroll on mobile */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveCategory("")}
          className={`text-[11px] px-3 py-1.5 rounded-full border transition-colors font-medium whitespace-nowrap flex-shrink-0 ${
            !activeCategory ? "bg-[#1a1a2e] text-white border-[#1a1a2e]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
          }`}
        >
          All
        </button>
        {activeCategories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key === activeCategory ? "" : cat.key)}
            className={`text-[11px] px-3 py-1.5 rounded-full border transition-colors font-medium whitespace-nowrap flex-shrink-0 ${
              activeCategory === cat.key ? "bg-[#1a1a2e] text-white border-[#1a1a2e]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className={`flex flex-wrap gap-3 mb-8 ${showFilters ? "" : "hidden md:flex"}`}>
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendors..."
            className="w-full bg-white border border-gray-200 rounded-full pl-11 pr-4 py-2.5 text-sm focus:border-[#1a1a2e] focus:outline-none"
          />
        </div>

        {/* Location */}
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="bg-white border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:border-[#1a1a2e] focus:outline-none"
        >
          {locations.map((l) => (<option key={l} value={l}>{l}</option>))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="bg-white border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:border-[#1a1a2e] focus:outline-none"
        >
          {sortOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
        </select>

        {/* Verified toggle */}
        <button
          onClick={() => setVerifiedOnly(!verifiedOnly)}
          className={`text-xs px-4 py-2.5 rounded-full border transition-colors font-medium flex items-center gap-1.5 ${
            verifiedOnly
              ? "bg-[#2ec4b6]/10 text-[#2ec4b6] border-[#2ec4b6]/30"
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
          }`}
        >
          <Star size={12} fill={verifiedOnly ? "currentColor" : "none"} />
          Verified Only
        </button>
      </div>

      {/* Active filters summary */}
      {(activeCategory || location !== "All Locations" || verifiedOnly || search) && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-gray-400 text-xs">Active filters:</span>
          {activeCategory && (
            <button onClick={() => setActiveCategory("")} className="text-[10px] bg-[#1a1a2e] text-white px-2.5 py-1 rounded-full flex items-center gap-1">
              {activeCategoryLabel} <span className="opacity-60">×</span>
            </button>
          )}
          {location !== "All Locations" && (
            <button onClick={() => setLocation("All Locations")} className="text-[10px] bg-[#1a1a2e] text-white px-2.5 py-1 rounded-full flex items-center gap-1">
              {location} <span className="opacity-60">×</span>
            </button>
          )}
          {verifiedOnly && (
            <button onClick={() => setVerifiedOnly(false)} className="text-[10px] bg-[#2ec4b6] text-white px-2.5 py-1 rounded-full flex items-center gap-1">
              Verified <span className="opacity-60">×</span>
            </button>
          )}
          {search && (
            <button onClick={() => setSearch("")} className="text-[10px] bg-[#1a1a2e] text-white px-2.5 py-1 rounded-full flex items-center gap-1">
              &ldquo;{search}&rdquo; <span className="opacity-60">×</span>
            </button>
          )}
          <button
            onClick={() => { setActiveCategory(""); setLocation("All Locations"); setVerifiedOnly(false); setSearch(""); setSortBy("relevance"); }}
            className="text-[10px] text-gray-400 hover:text-gray-600 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <SlidersHorizontal size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-gray-900 font-bold text-lg">No vendors found</h3>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters.</p>
          <button
            onClick={() => { setActiveCategory(""); setLocation("All Locations"); setVerifiedOnly(false); setSearch(""); }}
            className="mt-4 text-[#e2b33e] text-sm font-semibold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
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
