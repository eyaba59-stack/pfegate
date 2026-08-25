"use client";

import { useState } from "react";
import type { PeakHourBar } from "@/core/domain/entities/Analytics";
import PeakHoursChart from "@/presentation/components/widgets/PeakHoursChart";

type PeakView = "today" | "week";

const VIEWS: { id: PeakView; label: string }[] = [
  { id: "today", label: "Auj" },
  { id: "week", label: "Sem" },
];

interface PeakHoursToggleProps {
  todayBars: PeakHourBar[];
  weekBars: PeakHourBar[];
}

/**
 * Interactive "Auj / Sem" switch for the peak-hours widget. Each tab renders the
 * hourly density computed by the backend for its own trailing window (1 vs 7 days).
 */
export default function PeakHoursToggle({ todayBars, weekBars }: PeakHoursToggleProps) {
  const [view, setView] = useState<PeakView>("today");

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <div />
        <div className="flex items-center rounded-lg bg-surface-container-low p-1" role="group" aria-label="Période d'analyse">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={view === v.id}
              onClick={() => setView(v.id)}
              className={`rounded px-3 py-1 font-label-caps text-label-caps transition-colors ${
                view === v.id
                  ? "bg-surface-container-lowest font-bold text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <PeakHoursChart bars={view === "today" ? todayBars : weekBars} />
    </>
  );
}
