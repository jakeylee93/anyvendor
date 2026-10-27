"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryImage } from "@/lib/profiles";

export default function Gallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [i, setI] = useState<number | null>(null);

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
      <ul className="columns-2 gap-3 md:columns-3 md:gap-4">
        {images.map((img, n) => (
          <li key={img.src} className="mb-3 break-inside-avoid md:mb-4">
            <button
              type="button"
              onClick={() => open(n)}
              className="block w-full overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-be-cyan"
              aria-label={`Open photo ${n + 1} of ${images.length}: ${img.alt}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                loading="lazy"
                decoding="async"
                className="h-auto w-full transition-transform duration-500 hover:scale-[1.02]"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label={`${name} photo viewer`}
        className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-black/90"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close();
        }}
      >
        {cur && (
          <figure className="relative flex h-[100svh] w-screen flex-col items-center justify-center px-4 py-14">
            <img src={cur.src} alt={cur.alt} className="max-h-full max-w-full rounded object-contain" />
            <figcaption className="mt-3 text-center text-xs text-white/70">
              {cur.alt} · {i! + 1}/{images.length}
            </figcaption>
            <button type="button" onClick={() => dialog.current?.close()} aria-label="Close photo viewer" className="absolute right-4 top-4 rounded-full bg-white/15 p-2.5 text-white hover:bg-white/25">
              <X size={20} />
            </button>
            {images.length > 1 && (
              <>
                <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white hover:bg-white/25">
                  <ChevronLeft size={22} />
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next photo" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white hover:bg-white/25">
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
