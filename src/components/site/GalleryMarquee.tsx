"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryImage } from "@/lib/profiles";

/**
 * Two rows of same-height thumbnails drifting in opposite directions. Click a
 * photo for the full image; click anywhere (or press Escape) to close.
 * Reduced motion: rows stay still and scroll by hand.
 */
export default function GalleryMarquee({ images, name }: { images: GalleryImage[]; name: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [i, setI] = useState<number | null>(null);
  const rows = images.length > 3 ? [images.filter((_, n) => n % 2 === 0), images.filter((_, n) => n % 2 === 1)] : [images];

  const open = (n: number) => {
    setI(n);
    dialog.current?.showModal();
  };
  const step = useCallback((d: number) => setI((n) => (n === null ? n : (n + d + images.length) % images.length)), [images.length]);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const onClose = () => setI(null);
    el.addEventListener("keydown", onKey);
    el.addEventListener("close", onClose);
    return () => {
      el.removeEventListener("keydown", onKey);
      el.removeEventListener("close", onClose);
    };
  }, [step]);

  const cur = i === null ? null : images[i];

  return (
    <>
      <div className="space-y-3 md:space-y-4">
        {rows.map((row, r) => {
          const track = [...row, ...row];
          const dur = Math.max(30, row.length * 9);
          return (
            <div key={r} className="marquee" style={{ "--dur": `${dur}s` } as React.CSSProperties}>
              <ul className={`marquee-track ${r % 2 ? "marquee-right" : ""}`} aria-label={r === 0 ? `${name} photos` : undefined}>
                {track.map((img, n) => (
                  <li key={`${img.src}-${n}`} className="h-40 shrink-0 sm:h-52 md:h-64" aria-hidden={n >= row.length}>
                    <button
                      type="button"
                      tabIndex={n >= row.length ? -1 : 0}
                      onClick={() => open(images.indexOf(img))}
                      className="block h-full overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-be-cyan"
                      aria-label={`Open photo: ${img.alt}`}
                    >
                      <img src={img.src} alt="" width={img.width} height={img.height} loading="lazy" decoding="async" className="h-full w-auto object-cover transition-transform duration-500 hover:scale-[1.03]" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <dialog
        ref={dialog}
        aria-label={`${name} photo viewer`}
        className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-black/92"
        onClick={() => dialog.current?.close()}
      >
        {cur && (
          <figure className="relative flex h-[100svh] w-screen cursor-zoom-out flex-col items-center justify-center px-4 py-14">
            <img src={cur.src} alt={cur.alt} className="max-h-full max-w-full rounded-lg object-contain shadow-2xl" />
            <figcaption className="mt-3 text-center text-xs text-white/70">
              {cur.alt} · {i! + 1}/{images.length} · click anywhere to close
            </figcaption>
            <button type="button" onClick={() => dialog.current?.close()} aria-label="Close photo viewer" className="absolute right-4 top-4 rounded-full bg-white/15 p-2.5 text-white hover:bg-white/25">
              <X size={20} />
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white hover:bg-white/25"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white hover:bg-white/25"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </figure>
        )}
      </dialog>
    </>
  );
}
