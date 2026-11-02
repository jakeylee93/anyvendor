"use client";

import { useEffect, useRef, useState } from "react";

/** Shows the real website inside a framed box, scaled to fit (phone layout on phones, desktop on wide screens). */
export default function SitePreviewFrame({ src, title, height = 460 }: { src: string; title: string; height?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const device = width && width < 560 ? 390 : 1280;
  const scale = width ? width / device : 0;
  return (
    <div ref={box} className="relative w-full overflow-hidden rounded-2xl bg-white ring-1 ring-black/10" style={{ height }}>
      <div className="flex h-7 items-center gap-1.5 border-b border-gray-200 bg-be-mist px-3" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
      </div>
      {scale > 0 && (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          tabIndex={-1}
          className="pointer-events-none absolute left-0 top-7 origin-top-left border-0"
          style={{ width: device, height: (height - 28) / scale, transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
}
