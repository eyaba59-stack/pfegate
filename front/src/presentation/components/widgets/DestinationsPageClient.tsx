"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";

const DestinationsBarChart = dynamic(() => import("./DestinationsBarChart"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] items-center justify-center bg-surface-container-lowest rounded-xl">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
    </div>
  ),
});

const DestinationsPieChart = dynamic(() => import("./DestinationsPieChart"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center bg-surface-container-lowest rounded-xl">
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

const REGION_FLAGS: Record<string, string> = {
  France: "\u{1F1EB}\u{1F1F7}",
  Belgique: "\u{1F1E7}\u{1F1EA}",
  Allemagne: "\u{1F1E9}\u{1F1EA}",
  Italie: "\u{1F1EE}\u{1F1F9}",
  Suisse: "\u{1F1E8}\u{1F1ED}",
  Turquie: "\u{1F1F9}\u{1F1F7}",
  "\u00c9gypte": "\u{1F1EA}\u{1F1EC}",
  "\u00c9mirats": "\u{1F1E6}\u{1F1EA}",
  Qatar: "\u{1F1F6}\u{1F1E6}",
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
    allDestinations.forEach((d) => map.set(d.country, (map.get(d.country) || 0) + 1));
    return ["Tous", ...Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([c]) => c)];
  }, [allDestinations]);

  const filteredDestinations = useMemo(() => {
    const list = activeCountry === "Tous" ? allDestinations : allDestinations.filter((d) => d.country === activeCountry);
    return [...list].sort((a, b) => b.passengers - a.passengers);
  }, [allDestinations, activeCountry]);

  const totalPax = useMemo(() => filteredDestinations.reduce((s, d) => s + d.passengers, 0), [filteredDestinations]);

  const selectedDest = selected ? filteredDestinations.find((d) => d.code === selected) : null;

  return (
    <>
      {/* Bar Chart */}
      <div className="col-span-12 flex flex-col overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest shadow-[0px_4px_12px_rgba(15,23,42,0.03)] transition-colors duration-300 hover:border-secondary xl:col-span-8">
        <div className="flex items-center justify-between border-b border-surface-container px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10">
              <span className="material-symbols-outlined text-secondary text-[18px]">bar_chart</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-on-surface">Volume par Destination</h3>
              <p className="text-[11px] text-on-surface-variant">Passagers \u2014 30 derniers jours</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selected && (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-medium text-secondary transition-colors hover:bg-secondary/20"
              >
                Effacer
              </button>
            )}
            <span className="rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-medium text-on-surface-variant">
              {filteredDestinations.length} destinations
            </span>
          </div>
        </div>

        <div className="p-4">
          <DestinationsBarChart
            destinations={filteredDestinations}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

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
                <span className="ml-1 text-xs text-on-surface-variant">pax ({selectedDest.sharePercent}%)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="col-span-12 flex flex-col rounded-xl border border-surface-variant bg-surface-container-lowest shadow-[0px_4px_12px_rgba(15,23,42,0.03)] xl:col-span-4">
        {/* Region filter */}
        <div className="border-b border-surface-container p-4">
          <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">R\u00e9gions</h4>
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

        {/* Pie chart */}
        <div className="border-b border-surface-container p-4">
          <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">R\u00e9partition</h4>
          <DestinationsPieChart
            destinations={filteredDestinations}
            selected={selected}
            onSelect={setSelected}
          />
          <p className="mt-2 text-center text-[11px] font-medium text-on-surface-variant">
            Total: <span className="font-bold text-on-surface">{totalPax.toLocaleString("fr-FR")}</span> passagers
          </p>
        </div>

        {/* List header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h3 className="text-sm font-semibold text-on-surface">Destinations</h3>
          {selected && (
            <button type="button" onClick={() => setSelected(null)} className="text-[11px] font-medium text-secondary hover:text-secondary-container">
              Tout afficher
            </button>
          )}
        </div>

        {/* List */}
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-3" style={{ maxHeight: 280 }}>
          {filteredDestinations.map((d) => {
            const isActive = selected === d.code;
            const maxPax = filteredDestinations[0]?.passengers || 1;
            return (
              <div
                key={d.code}
                className={`group cursor-pointer rounded-lg border p-2.5 transition-all duration-150 ${
                  isActive
                    ? "border-secondary/30 bg-secondary/5 shadow-sm"
                    : "border-transparent hover:bg-surface-container"
                }`}
                style={{ opacity: selected && !isActive ? 0.35 : 1 }}
                onClick={() => setSelected(isActive ? null : d.code)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white transition-transform duration-150 group-hover:scale-110"
                      style={{ background: getRankColor(d.rank) }}
                    >
                      {d.rank}
                    </div>
                    <div className="leading-tight">
                      <span className="block text-[13px] font-medium text-on-surface">{d.city}</span>
                      <span className="text-[10px] text-on-surface-variant">{d.code} \u00b7 {d.country}</span>
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
                      width: `${(d.passengers / maxPax) * 100}%`,
                      background: getRankColor(d.rank),
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function getRankColor(rank: number): string {
  const colors = ["#00668a", "#40c2fd", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f43f5e", "#f97316", "#eab308"];
  return colors[(rank - 1) % colors.length];
}
