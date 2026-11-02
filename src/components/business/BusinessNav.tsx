"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Home, Megaphone, Palette, UserRound } from "lucide-react";

const ICONS = { home: Home, profile: UserRound, website: Globe, marketing: Megaphone, brand: Palette };
export type NavKey = keyof typeof ICONS;

type Items = { key: NavKey; href: string; label: string }[];

function useActive() {
  const path = usePathname() ?? "";
  return (href: string) => (href === "/business" ? path === "/business" : path.startsWith(href));
}

/** A simple row in the header on larger screens. Only enabled modules are passed in. */
export default function BusinessNav({ items }: { items: Items }) {
  const active = useActive();
  return (
    <nav aria-label="Business" className="hidden gap-1 md:flex">
        {items.map((i) => (
          <Link key={i.key} href={i.href} aria-current={active(i.href) ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${active(i.href) ? "bg-be-navy text-white" : "text-be-navy hover:bg-be-mist"}`}>
            {i.label}
          </Link>
      ))}
    </nav>
  );
}

/** Bottom tab bar on phones. Rendered outside the header: the header's backdrop blur would trap a fixed element. */
export function BusinessTabBar({ items }: { items: Items }) {
  const active = useActive();
  return (
      <nav aria-label="Business tabs" className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map((i) => {
            const Icon = ICONS[i.key];
            const on = active(i.href);
            return (
              <li key={i.key}>
                <Link href={i.href} aria-current={on ? "page" : undefined} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${on ? "text-be-navy" : "text-be-grey"}`}>
                  <Icon size={22} className={on ? "text-be-cyan" : ""} aria-hidden />
                  {i.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
  );
}
