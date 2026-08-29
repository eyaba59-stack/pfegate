"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";

const GoogleMapWidget = dynamic(() => import("./GoogleMapWidget"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#f2f4f6]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
    </div>
  ),
});

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

const BAR_COLORS: Record<string, string> = {
  "bg-secondary": "#00668a",
  "bg-secondary-container": "#40c2fd",
  "bg-tertiary-fixed-dim": "#b7c8e1",
  "bg-primary-fixed-dim": "#bec6e0",
  "bg-surface-variant": "#a0a4a8",
};

const REGION_FLAGS: Record<string, string> = {
  "France": "🇫🇷",
  "Belgique": "🇧🇪",
  "Allemagne": "🇩🇪",
  "Italie": "🇮🇹",
  "Suisse": "🇨🇭",
  "Turquie": "🇹🇷",
  "Égypte": "🇪🇬",
  "Émirats": "🇦🇪",
  "Qatar": "🇶🇦",
};

interface DestinationsPageClientProps {
  destinations: DestData[];
  allDestinations: DestData[];
}

export default function DestinationsPageClient({ destinations, allDestinations }: DestinationsPageClientProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [activeCountry, setActiveCountry] = useState<string>("Tous");

  const countries = useMemo(() => {
    const map = new Map<string, number>();
    allDestinations.forEach((d) => {
      map.set(d.country, (map.get(d.country) || 0) + 1);
    });
    return ["Tous", ...Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([c]) => c)];
  }, [allDestinations]);

  const filteredDestinations = useMemo(() => {
    if (activeCountry === "Tous") return allDestinations;
    return allDestinations.filter((d) => d.country === activeCountry);
  }, [allDestinations, activeCountry]);

  const maxPassengers = useMemo(
    () => Math.max(...filteredDestinations.map((d) => d.passengers), 1),
    [filteredDestinations]
  );

  const select = (code: string) => setSelected((prev) => (prev === code ? null : code));
  const reset = () => setSelected(null);

  const selectedDest = selected ? filteredDestinations.find((d) => d.code === selected) : null;

  return (
    <>
      {/* Map */}
      <div className="col-span-12 flex flex-col overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest shadow-[0px_4px_12px_rgba(15,23,42,0.03)] transition-colors duration-300 hover:border-secondary xl:col-span-8">
        <div className="relative z-10 flex items-center justify-between border-b border-surface-container bg-surface-container-lowest px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10">
              <span className="material-symbols-outlined text-secondary text-[18px]">map</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-on-surface">Carte des Lignes Aériennes</h3>
              <p className="text-[11px] text-on-surface-variant">MIR — Monastir International</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selected && (
              <button
                type="button"
                onClick={() => { reset(); }}
                className="rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-medium text-secondary transition-colors hover:bg-secondary/20"
              >
                Effacer sélection
              </button>
            )}
            <span className="rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-medium text-on-surface-variant">
              {filteredDestinations.length} destinations
            </span>
          </div>
        </div>

        <div className="h-[520px] w-full">
          <GoogleMapWidget
            destinations={filteredDestinations}
            selected={selected}
            activeCountry={activeCountry}
            onSelect={select}
          />
        </div>

        {/* Selected info bar */}
        {selectedDest && (
          <div className="border-t border-surface-container bg-surface-container-lowest/95 px-5 py-3 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-white">
                  {selectedDest.rank}
                </div>
                <div>
                  <span className="text-sm font-semibold text-on-surface">{selectedDest.city}</span>
                  <span className="ml-1.5 rounded bg-surface-container px-1.5 py-0.5 text-[10px] font-mono text-on-surface-variant">{selectedDest.code}</span>
                  <span className="ml-2 text-xs text-on-surface-variant">{selectedDest.country}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-secondary">{selectedDest.passengers.toLocaleString("fr-FR")}</span>
                <span className="ml-1 text-xs text-on-surface-variant">passagers</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="col-span-12 flex flex-col rounded-xl border border-surface-variant bg-surface-container-lowest shadow-[0px_4px_12px_rgba(15,23,42,0.03)] xl:col-span-4">
        {/* Region filter */}
        <div className="border-b border-surface-container p-4">
          <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">Régions</h4>
          <div className="flex flex-wrap gap-1.5">
            {countries.map((country) => {
              const count = country === "Tous" ? allDestinations.length : allDestinations.filter((d) => d.country === country).length;
              const isActive = activeCountry === country;
              return (
                <button
                  key={country}
                  type="button"
                  onClick={() => { setActiveCountry(country); setSelected(null); }}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-secondary text-on-secondary shadow-sm ring-1 ring-secondary/20"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
                  }`}
                >
                  {REGION_FLAGS[country] && <span className="text-[13px]">{REGION_FLAGS[country]}</span>}
                  {country}
                  <span className={`ml-0.5 text-[9px] ${isActive ? "text-on-secondary/70" : "text-on-surface-variant/60"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* List header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div>
            <h3 className="text-sm font-semibold text-on-surface">Destinations</h3>
            <p className="text-[11px] text-on-surface-variant">
              {activeCountry === "Tous" ? "Toutes les destinations" : activeCountry}
            </p>
          </div>
          {selected && (
            <button type="button" onClick={reset} className="text-[11px] font-medium text-secondary hover:text-secondary-container">
              Tout afficher
            </button>
          )}
        </div>

        {/* Destinations list */}
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-3" style={{ maxHeight: "calc(520px - 120px)" }}>
          {filteredDestinations.map((d) => {
            const isActive = selected === d.code;
            return (
              <div
                key={d.code}
                className={`group cursor-pointer rounded-lg border p-2.5 transition-all duration-150 ${
                  isActive
                    ? "border-secondary/30 bg-secondary/5 shadow-sm"
                    : "border-transparent hover:bg-surface-container"
                }`}
                style={{ opacity: selected && !isActive ? 0.35 : 1 }}
                onClick={() => select(d.code)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white transition-transform duration-150 group-hover:scale-110"
                      style={{ background: BAR_COLORS[d.barColor] || "#00668a" }}
                    >
                      {d.rank}
                    </div>
                    <div className="leading-tight">
                      <span className="block text-[13px] font-medium text-on-surface">{d.city}</span>
                      <span className="text-[10px] text-on-surface-variant">{d.code} · {d.country}</span>
                    </div>
                  </div>
                  <span className="text-right font-mono text-[11px] text-on-surface">
                    {d.passengers.toLocaleString("fr-FR")}
                    <span className="ml-0.5 text-[9px] text-on-surface-variant">pax</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-container">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(d.passengers / maxPassengers) * 100}%`,
                      background: BAR_COLORS[d.barColor] || "#00668a",
                    }}
                  />
                </div>
              </div>
            );
          })}

          {filteredDestinations.length === 0 && (
            <div className="py-10 text-center text-sm text-on-surface-variant">Aucune destination</div>
          )}
        </div>
      </div>
    </>
  );
}
