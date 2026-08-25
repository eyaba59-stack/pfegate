"use client";

import { useState } from "react";
import type { PeakHourBar } from "@/core/domain/entities/Analytics";

interface PeakHoursChartProps {
  bars: PeakHourBar[];
  height?: number;
}

/**
 * Interactive traffic-density-by-hour chart ("Analyse des Heures de Pointe"):
 * click a bar to pin the hour and read its density.
 */
export default function PeakHoursChart({ bars, height = 192 }: PeakHoursChartProps) {
  const [activeHour, setActiveHour] = useState<number | null>(null);
  const active = bars.find((b) => b.hour === activeHour) ?? null;

  return (
    <div className="relative px-2 pb-6">
      <div className="absolute inset-0 flex flex-col justify-between pb-6 pt-2">
        <div className="w-full border-t border-outline-variant/30" />
        <div className="w-full border-t border-outline-variant/30" />
      </div>

      {active && (
        <div className="pointer-events-none absolute right-2 top-0 z-10 rounded-md border border-outline-variant bg-surface-container-lowest px-2 py-1 font-label-caps text-label-caps text-on-surface shadow-sm">
          {String(active.hour).padStart(2, "0")}h · <span className="font-bold">{active.density}%</span>
        </div>
      )}

      <div className="relative flex items-end gap-1" style={{ height }}>
        {bars.map((b) => {
          const isActive = activeHour === b.hour;
          return (
            <button
              key={b.hour}
              type="button"
              onClick={() => setActiveHour((prev) => (prev === b.hour ? null : b.hour))}
              aria-pressed={isActive}
              title={`${String(b.hour).padStart(2, "0")}h - ${b.density}%`}
              aria-label={`${String(b.hour).padStart(2, "0")}h — densité ${b.density}%`}
              className="flex h-full flex-1 cursor-pointer items-end"
            >
              <span
                className={`flex-1 rounded-t-sm transition-all duration-200 ${
                  isActive ? "brightness-110 outline outline-2 outline-primary" : ""
                } ${
                  b.density >= 60 ? "bg-primary-container" : b.density >= 40 ? "bg-secondary" : "bg-secondary-container"
                } ${b.density < 40 ? "hover:bg-secondary" : ""}`}
                style={{ height: `${b.density}%` }}
              />
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-0 flex w-full justify-between px-2">
        <span className="font-label-caps text-label-caps text-on-surface-variant">00h</span>
        <span className="font-label-caps text-label-caps text-on-surface-variant">06h</span>
        <span className="font-label-caps text-label-caps text-on-surface-variant">12h</span>
        <span className="font-label-caps text-label-caps text-on-surface-variant">18h</span>
        <span className="font-label-caps text-label-caps text-on-surface-variant">23h</span>
      </div>
    </div>
  );
}
