"use client";

import { useState } from "react";

interface AreaChartProps {
  points: Array<{ month: string; value: number }>;
  color?: string;
  height?: number;
}

/**
 * Interactive area chart (SVG): click a point or a month label to read the
 * exact monthly volume.
 */
export default function AreaChart({ points, color = "#00668a", height = 280 }: AreaChartProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const width = 1000;
  const padX = 16;
  const padTop = 20;
  const padBottom = 30;
  const max = Math.max(...points.map((p) => p.value), 1);
  const innerH = height - padTop - padBottom;
  const innerW = width - padX * 2;
  const step = innerW / Math.max(points.length - 1, 1);

  const coords = points.map((p, i) => {
    const x = padX + i * step;
    const y = padTop + (1 - p.value / max) * innerH;
    return { x, y, ...p };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${coords[coords.length - 1].x},${height - padBottom} L${coords[0].x},${height - padBottom} Z`;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((f) => (
          <line
            key={f}
            x1={padX}
            x2={width - padX}
            y1={padTop + f * innerH}
            y2={padTop + f * innerH}
            stroke="currentColor"
            className="text-outline-variant/30"
          />
        ))}

        {activeIdx !== null && (
          <line
            x1={coords[activeIdx].x}
            x2={coords[activeIdx].x}
            y1={padTop}
            y2={height - padBottom}
            stroke="currentColor"
            className="text-outline-variant/50"
            strokeDasharray="3 3"
          />
        )}

        <path d={areaPath} fill="url(#area-fill)" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {coords.map((c, i) => (
          <g key={c.month}>
            <circle
              cx={c.x}
              cy={c.y}
              r={activeIdx === i ? 6 : 4}
              fill={color}
              stroke="#fff"
              strokeWidth={2}
              opacity={activeIdx === i ? 1 : 0.35}
              className={`cursor-pointer transition-all ${activeIdx === i ? "" : "hover:opacity-100"}`}
              onClick={() => setActiveIdx((prev) => (prev === i ? null : i))}
            >
              <title>{`${c.month} — ${c.value} vols`}</title>
            </circle>
            <rect
              x={c.x - step / 2}
              y={0}
              width={step}
              height={height}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => setActiveIdx((prev) => (prev === i ? null : i))}
            />
          </g>
        ))}
      </svg>

      {activeIdx !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-outline-variant bg-surface-container-lowest px-2 py-1 font-label-caps text-label-caps text-on-surface shadow-sm"
          style={{ left: `${(coords[activeIdx].x / width) * 100}%`, top: `${(coords[activeIdx].y / height) * 100}%` }}
        >
          {points[activeIdx].month} · <span className="font-bold">{points[activeIdx].value}</span> vols
        </div>
      )}

      <div className="absolute bottom-0 flex w-full justify-between px-1 md:px-4">
        {points.map((p, i) => (
          <button
            key={p.month}
            type="button"
            onClick={() => setActiveIdx((prev) => (prev === i ? null : i))}
            className={`whitespace-nowrap font-label-caps text-[10px] transition-colors hover:text-secondary md:text-label-caps ${
              activeIdx === i ? "font-bold text-secondary" : "text-on-surface-variant"
            }`}
          >
            {p.month}
          </button>
        ))}
      </div>
    </div>
  );
}
