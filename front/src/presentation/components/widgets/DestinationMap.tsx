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

function project(lat: number, lng: number): { x: number; y: number } {
  const latMin = 20;
  const latMax = 60;
  const lngMin = -10;
  const lngMax = 50;
  const x = ((lng - lngMin) / (lngMax - lngMin)) * 700 + 50;
  const y = ((latMax - lat) / (latMax - latMin)) * 420 + 40;
  return { x, y };
}

const hub = project(MIR.lat, MIR.lng);

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

export default function DestinationMap({ destinations, selected, onSelect }: DestinationMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const projected = useMemo(
    () => destinations.map((d) => ({ ...d, ...project(d.lat, d.lng) })),
    [destinations]
  );

  const handleClick = useCallback(
    (code: string) => onSelect(selected === code ? null : code),
    [selected, onSelect]
  );

  const activeCode = selected || hovered;

  return (
    <div className="relative h-full w-full bg-[#f2f4f6] overflow-hidden">
      {/* Grid background */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 500">
        <defs>
          <filter id="glow">
            <feGaussianBlur result="blur" stdDeviation="1.5" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="marker-shadow">
            <feDropShadow dx="0" dy="2" floodColor="#000000" floodOpacity="0.3" stdDeviation="2" />
          </filter>
        </defs>
        <g stroke="rgba(118, 119, 125, 0.1)" strokeWidth="1">
          {[100, 200, 300, 400].map((y) => (
            <line key={`h${y}`} x1="0" x2="800" y1={y} y2={y} />
          ))}
          {[200, 400, 600].map((x) => (
            <line key={`v${x}`} x1={x} x2={x} y1="0" y2="500" />
          ))}
        </g>
      </svg>

      {/* Flight arcs + markers */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 500">
        {projected.map((d, i) => {
          const isActive = activeCode === d.code;
          return (
            <g key={d.code}>
              <path
                d={arcPath(hub.x, hub.y, d.x, d.y)}
                fill="none"
                stroke={isActive ? DEST_COLORS[i % DEST_COLORS.length] : "rgba(0, 102, 138, 0.15)"}
                strokeWidth={isActive ? 2.5 : 1}
                strokeDasharray={isActive ? "none" : "4 4"}
                className="transition-all duration-300"
              />
              <g
                className="cursor-pointer"
                onClick={() => handleClick(d.code)}
                onMouseEnter={() => setHovered(d.code)}
                onMouseLeave={() => setHovered(null)}
                style={{ filter: isActive ? `drop-shadow(0 0 8px ${DEST_COLORS[i % DEST_COLORS.length]})` : "url(#marker-shadow)" }}
              >
                <circle
                  cx={d.x}
                  cy={d.y}
                  fill={isActive ? DEST_COLORS[i % DEST_COLORS.length] : "#131b2e"}
                  r={isActive ? 7 : 5}
                  stroke="#ffffff"
                  strokeWidth={isActive ? 2 : 1.5}
                  className="transition-all duration-300"
                />
              </g>
            </g>
          );
        })}

        {/* Monastir hub */}
        <g className="pointer-events-none">
          <circle className="animate-ping" cx={hub.x} cy={hub.y} fill="rgba(0, 102, 138, 0.2)" r="16" />
          <circle cx={hub.x} cy={hub.y} fill="#00668a" filter="url(#marker-shadow)" r="8" stroke="#ffffff" strokeWidth="2" />
        </g>
      </svg>

      {/* Data labels */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute text-body-sm font-bold text-on-surface bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm border border-surface-variant"
          style={{ top: hub.y + 14, left: hub.x - 20 }}>
          MIR (Monastir)
        </div>
        {projected.map((d, i) => {
          const isActive = activeCode === d.code;
          return (
            <div
              key={d.code}
              className={`absolute pointer-events-auto cursor-pointer px-3 py-1.5 rounded-lg shadow-md text-body-sm font-medium border backdrop-blur transition-all duration-300 ${
                isActive
                  ? "bg-secondary text-on-secondary border-secondary/30 shadow-lg scale-105 z-20"
                  : "bg-primary-container/95 text-on-primary border-outline-variant/30 hover:bg-secondary-container hover:text-on-secondary-container"
              }`}
              style={{ top: d.y - 30, left: d.x - 40 }}
              onClick={() => handleClick(d.code)}
              onMouseEnter={() => setHovered(d.code)}
              onMouseLeave={() => setHovered(null)}
            >
              {d.city}: {d.passengers.toLocaleString("fr-FR")}
            </div>
          );
        })}
      </div>
    </div>
  );
}
