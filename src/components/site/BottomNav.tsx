"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Layers, Search, Sparkles } from "lucide-react";
import { useShortlist } from "./ShortlistProvider";

const TABS = [
  { href: "/", label: "Plan", icon: Sparkles, active: (p: string) => p === "/" || (p.startsWith("/plan") && p !== "/plan/my") },
  { href: "/swipe", label: "Swipe", icon: Layers, active: (p: string) => p.startsWith("/swipe") },
  { href: "/directory", label: "Directory", icon: Search, active: (p: string) => p.startsWith("/directory") || p.startsWith("/businesses") },
  { href: "/plan/my", label: "My plan", icon: ClipboardList, active: (p: string) => p === "/plan/my" },
];

/** App-style tab bar on phones and tablets; the desktop header covers larger screens. */
export default function BottomNav() {
  const pathname = usePathname() ?? "/";
  const { items } = useShortlist();
  return (
    <nav
      aria-label="App"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur lg:hidden print:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4">
        {TABS.map((t) => {
          const on = t.active(pathname);
          const Icon = t.icon;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${on ? "text-be-navy" : "text-be-grey"}`}
              >
                <Icon size={22} className={on ? "text-be-cyan" : ""} aria-hidden />
                {t.label}
                {t.href === "/plan/my" && items.length > 0 && (
                  <span className="absolute right-[calc(50%-22px)] top-1 min-w-[18px] rounded-full bg-be-amber px-1 text-center text-[10px] font-bold text-be-navy" aria-label={`${items.length} in my plan`}>
                    {items.length}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
