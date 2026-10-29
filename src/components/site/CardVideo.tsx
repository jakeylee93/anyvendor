"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Muted looping showreel inside a card. Loads and plays only while the card is
 * on screen (saves data on phones); poster only under reduced motion.
 */
export default function CardVideo({ video, poster, alt, className = "" }: { video: string; poster: string; alt: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);
  const motion = useRef(true);

  useEffect(() => {
    motion.current = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting && e.intersectionRatio >= 0.4), { threshold: [0, 0.4] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (on && motion.current) {
      if (!el.getAttribute("src")) el.src = video;
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [on, video]);

  return (
    <>
      <img src={poster} alt={alt} loading="lazy" decoding="async" className={`absolute inset-0 h-full w-full object-cover ${className}`} />
      <video
        ref={ref}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        tabIndex={-1}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0"} ${className}`}
      />
    </>
  );
}
