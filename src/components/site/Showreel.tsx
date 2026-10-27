"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

export interface ReelRendition {
  video: string;
  poster: string;
  posterWebp: string;
}

interface Props {
  desktop: ReelRendition;
  mobile: ReelRendition;
  label: string;
  children?: React.ReactNode;
}

const PORTRAIT = "(orientation: portrait)";
const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * Muted showreel hero. The poster <picture> renders on the server so the hero
 * is never blank; the matching 16:9 or 9:16 reel is attached on the client.
 * Reduced motion: stays on the poster until the visitor presses Play.
 */
export default function Showreel({ desktop, mobile, label, children }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  // Choose rendition by orientation; respect reduced motion for autoplay.
  useEffect(() => {
    const portrait = window.matchMedia(PORTRAIT);
    const reduced = window.matchMedia(REDUCED);
    if (reduced.matches) userPaused.current = true;
    const pick = () => setSrc(portrait.matches ? mobile.video : desktop.video);
    pick();
    portrait.addEventListener("change", pick);
    return () => portrait.removeEventListener("change", pick);
  }, [desktop.video, mobile.video]);

  // Load the chosen rendition and keep play state in sync.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    setReady(false);
    v.src = src;
    v.load();
    if (!userPaused.current) v.play().catch(() => setPlaying(false));
  }, [src]);

  // Pause while off screen (not a user pause).
  useEffect(() => {
    const el = sectionRef.current;
    const v = videoRef.current;
    if (!el || !v) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!userPaused.current) v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Reversible scroll-linked parallax (phones and desktop); off for reduced motion.
  useEffect(() => {
    if (window.matchMedia(REDUCED).matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = sectionRef.current;
      if (!el) return;
      const h = el.offsetHeight || 1;
      const p = Math.min(Math.max(window.scrollY / h, 0), 1);
      if (mediaRef.current) mediaRef.current.style.transform = `translate3d(0, ${p * 28}%, 0) scale(${1 + p * 0.12})`;
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(0, ${p * -18}%, 0)`;
        contentRef.current.style.opacity = String(1 - p * 1.1);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => {});
    } else {
      userPaused.current = true;
      v.pause();
    }
  };

  return (
    <section ref={sectionRef} aria-label={label} className="relative isolate h-[86svh] min-h-[560px] overflow-hidden bg-be-deep text-white md:h-[88vh]">
      <div ref={mediaRef} className="absolute inset-0 will-change-transform">
        <picture>
          <source media={PORTRAIT} srcSet={mobile.posterWebp} type="image/webp" />
          <source media={PORTRAIT} srcSet={mobile.poster} />
          <source srcSet={desktop.posterWebp} type="image/webp" />
          <img src={desktop.poster} alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
        </picture>
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          tabIndex={-1}
          onPlaying={() => {
            setReady(true);
            setPlaying(true);
          }}
          onPause={() => setPlaying(false)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,0,48,0.35)_0%,rgba(8,0,48,0)_30%,rgba(8,0,48,0.15)_55%,rgba(8,0,48,0.88)_100%)]" />
      </div>

      <div ref={contentRef} className="relative flex h-full items-end will-change-transform">
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 md:pb-16">{children}</div>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause showreel" : "Play showreel"}
        className="absolute bottom-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/40 backdrop-blur hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white md:bottom-6 md:right-6"
      >
        {playing ? <Pause size={18} aria-hidden /> : <Play size={18} aria-hidden />}
      </button>
    </section>
  );
}
