"use client";

import { useState } from "react";
import Icon from "@/presentation/components/ui/Icon";

interface DestData {
  rank: number;
  code: string;
  city: string;
  country: string;
  passengers: number;
  sharePercent: number;
  barColor: string;
}

/** Approximate SVG coordinates on the 800x500 map viewport for known airport codes. */
const SVG_COORDS: Record<string, { cx: number; cy: number; labelTop: number; labelLeft: number }> = {
  CDG: { cx: 250, cy: 120, labelTop: 90, labelLeft: 140 },
  LYS: { cx: 280, cy: 180, labelTop: 155, labelLeft: 185 },
  MRS: { cx: 320, cy: 230, labelTop: 205, labelLeft: 225 },
  NCE: { cx: 350, cy: 100, labelTop: 72, labelLeft: 360 },
  NTE: { cx: 200, cy: 130, labelTop: 105, labelLeft: 110 },
  TLS: { cx: 210, cy: 190, labelTop: 165, labelLeft: 120 },
  BOD: { cx: 170, cy: 180, labelTop: 155, labelLeft: 80 },
  BRU: { cx: 300, cy: 90, labelTop: 62, labelLeft: 280 },
  FRA: { cx: 360, cy: 80, labelTop: 52, labelLeft: 345 },
  DUS: { cx: 330, cy: 70, labelTop: 42, labelLeft: 310 },
  MXP: { cx: 340, cy: 170, labelTop: 145, labelLeft: 350 },
  GVA: { cx: 310, cy: 150, labelTop: 125, labelLeft: 295 },
  IST: { cx: 530, cy: 160, labelTop: 135, labelLeft: 545 },
  CAI: { cx: 530, cy: 330, labelTop: 305, labelLeft: 545 },
  DXB: { cx: 620, cy: 290, labelTop: 265, labelLeft: 635 },
  DOH: { cx: 650, cy: 280, labelTop: 255, labelLeft: 665 },
};

function getCoords(dest: DestData) {
  return SVG_COORDS[dest.code] ?? { cx: 400 + (dest.rank * 20) % 100, cy: 200 + (dest.rank * 30) % 120, labelTop: 180 + (dest.rank * 25) % 100, labelLeft: 420 };
}

const BAR_COLORS: Record<string, string> = {
  "bg-secondary": "#00668a",
  "bg-secondary-container": "#40c2fd",
  "bg-tertiary-fixed-dim": "#b7c8e1",
  "bg-primary-fixed-dim": "#bec6e0",
  "bg-surface-variant": "#e0e3e5",
};

interface DestinationsPageClientProps {
  destinations: DestData[];
}

