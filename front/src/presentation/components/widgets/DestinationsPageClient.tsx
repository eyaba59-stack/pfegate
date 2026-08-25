"use client";

import { useState, useMemo } from "react";

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

const MONASTIR: [number, number] = [35.7581, 10.7545];

function toMercY(lat: number): number {
  const rad = (lat * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

function project(
  lat: number,
  lng: number,
  projBounds: { xMin: number; xMax: number; yMin: number; yMax: number },
  svgW: number,
  svgH: number,
  pad: number
): [number, number] {
  const xNorm = (lng - projBounds.xMin) / (projBounds.xMax - projBounds.xMin);
  const yNorm = (toMercY(lat) - projBounds.yMin) / (projBounds.yMax - projBounds.yMin);
  const x = pad + xNorm * (svgW - 2 * pad);
  const y = pad + (1 - yNorm) * (svgH - 2 * pad);
  return [x, y];
}

function computeProjBounds(dests: [number, number][]) {
  const allLngs = dests.map((d) => d[1]);
  const allMercY = dests.map((d) => toMercY(d[0]));
  const padLng = (Math.max(...allLngs) - Math.min(...allLngs)) * 0.12 || 5;
  const padY = (Math.max(...allMercY) - Math.min(...allMercY)) * 0.12 || 0.5;
  return {
    xMin: Math.min(...allLngs) - padLng,
    xMax: Math.max(...allLngs) + padLng,
    yMin: Math.min(...allMercY) - padY,
    yMax: Math.max(...allMercY) + padY,
  };
}

const BAR_COLORS: Record<string, string> = {
  "bg-secondary": "#00668a",
  "bg-secondary-container": "#40c2fd",
  "bg-tertiary-fixed-dim": "#b7c8e1",
  "bg-primary-fixed-dim": "#bec6e0",
  "bg-surface-variant": "#a0a4a8",
};

interface DestinationsPageClientProps {
  destinations: DestData[];
  allDestinations: DestData[];
}

export default function DestinationsPageClient({ destinations, allDestinations }: DestinationsPageClientProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [activeCountry, setActiveCountry] = useState<string>("Tous");
  const [hovered, setHovered] = useState<string | null>(null);

  const countries = useMemo(() => {
    const set = new Set(allDestinations.map((d) => d.country));
    return ["Tous", ...Array.from(set).sort()];
  }, [allDestinations]);

  const filteredDestinations = useMemo(() => {
    if (activeCountry === "Tous") return allDestinations;
    return allDestinations.filter((d) => d.country === activeCountry);
  }, [allDestinations, activeCountry]);

  const validDests = useMemo(
    () => filteredDestinations.filter((d) => d.lat !== 0 && d.lng !== 0),
    [filteredDestinations]
  );

  const svgW = 800;
  const svgH = 500;
  const pad = 50;

  const projBounds = useMemo(() => {
    const coords: [number, number][] = [...validDests.map((d) => [d.lat, d.lng] as [number, number]), MONASTIR];
    return computeProjBounds(coords);
  }, [validDests]);

  const hubXY = useMemo(
    () => project(MONASTIR[0], MONASTIR[1], projBounds, svgW, svgH, pad),
    [projBounds]
  );

  const points = useMemo(
    () =>
      validDests.map((d) => ({
        ...d,
        xy: project(d.lat, d.lng, projBounds, svgW, svgH, pad),
      })),
    [validDests, projBounds]
  );

  const maxPassengers = useMemo(
    () => Math.max(...filteredDestinations.map((d) => d.passengers), 1),
    [filteredDestinations]
  );

  const select = (code: string) => setSelected((prev) => (prev === code ? null : code));
  const reset = () => setSelected(null);

  const selectedDest = selected ? points.find((d) => d.code === selected) : null;

  return (
    <>
      {/* Map Widget */}
      <div className="col-span-12 flex flex-col overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest shadow-[0px_4px_12px_rgba(15,23,42,0.03)] transition-colors duration-300 hover:border-secondary xl:col-span-8">
        <div className="relative z-10 flex items-center justify-between border-b border-surface-container bg-surface-container-lowest p-widget-padding">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Carte des Lignes (MIR)</h3>
          <div className="flex items-center gap-2">
            {selected && (
              <button type="button" onClick={reset} className="font-label-caps text-label-caps text-secondary transition-colors hover:text-on-secondary-container">
                Réinitialiser
              </button>
            )}
            <span className="rounded bg-surface-container px-2 py-1 font-label-caps text-label-caps text-on-surface-variant">
              {filteredDestinations.length} destinations
            </span>
          </div>
        </div>

        <div className="relative w-full overflow-hidden bg-[#f2f4f6]" style={{ aspectRatio: "16 / 10" }}>
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="marker-shadow">
                <feDropShadow dx="0" dy="1" floodColor="#000" floodOpacity="0.3" stdDeviation="2" />
              </filter>
            </defs>

            {/* Grid lines */}
            <g stroke="rgba(118,119,125,0.07)" strokeWidth="0.5" strokeDasharray="4 6">
              {[0.2, 0.4, 0.6, 0.8].map((f) => (
                <line key={`h${f}`} x1={pad} x2={svgW - pad} y1={pad + (svgH - 2 * pad) * f} y2={pad + (svgH - 2 * pad) * f} />
              ))}
              {[0.2, 0.4, 0.6, 0.8].map((f) => (
                <line key={`v${f}`} x1={pad + (svgW - 2 * pad) * f} x2={pad + (svgW - 2 * pad) * f} y1={pad} y2={svgH - pad} />
              ))}
            </g>

            {/* Polylines */}
            {points.map((d) => {
              const isActive = selected === d.code || hovered === d.code;
              const dimmed = selected && selected !== d.code;
              const midX = (d.xy[0] + hubXY[0]) / 2;
              const midY = (d.xy[1] + hubXY[1]) / 2 - Math.abs(d.xy[0] - hubXY[0]) * 0.18 - 25;
              return (
                <path
                  key={`arc-${d.code}`}
                  d={`M${d.xy[0]},${d.xy[1]} Q${midX},${midY} ${hubXY[0]},${hubXY[1]}`}
                  fill="none"
                  stroke={isActive ? "#00668a" : "#40c2fd"}
                  strokeWidth={isActive ? 2.5 : 1.2}
                  opacity={dimmed ? 0.15 : isActive ? 1 : 0.45}
                  strokeDasharray={isActive ? "none" : "5 4"}
                  className="pointer-events-auto cursor-pointer transition-all duration-200"
                  onClick={() => select(d.code)}
                  onMouseEnter={() => setHovered(d.code)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}

            {/* Hub marker */}
            <circle cx={hubXY[0]} cy={hubXY[1]} r={14} fill="rgba(0,102,138,0.15)" className="animate-pulse" />
            <circle cx={hubXY[0]} cy={hubXY[1]} r={7} fill="#00668a" filter="url(#marker-shadow)" stroke="#fff" strokeWidth={2} />

            {/* Destination markers */}
            {points.map((d) => {
              const isActive = selected === d.code;
              const dimmed = selected && !isActive;
              const r = isActive ? 6 : 4.5;
              return (
                <g
                  key={`mk-${d.code}`}
                  className="pointer-events-auto cursor-pointer"
                  onClick={() => select(d.code)}
                  onMouseEnter={() => setHovered(d.code)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <circle cx={d.xy[0]} cy={d.xy[1]} r={r + 6} fill="transparent" />
                  <circle
                    cx={d.xy[0]}
                    cy={d.xy[1]}
                    r={r}
                    fill={isActive ? "#40c2fd" : "#131b2e"}
                    filter="url(#marker-shadow)"
                    stroke="#fff"
                    strokeWidth={1.5}
                    opacity={dimmed ? 0.2 : 1}
                    className="transition-all duration-200"
                  />
                </g>
              );
            })}
          </svg>

          {/* Labels overlay */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute rounded border border-surface-variant bg-surface-container-lowest/90 px-2 py-1 text-[11px] font-bold text-on-surface shadow-sm backdrop-blur-sm"
              style={{ left: `${(hubXY[0] / svgW) * 100}%`, top: `${(hubXY[1] / svgH) * 100}%`, transform: "translate(10px, 4px)" }}
            >
              MIR
            </div>
            {points.map((d) => {
              const isActive = selected === d.code || hovered === d.code;
              const dimmed = selected && selected !== d.code;
              return (
                <div
                  key={`lbl-${d.code}`}
                  className="pointer-events-auto absolute cursor-pointer rounded border px-2 py-0.5 text-[10px] font-medium shadow-sm backdrop-blur transition-all duration-200"
                  style={{
                    left: `${(d.xy[0] / svgW) * 100}%`,
                    top: `${(d.xy[1] / svgH) * 100}%`,
                    transform: "translate(8px, -14px)",
                    background: isActive ? "#00668a" : "rgba(255,255,255,0.92)",
                    color: isActive ? "#fff" : "#131b2e",
                    borderColor: isActive ? "#00668a" : "rgba(0,0,0,0.08)",
                    opacity: dimmed ? 0.15 : 1,
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => select(d.code)}
                  onMouseEnter={() => setHovered(d.code)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {d.city}
                </div>
              );
            })}
          </div>

          {/* Info overlay */}
          {selectedDest && (
            <div className="absolute bottom-3 left-3 z-10 rounded-lg border border-outline-variant bg-surface-container-lowest/95 px-4 py-3 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-on-secondary text-xs font-bold">
                  {selectedDest.rank}
                </div>
                <div>
                  <p className="text-sm font-medium text-on-surface">{selectedDest.city} ({selectedDest.code})</p>
                  <p className="text-xs text-on-surface-variant">{selectedDest.country}</p>
                  <p className="text-sm font-semibold text-secondary">
                    {selectedDest.passengers.toLocaleString("fr-FR")} pax
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="col-span-12 flex flex-col rounded-xl border border-surface-variant bg-surface-container-lowest shadow-[0px_4px_12px_rgba(15,23,42,0.03)] xl:col-span-4">
        <div className="border-b border-surface-container p-widget-padding">
          <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-3">Filtrer par Pays</h4>
          <div className="flex flex-wrap gap-2">
            {countries.map((country) => {
              const count = country === "Tous" ? allDestinations.length : allDestinations.filter((d) => d.country === country).length;
              return (
                <button
                  key={country}
                  type="button"
                  onClick={() => { setActiveCountry(country); setSelected(null); }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    activeCountry === country
                      ? "bg-secondary text-on-secondary shadow-sm"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-variant"
                  }`}
                >
                  {country} <span className="ml-1 opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between p-widget-padding pb-2">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Destinations</h3>
            <p className="mt-1 text-xs text-on-surface-variant">
              {activeCountry === "Tous" ? "Toutes les destinations" : activeCountry} — Volume de passagers
            </p>
          </div>
          {selected && (
            <button type="button" onClick={reset} className="text-xs font-medium text-secondary hover:text-secondary-container">
              Réinitialiser
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-widget-padding pb-widget-padding">
          {filteredDestinations.map((d) => (
            <div
              key={d.code}
              className={`cursor-pointer rounded-lg border p-3 transition-all duration-200 ${
                selected === d.code
                  ? "border-secondary bg-secondary/5 shadow-sm"
                  : "border-transparent hover:bg-surface-container"
              }`}
              style={{ opacity: selected && selected !== d.code ? 0.4 : 1 }}
              onClick={() => select(d.code)}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: BAR_COLORS[d.barColor] || "#00668a" }}
                  >
                    {d.rank}
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-on-surface">{d.city} ({d.code})</span>
                    <span className="text-[10px] uppercase text-on-surface-variant">{d.country}</span>
                  </div>
                </div>
                <span className="font-mono text-xs text-on-surface">
                  {d.passengers.toLocaleString("fr-FR")} <span className="text-on-surface-variant">pax</span>
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(d.passengers / maxPassengers) * 100}%`,
                    background: BAR_COLORS[d.barColor] || "#00668a",
                  }}
                />
              </div>
            </div>
          ))}

          {filteredDestinations.length === 0 && (
            <div className="py-8 text-center text-sm text-on-surface-variant">
              Aucune destination pour ce pays.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
