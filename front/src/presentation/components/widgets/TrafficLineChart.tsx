"use client";

import { useState } from "react";

interface LineSeries {
  name: string;
  color: string;
  values: number[];
}

interface TrafficLineChartProps {
  series: LineSeries[];
  labels: string[];
  height?: number;
}

/**
 * Interactive multi-series line chart (pure SVG): click the legend to show/hide
 * a series, click a point (or its column) to read exact values.
 */
export default function TrafficLineChart({ series, labels, height = 240 }: TrafficLineChartProps) {
  const [hidden, setHidden] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const width = 800;
  const padding = 12;

  const visible = series.filter((s) => !hidden.includes(s.name));
  const max = Math.max(...(visible.length ? visible : series).flatMap((s) => s.values), 1);
  const min = 0;
  const range = max - min || 1;
  const step = (width - padding * 2) / Math.max(labels.length - 1, 1);
  const toX = (i: number) => padding + i * step;
  const toY = (v: number) => padding + (1 - (v - min) / range) * (height - padding * 2);

  const toggleSeries = (name: string) =>
    setHidden((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  return (
    <div className="relative w-full">
      <div className="mb-2 flex items-center justify-end gap-3">
        {series.map((s) => (
          <button
            key={s.name}
            type="button"
            onClick={() => toggleSeries(s.name)}
            aria-pressed={!hidden.includes(s.name)}
            className={`flex items-center gap-2 rounded px-1.5 py-0.5 font-label-caps text-label-caps transition-colors hover:bg-surface-container-low ${
              hidden.includes(s.name) ? "text-on-surface-variant line-through opacity-50" : "text-on-surface"
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            {s.name}
          </button>
        ))}
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
          {[0, 0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={padding}
              x2={width - padding}
              y1={padding + f * (height - padding * 2)}
              y2={padding + f * (height - padding * 2)}
              stroke="currentColor"
              className="text-outline-variant/40"
              strokeDasharray="4 4"
            />
          ))}

          {activeIdx !== null && (
            <line
              x1={toX(activeIdx)}
              x2={toX(activeIdx)}
              y1={padding}
              y2={height - padding}
              stroke="currentColor"
              className="text-outline-variant/60"
              strokeDasharray="3 3"
            />
          )}

          {visible.map((s) => (
            <path
              key={s.name}
              d={s.values.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ")}
              fill="none"
              stroke={s.color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {activeIdx !== null &&
            visible.map((s) => (
              <circle
                key={`${s.name}-dot`}
                cx={toX(activeIdx)}
                cy={toY(s.values[activeIdx])}
                r={4.5}
                fill={s.color}
                stroke="#fff"
                strokeWidth={1.5}
              />
            ))}

          {labels.map((_, i) => (
            <rect
              key={`hit-${i}`}
              x={toX(i) - step / 2}
              y={0}
              width={step}
              height={height}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => setActiveIdx((prev) => (prev === i ? null : i))}
            />
          ))}
        </svg>

        {activeIdx !== null && (
          <div className="pointer-events-none absolute left-2 top-2 rounded-md border border-outline-variant bg-surface-container-lowest px-2 py-1 font-label-caps text-label-caps text-on-surface shadow-sm">
            <span className="mr-2 font-bold">{labels[activeIdx]}</span>
            {visible.map((s) => (
              <span key={`${s.name}-val`} className="mr-2" style={{ color: s.color }}>
                {s.name} {s.values[activeIdx]}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-between px-1">
        {labels.map((l, i) => (
          <button
            key={l}
            type="button"
            onClick={() => setActiveIdx((prev) => (prev === i ? null : i))}
            className={`font-label-caps text-label-caps transition-colors hover:text-secondary ${
              activeIdx === i ? "font-bold text-secondary" : "text-on-surface-variant"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <span className="pointer-events-none absolute right-2 top-10 rounded bg-surface-container-low px-1.5 py-0.5 font-label-caps text-label-caps text-on-surface-variant">
        Max {max}
      </span>
    </div>
  );
}
