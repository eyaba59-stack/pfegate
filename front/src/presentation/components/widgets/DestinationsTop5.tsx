"use client";

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

interface DestinationsTop5Props {
  destinations: DestData[];
  selected: string | null;
  onSelect: (code: string | null) => void;
}

const RANK_COLORS = ["bg-secondary", "bg-secondary-container", "bg-tertiary-fixed-dim", "bg-primary-fixed-dim", "bg-surface-variant"];

export default function DestinationsTop5({ destinations, selected, onSelect }: DestinationsTop5Props) {
  const top5 = destinations.slice(0, 5);
  const maxPax = top5[0]?.passengers || 1;

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-surface-container flex justify-between items-center">
        <div>
          <h3 className="text-headline-sm font-headline-sm text-on-surface">Top 5 Destinations</h3>
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Volume de passagers (30 derniers jours)</p>
        </div>
        {selected && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-label-caps font-label-caps text-secondary hover:text-on-secondary-container transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col gap-4 overflow-y-auto">
        {top5.map((d) => {
          const isActive = selected === d.code;
          return (
            <div
              key={d.code}
              className={`dest-item cursor-pointer transition-all duration-300 border-2 rounded-lg p-2 ${
                isActive ? "border-secondary bg-secondary/10" : "border-transparent"
              }`}
              style={{ opacity: selected && !isActive ? 0.4 : 1 }}
              onClick={() => onSelect(isActive ? null : d.code)}
            >
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
                  {d.passengers.toLocaleString("fr-FR")} <span className="text-body-sm font-body-sm text-on-surface-variant">pax</span>
                </span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div
                  className={`${RANK_COLORS[d.rank - 1] || "bg-secondary"} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${(d.passengers / maxPax) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
