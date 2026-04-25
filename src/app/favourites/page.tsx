"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VendorCard from "@/components/VendorCard";
import { useAuth } from "@/context/AuthContext";
import { allVendors } from "@/data/vendors";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function FavouritesPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-black text-gray-900">Sign in to save favourites</h1>
          <p className="text-gray-500 text-sm mt-2">Create an account to save your favourite vendors and access them anytime.</p>
          <Link href="/login" className="inline-block mt-6 bg-[#1a1a2e] text-white font-bold text-sm px-8 py-3 rounded-full hover:bg-[#16213e] transition-colors">Sign In</Link>
        </div>
        <Footer />
      </>
    );
  }

  const favVendors = allVendors.filter((v) => user.favourites.includes(v.slug));

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">My Favourites</h1>
          <p className="text-gray-500 text-sm mt-1">{favVendors.length} saved vendor{favVendors.length !== 1 ? "s" : ""}</p>
        </div>

        {favVendors.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-gray-900 font-bold text-lg">No favourites yet</h3>
            <p className="text-gray-500 text-sm mt-1">Browse the directory and tap the heart icon to save vendors.</p>
            <Link href="/directory" className="inline-block mt-4 bg-[#e2b33e] text-[#1a1a2e] font-bold text-sm px-6 py-2.5 rounded-full hover:bg-[#f0c75e] transition-colors">Browse Directory</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {favVendors.map((vendor) => (
              <VendorCard key={vendor.slug} vendor={vendor} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
