"use client";

import { useState } from "react";

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  centerLabel?: string;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/**
 * Interactive donut chart built with SVG arc paths — click a segment or a
 * legend row to isolate an airline; the center shows its share.
 */
export default function DonutChart({ segments, centerLabel }: DonutChartProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const cx = 100;
  const cy = 100;
  const r = 78;
  const stroke = 26;

  let angle = 0;
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;

  const arcs = segments.map((seg) => {
    const startAngle = angle;
    const sweep = (seg.value / total) * 360;
    angle += sweep;
    const start = polar(cx, cy, r, startAngle);
    const end = polar(cx, cy, r, startAngle + sweep);
    const largeArc = sweep > 180 ? 1 : 0;
    return {
      ...seg,
      path: `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
    };
  });

  const toggle = (label: string) => setSelected((prev) => (prev === label ? null : label));
  const selectedSeg = segments.find((s) => s.label === selected) ?? null;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="relative w-full max-w-[220px]">
        <svg viewBox="0 0 200 200" className="w-full">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eceef0" strokeWidth={stroke} />
          {arcs.map((a) => (
            <path
              key={a.label}
              d={a.path}
              fill="none"
              stroke={a.color}
              strokeWidth={selected === a.label ? stroke + 8 : stroke}
              strokeLinecap="round"
              opacity={selected && selected !== a.label ? 0.25 : 1}
              className="cursor-pointer transition-all duration-200 hover:brightness-110"
              onClick={() => toggle(a.label)}
            >
              <title>{`${a.label} — ${a.value} vols (${Math.round((a.value / total) * 100)}%)`}</title>
            </path>
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          {selectedSeg ? (
            <>
              <span className="font-display-lg text-display-lg text-primary">
                {Math.round((selectedSeg.value / total) * 100)}%
              </span>
              <span className="max-w-full truncate font-label-caps text-label-caps text-on-surface-variant">
                {selectedSeg.label}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface">{selectedSeg.value} vols</span>
            </>
          ) : (
            centerLabel && (
              <>
                <span className="font-display-lg text-display-lg text-primary">{centerLabel}</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant">vols</span>
              </>
            )
          )}
        </div>
      </div>

      <ul className="flex w-full flex-col gap-1">
        {segments.map((s) => (
          <li key={s.label}>
            <button
              type="button"
              onClick={() => toggle(s.label)}
              aria-pressed={selected === s.label}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-body-sm transition-colors hover:bg-surface-container-low ${
                selected && selected !== s.label ? "opacity-40" : ""
              }`}
            >
              <span className="flex items-center gap-2 text-on-surface-variant">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
              <span className="font-data-mono text-data-mono text-on-surface">
                {Math.round((s.value / total) * 100)}%
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