export default function DestinationsPageClient({ destinations }: DestinationsPageClientProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const select = (code: string) => setSelected((prev) => (prev === code ? null : code));
  const reset = () => setSelected(null);

  const destsWithCoords = destinations.map((d) => ({ ...d, ...getCoords(d) }));

  return (
    <>
      {/* Map Widget */}
      <div className="col-span-12 flex flex-col overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest shadow-[0px_4px_12px_rgba(15,23,42,0.03)] transition-colors duration-300 hover:border-secondary group xl:col-span-8">
        <div className="relative z-10 flex items-center justify-between border-b border-surface-container bg-surface-container-lowest p-widget-padding">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Carte des Lignes (MIR)</h3>
          <div className="flex gap-2">
            <span className="rounded bg-surface-container px-2 py-1 font-label-caps text-label-caps text-on-surface-variant">Temps Réel</span>
          </div>
        </div>
        <div className="relative h-full flex-1 overflow-hidden border-t bg-[#f2f4f6]">
          {/* Base map */}
          <div className="absolute inset-0 overflow-hidden bg-[#e5e7eb]">
            <img
              alt="Detailed Vector Map Base"
              className="pointer-events-none h-full w-full object-cover opacity-40 mix-blend-multiply grayscale"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWjnrzvUlmLoXOlFF5D69RB8CsezgTepLCItGb5_Xk8M_9v61bj7wVKqr3q1zzxxyNXIUO0GWKZ1nVYRwp12Q0ETXxEp2cFCBIfDdEb9Q9G0JUdOI1k0qRzfnjMJs5nfmBMEx6rmbGgI_oGNIA_NVQmewo03RYg0IzmoCHCZMk-Od6GiufGiBoFWyqfye4ESw35S82zKFpusHL3oknACBvY7XcX7hiVWqr50R1AC7QCNZ8hk7Gp4mQWg"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent opacity-50" />
            <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 500">
              <g stroke="rgba(118, 119, 125, 0.1)" strokeWidth="1">
                {[100, 200, 300, 400].map((y) => (
                  <line key={`h${y}`} x1={0} x2={800} y1={y} y2={y} />
                ))}
                {[200, 400, 600].map((x) => (
                  <line key={`v${x}`} x1={x} x2={x} y1={0} y2={500} />
                ))}
              </g>
            </svg>
          </div>

          {/* Markers + Arcs */}
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

            {/* Monastir Hub */}
            <g className="pointer-events-none">
              <circle className="animate-ping" cx={400} cy={420} fill="rgba(0, 102, 138, 0.2)" r={16} />
              <circle cx={400} cy={420} fill="#00668a" filter="url(#marker-shadow)" r={8} stroke="#ffffff" strokeWidth={2} />
            </g>

            {/* Arcs */}
            {destsWithCoords.map((d) => (
              <path
                key={`arc-${d.code}`}
                d={`M${d.cx},${d.cy} Q${(d.cx + 400) / 2},${(d.cy + 420) / 2 - Math.abs(d.cx - 400) * 0.25 - 60} 400,420`}
                fill="none"
                stroke={selected === d.code ? "#40c2fd" : "rgba(64, 194, 253, 0.3)"}
                strokeWidth={selected === d.code ? 3 : 1.5}
                strokeDasharray={selected === d.code ? "none" : "6 4"}
                className="transition-all duration-300"
              />
            ))}

            {/* Destination markers */}
            {destsWithCoords.map((d) => (
              <g
                key={`marker-${d.code}`}
                className={`map-marker cursor-pointer transition-all duration-300 ${selected === d.code ? "selected" : ""}`}
                onClick={() => select(d.code)}
              >
                <circle
                  cx={d.cx}
                  cy={d.cy}
                  fill={selected === d.code ? "#40c2fd" : "#131b2e"}
                  filter="url(#marker-shadow)"
                  r={selected === d.code ? 7 : 5}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
              </g>
            ))}
          </svg>

          {/* Data Labels */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[410px] top-[430px] rounded border border-surface-variant bg-surface-container-lowest/90 px-2 py-1 text-body-sm font-bold text-on-surface shadow-sm backdrop-blur-sm">
              MIR (Monastir)
            </div>
            {destsWithCoords.map((d) => (
              <div
                key={`label-${d.code}`}
                className={`map-label pointer-events-auto absolute cursor-pointer rounded-lg border px-3 py-1.5 text-body-sm font-medium shadow-md backdrop-blur transition-all duration-300 ${
                  selected === d.code
                    ? "selected bg-secondary text-on-secondary shadow-lg"
                    : "border-outline-variant/30 bg-primary-container/95 text-on-primary"
                }`}
                style={{ top: d.labelTop, left: d.labelLeft }}
                onClick={() => select(d.code)}
              >
                {d.city}: {d.passengers.toLocaleString("fr-FR")}
              </div>
            ))}
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-t-lg border border-b-0 border-outline-variant bg-surface-container-lowest text-on-surface shadow-md transition-colors hover:bg-surface-variant">
              <Icon name="add" className="text-[20px]" />
            </button>
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-b-lg border border-outline-variant bg-surface-container-lowest text-on-surface shadow-md transition-colors hover:bg-surface-variant">
              <Icon name="remove" className="text-[20px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Destinations List */}
      <div className="col-span-12 flex flex-col rounded-xl border border-surface-variant bg-surface-container-lowest shadow-[0px_4px_12px_rgba(15,23,42,0.03)] xl:col-span-4">
        <div className="flex items-center justify-between border-b border-surface-container p-widget-padding">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Destinations</h3>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Volume de passagers (30 derniers jours)</p>
          </div>
          {selected && (
            <button
              type="button"
              onClick={reset}
              className="font-label-caps text-label-caps text-secondary transition-colors hover:text-on-secondary-container"
            >
              Réinitialiser
            </button>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-widget-padding" id="dest-list">
          {destsWithCoords.map((d) => (
            <div
              key={d.code}
              className={`dest-item cursor-pointer transition-all duration-300 ${
                selected === d.code ? "highlighted" : ""
              }`}
              style={{ opacity: selected && selected !== d.code ? 0.4 : 1 }}
              onClick={() => select(d.code)}
            >
              <div className="mb-2 flex items-end justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container font-body-sm font-bold text-on-surface">
                    {d.rank}
                  </div>
                  <div>
                    <span className="block font-body-lg font-medium text-on-surface">{d.city} ({d.code})</span>
                    <span className="font-label-caps text-label-caps text-on-surface-variant">{d.country}</span>
                  </div>
                </div>
                <span className="font-data-mono text-data-mono text-on-surface">
                  {d.passengers.toLocaleString("fr-FR")} <span className="font-body-sm text-on-surface-variant">pax</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${d.barColor}`}
                  style={{ width: `${d.sharePercent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
