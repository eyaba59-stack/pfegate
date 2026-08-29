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

function formatPax(n: number): string {
  return n.toLocaleString("fr-FR");
}

interface LabelOffset { dx: number; dy: number; }

function getLabelOffset(markerX: number, markerY: number, hubX: number, hubY: number): LabelOffset {
  const angle = Math.atan2(markerY - hubY, markerX - hubX);
  const deg = (angle * 180) / Math.PI;
  if (deg >= -45 && deg < 45) return { dx: 30, dy: -20 };
  if (deg >= 45 && deg < 135) return { dx: -20, dy: 30 };
  if (deg >= -135 && deg < -45) return { dx: -20, dy: -30 };
  return { dx: -60, dy: 30 };
}

export default function DestinationMap({ destinations, selected, onSelect }: DestinationMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const bounds = useMemo(() => computeBounds(destinations), [destinations]);
  const hub = useMemo(() => project(MIR.lat, MIR.lng, bounds), [bounds]);

  const projected = useMemo(
    () => destinations.map((d) => ({ ...d, ...project(d.lat, d.lng, bounds) })),
    [destinations, bounds]
  );

  const activeCode = selected || hovered;

  const handleClick = useCallback(
    (code: string) => onSelect(selected === code ? null : code),
    [selected, onSelect]
  );

  return (
    <div className="flex-1 relative w-full h-full bg-[#f2f4f6] overflow-hidden border-t">
      {/* Professional Vector Base Map */}
      <div className="absolute inset-0 bg-[#e5e7eb] overflow-hidden">
        <img
          alt="Detailed Vector Map Base"
          className="w-full h-full object-cover opacity-40 mix-blend-multiply grayscale"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWjnrzvUlmLoXOlFF5D69RB8CsezgTepLCItGb5_Xk8M_9v61bj7wVKqr3q1zzxxyNXIUO0GWKZ1nVYRwp12Q0ETXxEp2cFCBIfDdEb9Q9G0JUdOI1k0qRzfnjMJs5nfmBMEx6rmbGgI_oGNIA_NVQmewo03RYg0IzmoCHCZMk-Od6GiufGiBoFWyqfye4ESw35S82zKFpusHL3oknACBvY7XcX7hiVWqr50R1AC7QCNZ8hk7Gp4mQWg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent opacity-50 pointer-events-none" />
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 500">
          <g stroke="rgba(118, 119, 125, 0.1)" strokeWidth="1">
            {[100, 200, 300, 400].map((y) => (
              <line key={`h${y}`} x1="0" x2="800" y1={y} y2={y} />
            ))}
            {[200, 400, 600].map((x) => (
              <line key={`v${x}`} x1={x} x2={x} y1="0" y2="500" />
            ))}
          </g>
        </svg>
      </div>

      {/* Flight Arcs + Markers */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 500">
        <defs>
          <filter id="glow">
            <feGaussianBlur result="blur" stdDeviation="1.5" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="marker-shadow">
            <feDropShadow dx="0" dy="2" floodColor="#000000" floodOpacity="0.3" stdDeviation="2" />
          </filter>
        </defs>
        {projected.map((d, i) => {
          const isActive = activeCode === d.code;
          return (
            <g key={d.code}>
              <path
                d={arcPath(hub.x, hub.y, d.x, d.y)}
                fill="none"
                stroke={isActive ? "rgba(0, 102, 138, 0.6)" : "rgba(0, 102, 138, 0.15)"}
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={isActive ? "none" : "4 4"}
                className="transition-all duration-300"
              />
              <circle
                cx={d.x}
                cy={d.y}
                fill={isActive ? "#40c2fd" : "#131b2e"}
                r={isActive ? 7 : 5}
                stroke="#ffffff"
                strokeWidth={isActive ? 2 : 1.5}
                filter="url(#marker-shadow)"
                className="map-marker cursor-pointer transition-all duration-300"
                style={{ transformOrigin: `${d.x}px ${d.y}px`, transform: isActive ? "scale(1.2)" : "scale(1)", filter: isActive ? "drop-shadow(0 0 8px rgba(64, 194, 253, 0.8))" : undefined }}
                onClick={() => handleClick(d.code)}
                onMouseEnter={() => setHovered(d.code)}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          );
        })}

        {/* Monastir Hub */}
        <g className="pointer-events-none">
          <circle className="animate-ping" cx={hub.x} cy={hub.y} fill="rgba(0, 102, 138, 0.2)" r="16" />
          <circle cx={hub.x} cy={hub.y} fill="#00668a" filter="url(#marker-shadow)" r="8" stroke="#ffffff" strokeWidth="2" />
        </g>
      </svg>

      {/* Data Labels — each label offset from its marker to avoid overlap */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute text-body-sm font-bold text-on-surface bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm border border-surface-variant pointer-events-auto"
          style={{ top: `${(hub.y / 500) * 100}%`, left: `${(hub.x / 800) * 100}%` }}
        >
          MIR (Monastir)
        </div>
        {projected.map((d) => {
          const isActive = activeCode === d.code;
          const off = getLabelOffset(d.x, d.y, hub.x, hub.y);
          const labelX = d.x + off.dx;
          const labelY = d.y + off.dy;
          return (
            <div
              key={d.code}
              className={`map-label absolute bg-primary-container/95 backdrop-blur text-on-primary px-3 py-1.5 rounded-lg shadow-md text-body-sm font-medium border border-outline-variant/30 pointer-events-auto cursor-pointer transition-all duration-300 whitespace-nowrap ${
                isActive ? "selected" : ""
              }`}
              style={{
                top: `${(labelY / 500) * 100}%`,
                left: `${(labelX / 800) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
              onClick={() => handleClick(d.code)}
              onMouseEnter={() => setHovered(d.code)}
              onMouseLeave={() => setHovered(null)}
            >
              {d.city}: {formatPax(d.passengers)}
            </div>
          );
        })}
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <button className="w-10 h-10 bg-surface-container-lowest rounded-t-lg shadow-md flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors border border-outline-variant border-b-0">
          <span className="material-symbols-outlined">add</span>
        </button>
        <button className="w-10 h-10 bg-surface-container-lowest rounded-b-lg shadow-md flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors border border-outline-variant">
          <span className="material-symbols-outlined">remove</span>
        </button>
      </div>
    </div>
  );
}
