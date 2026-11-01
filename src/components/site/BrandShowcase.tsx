"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { BrandLockup } from "./BrandMark";

/** The animated lockup with a replay button (re-mounting restarts the CSS animation). */
export default function BrandShowcase() {
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex min-h-[320px] w-full items-center justify-center rounded-[32px] bg-white ring-1 ring-gray-200 md:min-h-[420px]">
        <BrandLockup key={run} animate />
      </div>
      <button
        type="button"
        onClick={() => setRun((n) => n + 1)}
        className="inline-flex items-center gap-2 rounded-full border border-be-navy px-5 py-2.5 text-sm font-semibold text-be-navy hover:bg-be-mist"
      >
        <RotateCcw size={16} aria-hidden /> Play again
      </button>
    </div>
  );
}
