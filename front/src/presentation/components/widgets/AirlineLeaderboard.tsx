import type { Airline } from "@/core/domain/entities/Airline";

interface AirlineLeaderboardProps {
  airlines: Airline[];
}

/**
 * Operational ranking table (30 last days) with score bars.
 */
export default function AirlineLeaderboard({ airlines }: AirlineLeaderboardProps) {
  const punctualityTone = (p: number) =>
    p >= 90 ? "bg-secondary-container/20 text-on-secondary-container" : p >= 80 ? "bg-surface-container-highest text-on-surface-variant" : "bg-error-container/40 text-error";

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-surface-container-highest bg-surface-container-low text-on-surface-variant">
            <th className="w-1/4 px-4 py-3 font-label-caps text-label-caps">Compagnie</th>
            <th className="px-4 py-3 text-right font-label-caps text-label-caps">Vols Totaux</th>
            <th className="px-4 py-3 text-right font-label-caps text-label-caps">Ponctualité</th>
            <th className="px-4 py-3 text-right font-label-caps text-label-caps">Annulations</th>
            <th className="px-4 py-3 text-right font-label-caps text-label-caps">Score Global</th>
          </tr>
        </thead>
        <tbody className="font-body-md text-body-md">
          {airlines.map((a, idx) => (
            <tr
              key={a.code}
              className={`transition-colors hover:bg-surface-container-low/50 ${
                idx < airlines.length - 1 ? "border-b border-surface-container-highest" : ""
              }`}
            >
              <td className="flex items-center gap-2 px-4 py-3 font-medium">
                <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-surface-container text-[10px] font-bold text-on-surface-variant">
                  {a.code}
                </div>
                {a.name}
              </td>
              <td className="px-4 py-3 text-right font-data-mono text-data-mono">
                {a.totalFlights.toLocaleString("fr-FR")}
              </td>
              <td className="px-4 py-3 text-right">
                <span className={`inline-flex rounded-full px-2 py-0.5 font-body-sm text-body-sm ${punctualityTone(a.punctuality)}`}>
                  {a.punctuality.toFixed(1)}%
                </span>
              </td>
              <td className={`px-4 py-3 text-right font-data-mono text-data-mono ${a.cancellations > 1 ? "text-error" : a.cancellations < 0.5 ? "text-secondary" : ""}`}>
                {a.cancellations.toFixed(1)}%
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-container-highest">
                    <div className={`h-full ${a.scoreBarColor}`} style={{ width: `${a.scoreBarWidth}%` }} />
                  </div>
                  <span className="font-bold">{a.score}/100</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
