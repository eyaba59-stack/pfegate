"use client";

import { useState } from "react";
import type { AirlineDelay } from "@/core/domain/entities/Analytics";

interface HorizontalDelayBarsProps {
  bars: AirlineDelay[];
}

/**
 * Interactive horizontal ranked bars for "Retards par Compagnie": click a row
 * to pin it and see its share of the worst delay.
 */
export default function HorizontalDelayBars({ bars }: HorizontalDelayBarsProps) {
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const maxMin = Math.max(...bars.map((b) => b.minutes), 1);

  return (
    <div className="flex flex-col gap-2">
      {bars.map((b) => {
        const isActive = activeCode === b.code;
        return (
          <button
            key={b.code}
            type="button"
            onClick={() => setActiveCode((prev) => (prev === b.code ? null : b.code))}
            aria-pressed={isActive}
            title={`${b.code} — ${b.minutes} min de retard moyen`}
            className={`flex items-center gap-4 rounded-lg px-2 py-1.5 text-left transition-colors ${
              isActive ? "bg-surface-container-low ring-1 ring-outline-variant" : "hover:bg-surface-container-low"
            }`}
          >
            <div className="w-16 text-right">
              <span className={`font-data-mono text-data-mono ${isActive ? "font-bold text-primary" : "text-on-surface"}`}>
                {b.code}
              </span>
            </div>
            <div className="relative h-4 flex-grow overflow-hidden rounded-full bg-surface-container">
              <div
                className={`absolute left-0 top-0 h-full rounded-full transition-all ${b.barColor}`}
                style={{ width: `${b.barWidth}%` }}
              />
            </div>
            <div className={`w-16 shrink-0 text-right ${isActive ? "w-24" : "w-10"}`}>
              <span className={`font-label-caps text-label-caps ${isActive ? "font-bold text-on-surface" : "text-on-surface-variant"}`}>
                {String(b.minutes).padStart(2, "0")}m
                {isActive && <span className="ml-1 text-on-surface-variant">· {Math.round((b.minutes / maxMin) * 100)}% du max</span>}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
