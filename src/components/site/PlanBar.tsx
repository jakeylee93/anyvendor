"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { useShortlist } from "./ShortlistProvider";

/** Floating "My plan" bar once anything is shortlisted. */
export default function PlanBar() {
  const { items } = useShortlist();
  const pathname = usePathname() ?? "";
  // The swipe deck and the plan itself already show the count.
  if (!items.length || pathname.startsWith("/swipe") || pathname === "/plan/my") return null;
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 hidden justify-center px-4 lg:flex print:hidden">
      <Link
        href="/plan/my"
        className="flex items-center gap-3 rounded-full bg-be-navy py-2.5 pl-4 pr-2 text-sm font-semibold text-white shadow-2xl ring-1 ring-white/20"
      >
        <ClipboardList size={18} className="text-be-cyan" aria-hidden />
        {items.length} in my plan
        <span className="rounded-full bg-be-amber px-3.5 py-1.5 text-be-navy">View my plan</span>
      </Link>
    </div>
  );
}
