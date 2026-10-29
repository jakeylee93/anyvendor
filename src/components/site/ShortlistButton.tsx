"use client";

import { Heart } from "lucide-react";
import { useShortlist } from "./ShortlistProvider";

export default function ShortlistButton({ slug, need = null, name, className = "" }: { slug: string; need?: string | null; name: string; className?: string }) {
  const { has, toggle } = useShortlist();
  const on = has(slug);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug, need);
      }}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from my plan` : `Add ${name} to my plan`}
      className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md ring-2 ring-white/90 transition ${on ? "bg-be-amber text-be-navy" : "bg-white/90 text-be-navy hover:bg-white"} ${className}`}
    >
      <Heart size={18} fill={on ? "currentColor" : "none"} aria-hidden />
    </button>
  );
}
