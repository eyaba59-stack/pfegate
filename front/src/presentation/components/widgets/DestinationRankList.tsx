import type { Destination } from "@/core/domain/entities/Destination";

interface DestinationRankListProps {
  destinations: Destination[];
}

/**
 * "Top 5 Destinations" ranking with passenger volumes and progress bars.
 */
export default function DestinationRankList({ destinations }: DestinationRankListProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto">
      {destinations.map((d) => (
        <div key={d.code}>
          <div className="mb-2 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container font-bold text-on-surface">
                {d.rank}
              </div>
              <div>
                <span className="block font-body-lg text-body-lg font-medium text-on-surface">
                  {d.city} ({d.code})
                </span>
                <span className="font-label-caps text-label-caps text-on-surface-variant">{d.country}</span>
              </div>
            </div>
            <span className="font-data-mono text-data-mono text-on-surface">
              {d.passengers.toLocaleString("fr-FR")}{" "}
              <span className="font-body-sm text-body-sm text-on-surface-variant">pax</span>
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
            <div className={`h-full rounded-full ${d.barColor}`} style={{ width: `${d.sharePercent}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
