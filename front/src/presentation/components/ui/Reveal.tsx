"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type RevealAnimation = "fade-up" | "fade-in" | "zoom-in" | "slide-left" | "slide-right";

interface RevealProps {
  children: ReactNode;
  animation?: RevealAnimation;
  delay?: number;
  className?: string;
  /** keep the element hidden until scrolled into view */
  once?: boolean;
}

/**
 * Reveals children with a configurable animation when they enter the viewport.
 * Wraps any server-rendered content safely (client component, no data logic).
 */
export default function Reveal({
  children,
  animation = "fade-up",
  delay = 0,
  className = "",
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      style={{ animationDelay: `${delay}ms` }}
      className={[
        "reveal",
        visible ? `reveal-visible reveal-${animation}` : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
