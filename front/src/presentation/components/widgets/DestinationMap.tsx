"use client";

import { useState, useMemo, useCallback } from "react";

interface DestData {
  rank: number;
  code: string;
  city: string;
  country: string;
  passengers: number;
  sharePercent: number;
  barColor: string;
  lat: number;
  lng: number;
}

interface DestinationMapProps {
  destinations: DestData[];
  selected: string | null;
  onSelect: (code: string | null) => void;
}

const MIR = { lat: 35.758, lng: 10.754 };

function project(lat: number, lng: number, bounds: { latMin: number; latMax: number; lngMin: number; lngMax: number }): { x: number; y: number } {
  const { latMin, latMax, lngMin, lngMax } = bounds;
  const x = ((lng - lngMin) / (lngMax - lngMin)) * 680 + 60;
  const y = ((latMax - lat) / (latMax - latMin)) * 380 + 40;
  return { x, y };
}

function computeBounds(destinations: DestData[]) {
  const lats = destinations.map((d) => d.lat);
  const lngs = destinations.map((d) => d.lng);
  const latMin = Math.min(...lats) - 3;
  const latMax = Math.max(...lats) + 3;
  const lngMin = Math.min(...lngs) - 5;
  const lngMax = Math.max(...lngs) + 5;
  return { latMin, latMax, lngMin, lngMax };
}

function arcPath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const curve = dist * 0.25;
  const cx = mx - (dy / dist) * curve;
  const cy = my + (dx / dist) * curve;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

const DEST_COLORS = ["#00668a", "#40c2fd", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f43f5e", "#f97316", "#eab308"];

function formatPax(n: number): string {
  return n.toLocaleString("fr-FR");
}

export default function DestinationMap({ destinations, selected, onSelect }: DestinationMapProps) {
  const bounds = useMemo(() => computeBounds(destinations), [destinations]);
  const hub = useMemo(() => project(MIR.lat, MIR.lng, bounds), [bounds]);

  const projected = useMemo(
    () => destinations.map((d) => ({ ...d, ...project(d.lat, d.lng, bounds) })),
    [destinations, bounds]
  );

  const selectedDest = useMemo(() => projected.find((d) => d.code === selected), [projected, selected]);

  const handleClick = useCallback(
    (code: string) => onSelect(selected === code ? null : code),
    [selected, onSelect]
  );

  return (
    <div className="relative h-full w-full bg-[#f2f4f6] overflow-hidden flex flex-col">
      <div className="flex-1 relative">
        {/* Grid background */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 460">
          <defs>
            <filter id="marker-shadow">
              <feDropShadow dx="0" dy="2" floodColor="#000000" floodOpacity="0.3" stdDeviation="2" />
            </filter>
          </defs>
          <g stroke="rgba(118, 119, 125, 0.1)" strokeWidth="1">
            {[100, 200, 300, 400].map((y) => (
              <line key={`h${y}`} x1="0" x2="800" y1={y} y2={y} />
            ))}
            {[200, 400, 600].map((x) => (
              <line key={`v${x}`} x1={x} x2={x} y1="0" y2="460" />
            ))}
          </g>
        </svg>

        {/* Flight arcs + markers + labels */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 460">
          {projected.map((d, i) => {
            const isActive = selected === d.code;
            const isHovered = !selected && false;
            const color = DEST_COLORS[i % DEST_COLORS.length];
            return (
              <g key={d.code}>
                {/* Arc */}
                <path
                  d={arcPath(hub.x, hub.y, d.x, d.y)}
                  fill="none"
                  stroke={isActive ? color : "rgba(0, 102, 138, 0.2)"}
                  strokeWidth={isActive ? 2.5 : 1}
                  strokeDasharray={isActive ? "none" : "4 4"}
                  className="transition-all duration-300"
                />
                {/* Marker */}
                <circle
                  cx={d.x}
                  cy={d.y}
                  fill={isActive ? color : "#131b2e"}
                  r={isActive ? 7 : 5}
                  stroke="#ffffff"
                  strokeWidth={isActive ? 2.5 : 1.5}
                  filter="url(#marker-shadow)"
                  className="cursor-pointer transition-all duration-300"
                  onClick={() => handleClick(d.code)}
                  style={{ filter: isActive ? `drop-shadow(0 0 8px ${color})` : undefined }}
                />
                {/* Label always visible */}
                <g
                  className="cursor-pointer"
                  onClick={() => handleClick(d.code)}
                >
                  <rect
                    x={d.x - 4}
                    y={d.y - 24}
                    width={d.city.length * 7 + 40}
                    height={20}
                    rx={4}
                    fill={isActive ? color : "#131b2e"}
                    fillOpacity={isActive ? 1 : 0.85}
                    className="transition-all duration-300"
                  />
                  <text
                    x={d.x + 2}
                    y={d.y - 11}
                    fill="white"
                    fontSize="11"
                    fontWeight="600"
                    fontFamily="Inter, sans-serif"
                    className="pointer-events-none select-none"
                  >
                    {d.city}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Monastir hub */}
          <g className="pointer-events-none">
            <circle className="animate-ping" cx={hub.x} cy={hub.y} fill="rgba(0, 102, 138, 0.2)" r="16" />
            <circle cx={hub.x} cy={hub.y} fill="#00668a" filter="url(#marker-shadow)" r="8" stroke="#ffffff" strokeWidth="2" />
          </g>
          {/* Hub label */}
          <rect x={hub.x - 4} y={hub.y + 12} width={110} height={20} rx={4} fill="#00668a" fillOpacity={0.9} />
          <text x={hub.x + 2} y={hub.y + 25} fill="white" fontSize="11" fontWeight="700" fontFamily="Inter, sans-serif">
            MIR (Monastir)
          </text>
        </svg>
      </div>

      {/* Selected destination detail panel */}
      {selectedDest && (
        <div className="absolute bottom-0 left-0 right-0 bg-surface-container-lowest/95 backdrop-blur-md border-t border-surface-variant px-5 py-3 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-body-md"
                style={{ backgroundColor: DEST_COLORS[projected.indexOf(selectedDest) % DEST_COLORS.length] }}
              >
                {selectedDest.rank}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-headline-sm font-headline-sm text-on-surface">{selectedDest.city}</span>
                  <span className="rounded bg-surface-container px-2 py-0.5 text-label-caps font-label-caps text-on-surface-variant font-mono">{selectedDest.code}</span>
                </div>
                <span className="text-body-sm text-on-surface-variant">{selectedDest.country}</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-headline-sm font-headline-sm text-secondary">{formatPax(selectedDest.passengers)}</div>
                <div className="text-label-caps font-label-caps text-on-surface-variant">passagers</div>
              </div>
              <div className="text-right">
                <div className="text-headline-sm font-headline-sm text-on-surface">{selectedDest.sharePercent}%</div>
                <div className="text-label-caps font-label-caps text-on-surface-variant">part</div>
              </div>
              <button
                onClick={() => onSelect(null)}
                className="ml-2 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
