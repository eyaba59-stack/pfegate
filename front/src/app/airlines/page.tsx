import AppShell from "@/presentation/components/layout/AppShell";
import AirlineHighlights from "@/presentation/components/widgets/AirlineHighlights";
import AirlineLeaderboard from "@/presentation/components/widgets/AirlineLeaderboard";
import GroupedBarChart from "@/presentation/components/widgets/GroupedBarChart";
import DateFilter from "@/presentation/components/features/DateFilter";
import Reveal from "@/presentation/components/ui/Reveal";
import Icon from "@/presentation/components/ui/Icon";
import { container } from "@/presentation/container/container";
import { API_BASE_URL } from "@/config/api";

export const dynamic = "force-dynamic";

const DELAY_TRENDS = [
  { label: "Sem 1", valueA: 20, valueB: 60, colorA: "#00668a", colorB: "#76777d" },
  { label: "Sem 2", valueA: 15, valueB: 80, colorA: "#00668a", colorB: "#76777d" },
  { label: "Sem 3", valueA: 25, valueB: 50, colorA: "#00668a", colorB: "#76777d" },
  { label: "Sem 4", valueA: 10, valueB: 70, colorA: "#00668a", colorB: "#76777d" },
];

interface AirlinesPageProps {
  searchParams: { date?: string };
}

export default async function AirlinesPage({ searchParams }: AirlinesPageProps) {
  const date = searchParams.date;
  const { leaderboard, highlights } = await container.getAirlinePerformance.execute(date);

  return (
    <AppShell title="Monastir International Airport" showSearch={false}>
      <div className="mx-auto max-w-[1600px] space-y-container-margin">
        <Reveal animation="fade-up">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="mb-1 font-headline-sm text-headline-sm font-bold text-primary">Performance des Compagnies</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Classement opérationnel et tendances de fiabilité des transporteurs partenaires.
              </p>
            </div>
            <DateFilter />
          </div>
        </Reveal>

        <Reveal animation="fade-up" delay={120}>
          <AirlineHighlights highlights={highlights} />
        </Reveal>

        {/* Leaderboard */}
        <Reveal animation="slide-right" delay={180}>
          <div className="flex flex-col overflow-hidden rounded-lg border border-surface-container-highest bg-surface-container-lowest card-shadow">
            <div className="flex items-center justify-between border-b border-surface-container-highest bg-surface-bright p-4">
              <h3 className="font-headline-sm text-headline-sm text-primary">Classement Opérationnel (30 Derniers Jours)</h3>
              <a
                href={`${API_BASE_URL}/api/bi/export/airlines`}
                target="_blank"
                rel="noreferrer"
                className="motion-hover flex items-center gap-1 text-secondary hover:opacity-80"
              >
                <span className="font-body-sm text-body-sm font-medium">Exporter CSV</span>
                <Icon name="download" className="text-[16px]" />
              </a>
            </div>
            <AirlineLeaderboard airlines={leaderboard} />
          </div>
        </Reveal>

        {/* Delay trends chart */}
        <Reveal animation="slide-left" delay={240}>
          <div className="flex min-h-[300px] flex-col rounded-lg border border-surface-container-highest bg-surface-container-lowest p-widget-padding card-shadow">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary">Tendances des Retards (Minutes)</h3>
                <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                  Comparaison des temps de retard moyens par semaine.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 font-label-caps text-label-caps text-on-surface-variant">
                  <span className="h-2 w-2 rounded-full bg-secondary" /> Tunisair
                </span>
                <span className="flex items-center gap-1 font-label-caps text-label-caps text-on-surface-variant">
                  <span className="h-2 w-2 rounded-full bg-outline" /> Air France
                </span>
              </div>
            </div>
            <GroupedBarChart
              groups={DELAY_TRENDS}
              legendA="Tunisair"
              legendB="Air France"
              height={200}
            />
          </div>
        </Reveal>
      </div>
    </AppShell>
  );
}
