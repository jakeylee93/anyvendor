"use client";

import Link from "next/link";
import { MapPin, Star, Heart, Crown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export interface Vendor {
  slug: string;
  name: string;
  category: string;
  location: string;
  established: number;
  price_from: number;
  price_unit: string;
  image_url: string;
  rating: number;
  review_count: number;
  verified: boolean;
  tier?: "free" | "premium";
}

export default function VendorCard({ vendor }: { vendor: Vendor }) {
  const { user, toggleFavourite, isFavourite } = useAuth();
  const isFav = isFavourite(vendor.slug);

  return (
    <Link
      href={`/vendor/${vendor.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="relative h-32 sm:h-48 overflow-hidden bg-gray-100">
        <img src={vendor.image_url} alt={vendor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (user) {
              toggleFavourite(vendor.slug);
            } else {
              window.location.href = "/login";
            }
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${
            isFav
              ? "bg-red-500 text-white"
              : "bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500"
          }`}
        >
          <Heart size={14} fill={isFav ? "currentColor" : "none"} />
        </button>
        {vendor.tier === "premium" && (
          <span className="absolute top-3 left-3 av-gradient-bg text-[#2D3436] text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Star size={10} fill="currentColor" /> Premium
          </span>
        )}
        <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-semibold px-2.5 py-1 rounded-full">{vendor.category}</span>
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <h3 className="text-gray-900 font-bold text-xs sm:text-sm truncate group-hover:text-[#1a1a2e] transition-colors">{vendor.name}</h3>
            <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5">Est. {vendor.established}</p>
          </div>
          {vendor.review_count > 0 && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Star size={10} className="text-[#FFB5A7] fill-[#FFB5A7]" />
              <span className="text-gray-900 text-[10px] sm:text-xs font-bold">{vendor.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1 sm:mt-2">
          <MapPin size={10} className="text-gray-400" />
          <span className="text-gray-500 text-[10px] sm:text-xs truncate">{vendor.location}</span>
        </div>
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
          <div className="flex items-baseline gap-0.5">
            <span className="text-gray-400 text-[9px] sm:text-[10px]">From</span>
            <span className="text-[#2D3436] font-black text-sm sm:text-lg">£{vendor.price_from}</span>
            <span className="text-gray-400 text-[9px] sm:text-[10px]">{vendor.price_unit}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
