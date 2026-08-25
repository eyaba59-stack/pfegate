import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

/**
 * Base card container following the "Card Level" elevation of the design system.
 */
export default function Card({ children, className = "", hoverable = false }: CardProps) {
  return (
    <div
      className={[
        "rounded-lg border border-surface-variant bg-surface-container-lowest card-shadow",
        hoverable ? "card-hover" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
