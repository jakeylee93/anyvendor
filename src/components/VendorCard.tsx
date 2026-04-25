import Link from "next/link";
import { MapPin, Star, Heart } from "lucide-react";

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
}

export default function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <Link
      href={`/vendor/${vendor.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={vendor.image_url}
          alt={vendor.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Favourite button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm"
        >
          <Heart size={14} />
        </button>
        {/* Verified badge */}
        {vendor.verified && (
          <span className="absolute top-3 left-3 bg-[#2ec4b6] text-white text-[10px] font-bold px-2 py-1 rounded-full">
            ✓ Verified
          </span>
        )}
        {/* Category tag */}
        <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-semibold px-2.5 py-1 rounded-full">
          {vendor.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-gray-900 font-bold text-sm truncate group-hover:text-[#1a1a2e] transition-colors">
              {vendor.name}
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">Est. {vendor.established}</p>
          </div>
          {/* Rating */}
          {vendor.review_count > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star size={12} className="text-[#e2b33e] fill-[#e2b33e]" />
              <span className="text-gray-900 text-xs font-bold">{vendor.rating.toFixed(1)}</span>
              <span className="text-gray-400 text-[10px]">({vendor.review_count})</span>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 mt-2">
          <MapPin size={12} className="text-gray-400" />
          <span className="text-gray-500 text-xs">{vendor.location}</span>
        </div>

        {/* Price */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-baseline gap-1">
            <span className="text-gray-400 text-[10px]">From</span>
            <span className="text-[#1a1a2e] font-black text-lg">£{vendor.price_from}</span>
            <span className="text-gray-400 text-[10px]">{vendor.price_unit}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
