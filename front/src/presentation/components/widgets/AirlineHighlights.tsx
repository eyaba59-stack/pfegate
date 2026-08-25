import type { AirlinePerformanceHighlights } from "@/core/domain/entities/Airline";
import Icon from "@/presentation/components/ui/Icon";

const TONE_CLASSES = {
  secondary: { iconBox: "bg-secondary-container/20 text-on-secondary-container", trend: "text-secondary" },
  error: { iconBox: "bg-error-container/40 text-on-error-container", trend: "text-error" },
  neutral: { iconBox: "bg-surface-container-highest text-on-surface", trend: "text-on-surface-variant" },
};

interface AirlineHighlightsProps {
  highlights: AirlinePerformanceHighlights;
}

/**
 * Three bento highlight cards: best performer, worst delay, most reliable.
 */
export default function AirlineHighlights({ highlights }: AirlineHighlightsProps) {
  const cards = [
    { title: "MEILLEURE PERFORMANCE", ...highlights.bestPerformer },
    { title: "RETARD MOYEN MAXIMAL", ...highlights.worstDelay },
    { title: "PARTENAIRE LE PLUS FIABLE", ...highlights.mostReliable },
  ];

  return (
    <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
      {cards.map((c) => {
        const tone = TONE_CLASSES[c.tone];
        return (
          <div
            key={c.title}
            className="card-hover flex h-36 flex-col justify-between rounded-lg border border-surface-container-highest bg-surface-container-lowest p-widget-padding card-shadow transition-all"
          >
            <div className="flex items-start justify-between">
              <span className="font-label-caps text-label-caps text-on-surface-variant">{c.title}</span>
              <div className={`rounded-md p-1 ${tone.iconBox}`}>
                <Icon name={c.icon} className="text-[16px]" />
              </div>
            </div>
            <div>
              <div className="font-display-lg text-display-lg text-primary">{c.name}</div>
              <div className={`mt-1 flex items-center gap-1 ${tone.trend}`}>
                <Icon name="arrow_upward" className="text-[14px]" />
                <span className="font-body-sm text-body-sm font-medium">{c.value}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
