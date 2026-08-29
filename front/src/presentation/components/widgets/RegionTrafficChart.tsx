"use client";

import { useState } from "react";
import type { RegionTraffic } from "@/core/domain/entities/Destination";

interface RegionTrafficChartProps {
  data: RegionTraffic[];
}

const REGION_COLORS = {
  q1: "bg-secondary",
  q2: "bg-secondary-container",
};

export default function RegionTrafficChart({ data }: RegionTrafficChartProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<{ region: string; quarter: string } | null>(null);

  const maxVal = Math.max(...data.flatMap((r) => [r.q1, r.q2]), 1);
  const yLabels = ["2K", "1K", "0"];

  const getBarHeight = (value: number) => {
    const pct = (value / maxVal) * 100;
    return `${Math.round(pct)}%`;
  };

  return (
    <div>
      <div className="h-64 flex items-end justify-between gap-4 border-b border-surface-container pb-2 px-2 relative">
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-label-caps font-label-caps text-on-surface-variant -ml-8">
          {yLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="absolute left-0 top-0 w-full border-t border-surface-container border-dashed" />
        <div className="absolute left-0 top-1/2 w-full border-t border-surface-container border-dashed" />

        {data.map((r) => (
          <div
            key={r.region}
            className="flex-1 flex flex-col items-center gap-2 z-10 group cursor-pointer"
            onMouseEnter={() => setHoveredRegion(r.region)}
            onMouseLeave={() => setHoveredRegion(null)}
          >
            <div className="flex items-end gap-1 h-48 w-full justify-center">
              <div
                className={`w-8 bg-secondary rounded-t-sm group-hover:opacity-90 transition-opacity relative ${REGION_COLORS.q1}`}
                style={{ height: getBarHeight(r.q1) }}
                onMouseEnter={() => setHoveredBar({ region: r.region, quarter: "Q1" })}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {hoveredBar?.region === r.region && hoveredBar?.quarter === "Q1" && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-label-caps px-2 py-1 rounded whitespace-nowrap">
                    {r.q1.toLocaleString("fr-FR")}
                  </div>
                )}
              </div>
              <div
                className="w-8 bg-secondary-container rounded-t-sm group-hover:opacity-90 transition-opacity relative"
                style={{ height: getBarHeight(r.q2) }}
                onMouseEnter={() => setHoveredBar({ region: r.region, quarter: "Q2" })}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {hoveredBar?.region === r.region && hoveredBar?.quarter === "Q2" && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-label-caps px-2 py-1 rounded whitespace-nowrap">
                    {r.q2.toLocaleString("fr-FR")}
                  </div>
                )}
              </div>
            </div>
            <span className="text-body-sm font-body-sm text-on-surface font-medium">{r.region}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
