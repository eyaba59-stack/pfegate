"use client";

import { useMemo, useState } from "react";
import type { Flight } from "@/core/domain/entities/Flight";
import { FlightType } from "@/core/domain/entities/Flight";
import StatusBadge from "@/presentation/components/ui/StatusBadge";
import Pagination from "@/presentation/components/ui/Pagination";

interface FlightDataTableProps {
  flights: Flight[];
  pageSize?: number;
}

/**
 * Full operational flight list with client-side pagination.
 */
export default function FlightDataTable({ flights, pageSize = 5 }: FlightDataTableProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(flights.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageRows = useMemo(
    () => flights.slice((safePage - 1) * pageSize, safePage * pageSize),
    [flights, safePage, pageSize]
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest card-shadow">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low">
              <th className="whitespace-nowrap px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">N° Vol</th>
              <th className="whitespace-nowrap px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">Compagnie</th>
              <th className="whitespace-nowrap px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">Type</th>
              <th className="whitespace-nowrap px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">Origine</th>
              <th className="whitespace-nowrap px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">Destination</th>
              <th className="whitespace-nowrap px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">Heure Prévue</th>
              <th className="whitespace-nowrap px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">Heure Réelle</th>
              <th className="whitespace-nowrap px-4 py-3 font-label-caps text-label-caps text-on-surface-variant">Statut</th>
              <th className="whitespace-nowrap px-4 py-3 text-right font-label-caps text-label-caps text-on-surface-variant">Retard</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50 font-body-md text-body-md">
            {pageRows.map((f) => (
              <tr key={f.id} className="group cursor-pointer transition-colors hover:bg-surface-container-low/50">
                <td className="px-4 py-3 font-data-mono text-data-mono font-semibold text-on-surface group-hover:text-secondary">
                  {f.flightNumber}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-container-high text-[10px] font-bold text-on-surface-variant">
                      {f.airline.code}
                    </div>
                    <span>{f.airline.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-on-surface-variant">
                  {f.type === FlightType.ARRIVAL ? "Arrivée" : "Départ"}
                </td>
                <td className="px-4 py-3 font-medium">{f.origin}</td>
                <td className="px-4 py-3 font-medium">{f.destination}</td>
                <td className="px-4 py-3 font-data-mono text-data-mono text-on-surface-variant">
                  <span className={f.status === "CANCELLED" ? "line-through" : ""}>{f.scheduledTime}</span>
                </td>
                <td className="px-4 py-3 font-data-mono text-data-mono">
                  {f.status === "DELAYED" ? (
                    <span className="font-semibold text-error">{f.actualTime}</span>
                  ) : (
                    <span className="text-on-surface-variant">{f.actualTime ?? "-"}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={f.status} />
                </td>
                <td className="px-4 py-3 text-right font-data-mono text-data-mono">
                  {f.delayMinutes ? (
                    <span className="font-semibold text-error">+{f.delayMinutes} min</span>
                  ) : (
                    <span className="text-on-surface-variant">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col justify-between gap-3 border-t border-outline-variant bg-surface-container-lowest p-4 sm:flex-row sm:items-center">
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          Affichage {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, flights.length)} sur{" "}
          {flights.length} vols
        </span>
        <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
