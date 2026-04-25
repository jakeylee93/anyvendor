"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Animation = "fade-up" | "scale-bounce" | "pulse-glow" | "rotate-in" | "slide-right";

interface AnimatedIconProps {
  children: ReactNode;
  animation?: Animation;
  delay?: number;
  className?: string;
}

export default function AnimatedIcon({ children, animation = "fade-up", delay = 0, className = "" }: AnimatedIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const animClass = visible ? `anim-${animation}-active` : `anim-${animation}-initial`;

  return (
    <div ref={ref} className={`${animClass} ${className}`}>
      {children}
    </div>
  );
}
