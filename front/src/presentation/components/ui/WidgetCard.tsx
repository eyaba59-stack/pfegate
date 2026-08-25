"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Icon from "@/presentation/components/ui/Icon";

interface WidgetCardProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  titleClass?: string;
}

/**
 * Standard dashboard widget container: header row + body.
 * The header kebab toggles a fullscreen view of the widget (Esc closes).
 */
export default function WidgetCard({
  title,
  subtitle,
  actions,
  children,
  className = "",
  titleClass = "text-body-lg font-semibold",
}: WidgetCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const sync = () => setExpanded(document.fullscreenElement === cardRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!cardRef.current) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void cardRef.current.requestFullscreen();
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className={`flex flex-col rounded-lg border border-surface-variant bg-surface-container-lowest p-widget-padding card-shadow ${className} ${
        expanded ? "overflow-auto [&:fullscreen]:p-8" : ""
      }`}
    >
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className={`text-primary ${titleClass}`}>{title}</h3>
          {subtitle && <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{subtitle}</p>}
        </div>
        {actions ?? (
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={expanded ? "Quitter le plein écran" : "Afficher en plein écran"}
            title={expanded ? "Quitter le plein écran" : "Plein écran"}
            className="text-on-surface-variant transition-colors hover:text-primary"
          >
            <Icon name={expanded ? "close_fullscreen" : "open_in_full"} className="text-[20px]" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
