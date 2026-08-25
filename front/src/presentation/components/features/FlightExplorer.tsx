"use client";

import { useMemo, useState } from "react";
import type { Flight } from "@/core/domain/entities/Flight";
import FlightDataTable from "@/presentation/components/widgets/FlightDataTable";
import Icon from "@/presentation/components/ui/Icon";
import { API_BASE_URL } from "@/config/api";

interface FlightExplorerProps {
  flights: Flight[];
}

interface Filters {
  flightNumber: string;
  airlineCode: string;
  status: string;
}

export default function FlightExplorer({ flights }: FlightExplorerProps) {
  const [filters, setFilters] = useState<Filters>({ flightNumber: "", airlineCode: "", status: "" });

  const filtered = useMemo(() => {
    const q = filters.flightNumber.trim().toUpperCase();
    return flights.filter((f) => {
      if (q && !f.flightNumber.toUpperCase().includes(q)) return false;
      if (filters.airlineCode && f.airline.code !== filters.airlineCode) return false;
      if (filters.status && f.status !== filters.status) return false;
      return true;
    });
  }, [flights, filters]);

  const set = (key: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 card-shadow">
        <div className="flex flex-1 flex-wrap gap-4">
          <div className="flex min-w-[200px] flex-col gap-1.5">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Recherche de vol</label>
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                flight
              </span>
              <input
                type="text"
                placeholder="Ex: TU712"
                value={filters.flightNumber}
                onChange={set("flightNumber")}
                className="w-full rounded border border-outline-variant bg-surface py-2 pl-9 pr-3 font-data-mono text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary"
              />
            </div>
          </div>

          <div className="flex min-w-[200px] flex-col gap-1.5">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Compagnie</label>
            <div className="relative">
              <select
                value={filters.airlineCode}
                onChange={set("airlineCode")}
                className="w-full appearance-none rounded border border-outline-variant bg-surface py-2 pl-3 pr-10 font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary"
              >
                <option value="">Toutes les compagnies</option>
                {Array.from(new Set(flights.map((f) => f.airline.code))).map((code) => (
                  <option key={code} value={code}>
                    {flights.find((f) => f.airline.code === code)?.airline.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                arrow_drop_down
              </span>
            </div>
          </div>

          <div className="flex min-w-[150px] flex-col gap-1.5">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Statut</label>
            <div className="relative">
              <select
                value={filters.status}
                onChange={set("status")}
                className="w-full appearance-none rounded border border-outline-variant bg-surface py-2 pl-3 pr-10 font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary"
              >
                <option value="">Tous</option>
                <option value="ON_TIME">À l'heure</option>
                <option value="DELAYED">Retardé</option>
                <option value="CANCELLED">Annulé</option>
                <option value="BOARDING">Embarquement</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                arrow_drop_down
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => window.open(`${API_BASE_URL}/api/bi/export/flights`, "_blank")}
            className="flex items-center gap-2 rounded border border-outline-variant bg-surface-container-high px-4 py-2 font-body-md text-body-md font-medium text-on-surface transition-colors hover:bg-surface-variant"
          >
            <Icon name="download" className="text-sm" />
            Exporter (CSV/Excel)
          </button>
          <button
            type="button"
            onClick={() => setFilters({ flightNumber: "", airlineCode: "", status: "" })}
            className="flex items-center gap-2 rounded bg-surface-container px-4 py-2 font-body-md text-body-md font-medium text-on-surface shadow-sm transition-colors hover:bg-surface-variant"
          >
            <Icon name="restart_alt" className="text-sm" />
            Réinitialiser
          </button>
        </div>
      </div>

      <FlightDataTable flights={filtered} />
    </div>
  );
}
