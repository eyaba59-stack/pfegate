import Link from "next/link";
import AppShell from "@/presentation/components/layout/AppShell";
import KpiCard from "@/presentation/components/widgets/KpiCard";
import WidgetCard from "@/presentation/components/ui/WidgetCard";
import FlightFeedTable from "@/presentation/components/widgets/FlightFeedTable";
import TrafficLineChart from "@/presentation/components/widgets/TrafficLineChart";
import DonutChart from "@/presentation/components/widgets/DonutChart";
import AreaChart from "@/presentation/components/widgets/AreaChart";
import GroupedBarChart from "@/presentation/components/widgets/GroupedBarChart";
import HorizontalDelayBars from "@/presentation/components/widgets/HorizontalDelayBars";
import AirlineHighlights from "@/presentation/components/widgets/AirlineHighlights";
import DestinationRankList from "@/presentation/components/widgets/DestinationRankList";
import DateFilter from "@/presentation/components/features/DateFilter";
import Reveal from "@/presentation/components/ui/Reveal";
import Icon from "@/presentation/components/ui/Icon";
import { container } from "@/presentation/container/container";

export const dynamic = "force-dynamic";

const DONUT_COLORS = ["#00668a", "#40c2fd", "#131b2e", "#bec6e0", "#b7c8e1", "#e0e3e5", "#76777d"];

/** Route each KPI card to the page that details its metric. */
function kpiHref(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("ponctual") || l.includes("retard")) return "/analytics";
  return "/flights";
}

interface DashboardPageProps {
  searchParams: { date?: string };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const date = searchParams.date;
  const [overview, analytics, performance, destinations, hourlyTraffic] = await Promise.all([
    container.getDashboardOverview.execute(date),
    container.getAnalyticsOverview.execute(date),
    container.getAirlinePerformance.execute(date),
    container.getDestinationAnalysis.execute(date),
    container.getHourlyTraffic.execute(date),
  ]);
  const { kpis, liveFlights } = overview;

  // Airline share (donut) computed from the full BI leaderboard, not a partial page.
  const totalFlights = performance.leaderboard.reduce((acc, a) => acc + a.totalFlights, 0);
  const airlineShare = performance.leaderboard.map((a, i) => ({
    label: a.name,
    value: a.totalFlights,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  const trafficSeries = [
    {
      name: "Départs",
      color: "#00668a",
      values: hourlyTraffic.map((p) => p.departures),
    },
    {
      name: "Arrivées",
      color: "#40c2fd",
      values: hourlyTraffic.map((p) => p.arrivals),
    },
  ];
  const trafficLabels = hourlyTraffic.map((p) => p.label);

  return (
    <AppShell title="Monastir International Airport">
      <div className="mx-auto max-w-[1600px] space-y-container-margin">
        <Reveal animation="fade-up">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="mb-1 font-headline-md text-headline-md font-bold text-primary">Aperçu des Opérations</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Statut en temps réel et métriques de performance (source: BI / backend).
              </p>
            </div>
            <DateFilter />
          </div>
        </Reveal>

        {/* KPI Grid */}
        <section>
          <Reveal animation="fade-up" delay={80}>
            <h3 className="mb-4 font-headline-sm text-headline-sm text-primary">Indicateurs Clés</h3>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {kpis.map((k, i) => (
              <Reveal key={k.label} animation="fade-up" delay={120 + i * 70}>
                <KpiCard metric={k} href={kpiHref(k.label)} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* 24h traffic + airline share */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Reveal animation="slide-right" delay={120} className="lg:col-span-8">
            <WidgetCard title="Évolution du Trafic (24h)" className="h-full">
              <TrafficLineChart series={trafficSeries} labels={trafficLabels} />
            </WidgetCard>
          </Reveal>
          <Reveal animation="slide-left" delay={220} className="lg:col-span-4">
            <WidgetCard title="Répartition Compagnies" className="h-full">
              <DonutChart segments={airlineShare} centerLabel={String(totalFlights)} />
            </WidgetCard>
          </Reveal>
        </section>

        {/* Airline performance highlights */}
        <Reveal animation="fade-up" delay={160}>
          <AirlineHighlights highlights={performance.highlights} />
        </Reveal>

        {/* Monthly volume + top destinations */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Reveal animation="fade-up" delay={140} className="lg:col-span-8">
            <WidgetCard
              title="Évolution du Volume de Vols (Mensuel)"
              subtitle="Tendances globales des mouvements aériens sur l'année."
              className="h-full"
            >
              <AreaChart points={analytics.monthlyVolume} />
            </WidgetCard>
          </Reveal>
          <Reveal animation="slide-left" delay={220} className="lg:col-span-4">
            <div className="flex h-full flex-col rounded-lg border border-surface-variant bg-surface-container-lowest p-widget-padding card-shadow">
              <h3 className="font-headline-sm text-headline-sm text-primary">Top 5 Destinations</h3>
              <p className="mb-4 mt-1 font-body-sm text-body-sm text-on-surface-variant">
                Volume de passagers au départ de MIR
              </p>
              <DestinationRankList destinations={destinations.topDestinations} />
            </div>
          </Reveal>
        </section>

        {/* Arrivals vs departures + delays by airline */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Reveal animation="slide-right" delay={160} className="lg:col-span-6">
            <WidgetCard
              title="Arrivées vs Départs"
              subtitle="Répartition journalière (7 derniers jours)."
              className="h-full"
            >
              <GroupedBarChart
                groups={analytics.arrivalsVsDepartures.map((d) => ({
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
          <Reveal animation="slide-left" delay={220} className="lg:col-span-6">
            <WidgetCard
              title="Retards par Compagnie"
              subtitle="Temps moyen de retard en minutes (Top 5)."
              className="h-full"
            >
              <div className="flex flex-1 items-center">
                <div className="w-full">
                  <HorizontalDelayBars bars={analytics.delaysByAirline} />
                </div>
              </div>
            </WidgetCard>
          </Reveal>
        </section>

        {/* Live feed */}
        <Reveal animation="fade-up" delay={160}>
          <section className="overflow-hidden rounded-lg border border-surface-variant bg-surface-container-lowest card-shadow">
            <div className="flex items-center justify-between border-b border-surface-variant bg-surface-bright p-widget-padding">
              <h3 className="font-body-lg text-body-lg font-semibold text-primary">Flux de Vols en Direct</h3>
              <Link
                href="/flights"
                className="motion-hover flex items-center gap-1 font-body-sm text-body-sm font-medium text-secondary hover:underline"
              >
                Voir tout <Icon name="arrow_forward" className="text-[16px]" />
              </Link>
            </div>
            <FlightFeedTable flights={liveFlights} />
          </section>
        </Reveal>
      </div>
    </AppShell>
  );
}
