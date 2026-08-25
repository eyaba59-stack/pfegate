import AppShell from "@/presentation/components/layout/AppShell";
import WidgetCard from "@/presentation/components/ui/WidgetCard";
import AreaChart from "@/presentation/components/widgets/AreaChart";
import GroupedBarChart from "@/presentation/components/widgets/GroupedBarChart";
import HorizontalDelayBars from "@/presentation/components/widgets/HorizontalDelayBars";
import DateFilter from "@/presentation/components/features/DateFilter";
import Reveal from "@/presentation/components/ui/Reveal";
import Icon from "@/presentation/components/ui/Icon";
import { container } from "@/presentation/container/container";
import { API_BASE_URL } from "@/config/api";

export const dynamic = "force-dynamic";

interface AnalyticsPageProps {
  searchParams: { date?: string };
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const date = searchParams.date;
  const [{ monthlyVolume, arrivalsVsDepartures, delaysByAirline }] = await Promise.all([
    container.getAnalyticsOverview.execute(date),
  ]);

  return (
    <AppShell title="Monastir International Airport" breadcrumb="Analyses BI & Performance">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-section-gap">
        <Reveal animation="fade-up">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="font-display-lg text-display-lg text-on-background">Analyses BI & Performance</h2>
              <p className="mt-2 font-body-lg text-body-lg text-on-surface-variant">
                Vue détaillée des opérations aériennes et des métriques de retard.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DateFilter />
            <a
              href={`${API_BASE_URL}/api/bi/export/monthly${date ? `?date=${encodeURIComponent(date)}` : ""}`}
              target="_blank"
              rel="noreferrer"
              className="motion-hover flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-body-sm text-body-sm font-medium text-on-primary shadow-sm transition-colors hover:bg-tertiary-container"
            >
                <Icon name="download" className="text-[18px]" />
                Exporter Données BI (CSV)
              </a>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
          {/* Monthly volume area chart */}
          <Reveal animation="fade-up" delay={100} className="md:col-span-12">
            <WidgetCard
              title="Évolution du Volume de Vols (Mensuel)"
              subtitle="Tendances globales des mouvements aériens sur l'année."
              className="h-full"
            >
              <AreaChart points={monthlyVolume} />
            </WidgetCard>
          </Reveal>

          {/* Arrivals vs Departures */}
          <Reveal animation="slide-right" delay={160} className="md:col-span-6">
            <WidgetCard
              title="Arrivées vs Départs"
              subtitle="Répartition journalière moyenne."
              className="h-full"
            >
              <GroupedBarChart
                groups={arrivalsVsDepartures.map((d) => ({
                  label: d.day,
                  valueA: d.arrivals,
                  valueB: d.departures,
                  colorA: "#131b2e",
                  colorB: "#00668a",
                }))}
                legendA="Arrivées"
                legendB="Départs"
                height={240}
              />
            </WidgetCard>
          </Reveal>

          {/* Delays by airline */}
          <Reveal animation="slide-left" delay={220} className="md:col-span-6">
            <WidgetCard
              title="Retards par Compagnie"
              subtitle="Temps moyen de retard en minutes (Top 5)."
              className="h-full"
            >
              <div className="flex flex-1 items-center">
                <div className="w-full">
                  <HorizontalDelayBars bars={delaysByAirline} />
                </div>
              </div>
            </WidgetCard>
          </Reveal>

        </div>
      </div>
    </AppShell>
  );
}
