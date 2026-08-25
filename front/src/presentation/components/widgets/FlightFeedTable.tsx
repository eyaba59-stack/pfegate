import type { Flight } from "@/core/domain/entities/Flight";
import { FlightType } from "@/core/domain/entities/Flight";
import StatusBadge from "@/presentation/components/ui/StatusBadge";
import Icon from "@/presentation/components/ui/Icon";

interface FlightFeedTableProps {
  flights: Flight[];
}

/**
 * Compact live feed shown on the dashboard landing view.
 */
export default function FlightFeedTable({ flights }: FlightFeedTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-surface-variant bg-surface-container-low font-label-caps text-label-caps uppercase text-on-surface-variant">
            <th className="px-4 py-3 font-semibold">Vol</th>
            <th className="px-4 py-3 font-semibold">Compagnie</th>
            <th className="px-4 py-3 font-semibold">Destination/Origine</th>
            <th className="px-4 py-3 font-semibold">Heure Prévue</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-variant font-body-md text-body-md">
          {flights.map((f) => (
            <tr key={f.id} className="transition-colors hover:bg-surface-container-lowest">
              <td className="px-4 py-3 font-data-mono text-data-mono text-primary">{f.flightNumber}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-variant text-[10px] font-bold">
                    {f.airline.code}
                  </div>
                  <span>{f.airline.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                {f.type === FlightType.ARRIVAL ? f.origin : f.destination}
              </td>
              <td className="px-4 py-3 font-data-mono text-data-mono">{f.scheduledTime}</td>
              <td className="px-4 py-3">
                <Icon
                  name={f.type === FlightType.DEPARTURE ? "flight_takeoff" : "flight_land"}
                  className={f.type === FlightType.DEPARTURE ? "text-secondary" : "text-secondary-container"}
                />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={f.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
