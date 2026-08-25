"use client";

import { useState } from "react";

interface BarGroup {
  label: string;
  valueA: number;
  valueB: number;
  colorA: string;
  colorB: string;
}

interface GroupedBarChartProps {
  groups: BarGroup[];
  legendA: string;
  legendB: string;
  height?: number;
}

/**
 * Interactive grouped vertical bar chart (pure CSS/Flex): click the legend to
 * show/hide a series, click a group to read its exact values.
 */
export default function GroupedBarChart({ groups, legendA, legendB, height = 256 }: GroupedBarChartProps) {
  const [showA, setShowA] = useState(true);
  const [showB, setShowB] = useState(true);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const max = Math.max(...groups.flatMap((g) => [g.valueA, g.valueB]), 1);

  const toggleSeries = (which: "a" | "b") => {
    if (which === "a") {
      if (showA && !showB) return;
      setShowA((v) => !v);
    } else {
      if (showB && !showA) return;
      setShowB((v) => !v);
    }
  };

  const legendBtn = (which: "a" | "b", color: string, label: string, shown: boolean) => (
    <button
      type="button"
      onClick={() => toggleSeries(which)}
      aria-pressed={shown}
      className={`flex items-center gap-2 rounded px-1.5 py-0.5 font-label-caps text-label-caps transition-colors hover:bg-surface-container-low ${
        shown ? "text-on-surface-variant" : "text-on-surface-variant/40 line-through"
      }`}
    >
      <span className={`h-3 w-3 rounded-sm transition-opacity ${shown ? "" : "opacity-30"}`} style={{ backgroundColor: color }} />
      {label}
    </button>
  );

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {legendBtn("a", groups[0]?.colorA ?? "#131b2e", legendA, showA)}
        {legendBtn("b", groups[0]?.colorB ?? "#00668a", legendB, showB)}
        {activeLabel && (
          <button
            type="button"
            onClick={() => setActiveLabel(null)}
            className="ml-auto font-label-caps text-label-caps text-secondary hover:underline"
          >
            Effacer la sélection
          </button>
        )}
      </div>

      <div className="relative border-b border-surface-container pb-2">
        <div className="absolute left-0 top-0 h-full w-full border-t border-dashed border-surface-container" />
        <div className="absolute left-0 top-1/2 h-full w-full border-t border-dashed border-surface-container" />

        <div className="relative flex items-end justify-around gap-2 px-1 md:gap-4 md:px-2" style={{ height }}>
          {groups.map((g) => {
            const isActive = activeLabel === g.label;
            const hasSelection = activeLabel !== null;
            return (
              <button
                key={g.label}
                type="button"
                onClick={() => setActiveLabel((prev) => (prev === g.label ? null : g.label))}
                aria-pressed={isActive}
                className={`flex flex-1 cursor-pointer flex-col items-center justify-end gap-2 rounded-md self-stretch transition-opacity ${
                  hasSelection && !isActive ? "opacity-45 hover:opacity-70" : ""
                }`}
              >
                {isActive && (
                  <span className="font-data-mono text-data-mono text-on-surface">
                    {showA && <span className="mr-1">{g.valueA}</span>}
                    {showA && showB && <span className="text-on-surface-variant">/</span>}
                    {showB && <span className="ml-1">{g.valueB}</span>}
                  </span>
                )}
                <div className="flex w-full items-end justify-center gap-0.5 md:gap-1">
                  {showA && (
                    <div
                      className={`w-4 rounded-t-sm transition-all md:w-7 ${isActive ? "brightness-125" : "group-hover:brightness-110"}`}
                      style={{ height: `${Math.max(4, (g.valueA / max) * (height - 40))}px`, backgroundColor: g.colorA }}
                    />
                  )}
                  {showB && (
                    <div
                      className={`w-4 rounded-t-sm transition-all md:w-7 ${isActive ? "brightness-125" : ""}`}
                      style={{ height: `${Math.max(4, (g.valueB / max) * (height - 40))}px`, backgroundColor: g.colorB }}
                    />
                  )}
                </div>
                <span
                  className={`text-center font-body-sm text-body-sm font-medium ${
                    isActive ? "text-secondary" : "text-on-surface"
                  }`}
                >
                  {g.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
