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

const MONASTIR = { lat: 35.7581, lng: 10.7545 };

function latLngToXY(lat: number, lng: number, bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }, width: number, height: number): [number, number] {
  const { minLat, maxLat, minLng, maxLng } = bounds;
  const x = ((lng - minLng) / (maxLng - minLng)) * (width - 80) + 40;
  const y = ((maxLat - lat) / (maxLat - minLat)) * (height - 80) + 40;
  return [x, y];
}

function computeBounds(destinations: DestData[]) {
  const allLats = [...destinations.map((d) => d.lat), MONASTIR.lat];
  const allLngs = [...destinations.map((d) => d.lng), MONASTIR.lng];
  const minLat = Math.min(...allLats) - 3;
  const maxLat = Math.max(...allLats) + 3;
  const minLng = Math.min(...allLngs) - 3;
  const maxLng = Math.max(...allLngs) + 3;
  return { minLat, maxLat, minLng, maxLng };
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
    () => filteredDestinations.filter((d) => d.lat && d.lng),
    [filteredDestinations]
  );

  const bounds = useMemo(() => computeBounds(validDests), [validDests]);

  const mapW = 800;
  const mapH = 500;

  const hub = latLngToXY(MONASTIR.lat, MONASTIR.lng, bounds, mapW, mapH);

  const points = useMemo(
    () =>
      validDests.map((d) => ({
        ...d,
        xy: latLngToXY(d.lat, d.lng, bounds, mapW, mapH),
      })),
    [validDests, bounds]
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

        <div className="relative w-full overflow-hidden bg-[#f2f4f6]" style={{ aspectRatio: `${mapW}/${mapH}` }}>
          {/* Grid */}
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${mapW} ${mapH}`} preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="glow">
                <feGaussianBlur result="blur" stdDeviation="2" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="marker-shadow">
                <feDropShadow dx="0" dy="2" floodColor="#000000" floodOpacity="0.3" stdDeviation="2" />
              </filter>
            </defs>

            {/* Background grid */}
            <g stroke="rgba(118,119,125,0.08)" strokeWidth="1">
              {[0.25, 0.5, 0.75].map((f) => (
                <line key={`h${f}`} x1={0} x2={mapW} y1={mapH * f} y2={mapH * f} />
              ))}
              {[0.25, 0.5, 0.75].map((f) => (
                <line key={`v${f}`} x1={mapW * f} x2={mapW * f} y1={0} y2={mapH} />
              ))}
            </g>

            {/* Polylines */}
            {points.map((d) => {
              const isActive = selected === d.code || hovered === d.code;
              const midX = (d.xy[0] + hub[0]) / 2;
              const midY = (d.xy[1] + hub[1]) / 2 - Math.abs(d.xy[0] - hub[0]) * 0.15 - 30;
              return (
                <path
                  key={`arc-${d.code}`}
                  d={`M${d.xy[0]},${d.xy[1]} Q${midX},${midY} ${hub[0]},${hub[1]}`}
                  fill="none"
                  stroke={isActive ? "#00668a" : "#40c2fd"}
                  strokeWidth={isActive ? 3 : 1.5}
                  opacity={selected && selected !== d.code ? 0.2 : isActive ? 1 : 0.5}
                  strokeDasharray={isActive ? "none" : "6 4"}
                  className="pointer-events-auto cursor-pointer transition-all duration-200"
                  onClick={() => select(d.code)}
                  onMouseEnter={() => setHovered(d.code)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}

            {/* Hub */}
            <g className="pointer-events-none">
              <circle className="animate-ping" cx={hub[0]} cy={hub[1]} fill="rgba(0,102,138,0.2)" r={16} />
              <circle cx={hub[0]} cy={hub[1]} fill="#00668a" filter="url(#marker-shadow)" r={8} stroke="#fff" strokeWidth={2} />
            </g>

            {/* Markers */}
            {points.map((d) => {
              const isActive = selected === d.code;
              const r = isActive ? 7 : 5;
              return (
                <g
                  key={`mk-${d.code}`}
                  className="pointer-events-auto cursor-pointer"
                  onClick={() => select(d.code)}
                  onMouseEnter={() => setHovered(d.code)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <circle cx={d.xy[0]} cy={d.xy[1]} r={r + 4} fill="transparent" />
                  <circle
                    cx={d.xy[0]}
                    cy={d.xy[1]}
                    r={r}
                    fill={isActive ? "#40c2fd" : "#131b2e"}
                    filter="url(#marker-shadow)"
                    stroke="#fff"
                    strokeWidth={1.5}
                    opacity={selected && !isActive ? 0.3 : 1}
                    className="transition-all duration-200"
                  />
                </g>
              );
            })}
          </svg>

          {/* Labels */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute rounded border border-surface-variant bg-surface-container-lowest/90 px-2 py-1 text-body-sm font-bold text-on-surface shadow-sm backdrop-blur-sm" style={{ left: hub[0] + 10, top: hub[1] + 5, transform: "translateX(5px)" }}>
              MIR (Monastir)
            </div>
            {points.map((d) => {
              const isActive = selected === d.code || hovered === d.code;
              return (
                <div
                  key={`lbl-${d.code}`}
                  className="pointer-events-auto absolute cursor-pointer rounded-md border px-2 py-1 text-[11px] font-medium shadow-md backdrop-blur transition-all duration-200"
                  style={{
                    left: d.xy[0] + 8,
                    top: d.xy[1] - 12,
                    background: isActive ? "#00668a" : "rgba(255,255,255,0.92)",
                    color: isActive ? "#fff" : "#131b2e",
                    borderColor: isActive ? "#00668a" : "rgba(0,0,0,0.08)",
                    opacity: selected && selected !== d.code ? 0.25 : 1,
                  }}
                  onClick={() => select(d.code)}
                  onMouseEnter={() => setHovered(d.code)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {d.city}: {d.passengers.toLocaleString("fr-FR")}
                </div>
              );
            })}
          </div>

          {/* Info overlay */}
          {selectedDest && (
            <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-outline-variant bg-surface-container-lowest/95 px-4 py-3 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-on-secondary font-body-sm font-bold">
                  {selectedDest.rank}
                </div>
                <div>
                  <p className="font-body-lg font-medium text-on-surface">{selectedDest.city} ({selectedDest.code})</p>
                  <p className="font-body-sm text-on-surface-variant">{selectedDest.country}</p>
                  <p className="font-data-mono text-data-mono text-secondary font-semibold">
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
        {/* Country Filter */}
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
                  className={`rounded-full px-3 py-1.5 text-body-sm font-medium transition-all duration-200 ${
                    activeCountry === country
                      ? "bg-secondary text-on-secondary shadow-sm"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-variant"
                  }`}
                >
                  {country} <span className="ml-1 text-[11px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* List Header */}
        <div className="flex items-center justify-between p-widget-padding pb-2">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Destinations</h3>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              {activeCountry === "Tous" ? "Toutes les destinations" : activeCountry} — Volume de passagers
            </p>
          </div>
          {selected && (
            <button type="button" onClick={reset} className="font-label-caps text-label-caps text-secondary transition-colors hover:text-on-secondary-container">
              Réinitialiser
            </button>
          )}
        </div>

        {/* List */}
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
                    className="flex h-7 w-7 items-center justify-center rounded-full font-body-sm font-bold"
                    style={{ background: BAR_COLORS[d.barColor] || "#00668a", color: "#fff" }}
                  >
                    {d.rank}
                  </div>
                  <div>
                    <span className="block font-body-md font-medium text-on-surface">{d.city} ({d.code})</span>
                    <span className="font-label-caps text-label-caps text-on-surface-variant">{d.country}</span>
                  </div>
                </div>
                <span className="font-data-mono text-data-mono text-on-surface">
                  {d.passengers.toLocaleString("fr-FR")} <span className="font-body-sm text-on-surface-variant">pax</span>
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
            <div className="py-8 text-center font-body-sm text-on-surface-variant">
              Aucune destination pour ce pays.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
