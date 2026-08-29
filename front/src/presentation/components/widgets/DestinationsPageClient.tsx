"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { Destination, RegionTraffic } from "@/core/domain/entities/Destination";
import RegionTrafficChart from "./RegionTrafficChart";

const DestinationMap = dynamic(() => import("./DestinationMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-surface-container-low">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
    </div>
  ),
});

interface DestinationsPageClientProps {
  destinations: Destination[];
  allDestinations: Destination[];
  trafficByRegion: RegionTraffic[];
}

export default function DestinationsPageClient({ destinations, allDestinations, trafficByRegion }: DestinationsPageClientProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const sortedAll = useMemo(
    () => [...allDestinations].sort((a, b) => b.passengers - a.passengers),
    [allDestinations]
  );

  const top5 = sortedAll.slice(0, 5);
  const maxPax = top5[0]?.passengers || 1;

  const formatPax = (n: number) => n.toLocaleString("fr-FR");

  return (
    <>
      {/* Row 1: Map (8 cols) + Top 5 List (4 cols) */}
      <div className="col-span-12 xl:col-span-8 bg-surface-container-lowest border border-surface-variant rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.03)] flex flex-col h-[500px] overflow-hidden group hover:border-secondary transition-colors duration-300">
        <div className="p-widget-padding border-b border-surface-container flex justify-between items-center bg-surface-container-lowest z-10">
          <h3 className="text-headline-sm font-headline-sm text-on-surface">Carte des Lignes (MIR)</h3>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-surface-container text-on-surface-variant rounded text-label-caps font-label-caps">Temps Réel</span>
          </div>
        </div>
        <DestinationMap destinations={sortedAll} selected={selected} onSelect={setSelected} />
      </div>

      <div className="col-span-12 xl:col-span-4 bg-surface-container-lowest border border-surface-variant rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.03)] flex flex-col h-[500px]">
        <div className="p-widget-padding border-b border-surface-container">
          <h3 className="text-headline-sm font-headline-sm text-on-surface">Top 5 Destinations</h3>
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Volume de passagers (30 derniers jours)</p>
        </div>
        <div className="p-widget-padding flex-1 flex flex-col gap-6 overflow-y-auto">
          {top5.map((d) => {
            const pctWidth = Math.round((d.passengers / maxPax) * 100);
            return (
              <div key={d.code}>
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface font-bold text-body-sm">
                      {d.rank}
                    </div>
                    <div>
                      <span className="text-body-lg font-body-lg font-medium text-on-surface block">{d.city} ({d.code})</span>
                      <span className="text-label-caps font-label-caps text-on-surface-variant">{d.country}</span>
                    </div>
                  </div>
                  <span className="text-data-mono font-data-mono text-on-surface">
                    {formatPax(d.passengers)} <span className="text-body-sm font-body-sm text-on-surface-variant">pax</span>
                  </span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div
                    className={`${getBarColor(d.rank)} h-full rounded-full`}
                    style={{ width: `${pctWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 2: Traffic Evolution Chart (12 cols) */}
      <div className="col-span-12 bg-surface-container-lowest border border-surface-variant rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.03)] p-widget-padding">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-headline-sm font-headline-sm text-on-surface">Évolution du Trafic par Région</h3>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Comparaison trimestrielle des volumes (Vols)</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-secondary"></div>
              <span className="text-label-caps font-label-caps text-on-surface-variant">Q1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-secondary-container"></div>
              <span className="text-label-caps font-label-caps text-on-surface-variant">Q2</span>
            </div>
          </div>
        </div>
        {trafficByRegion.length > 0 ? (
          <RegionTrafficChart data={trafficByRegion} />
        ) : (
          <div className="flex h-64 items-center justify-center text-on-surface-variant">
            Aucune donnée de trafic par région disponible.
          </div>
        )}
      </div>
    </>
  );
}

function getBarColor(rank: number): string {
  const colors = ["bg-secondary", "bg-secondary-container", "bg-tertiary-fixed-dim", "bg-primary-fixed-dim", "bg-surface-variant"];
  return colors[(rank - 1) % colors.length] || "bg-secondary";
}
