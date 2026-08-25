import AppShell from "@/presentation/components/layout/AppShell";
import FlightExplorer from "@/presentation/components/features/FlightExplorer";
import DateFilter from "@/presentation/components/features/DateFilter";
import Reveal from "@/presentation/components/ui/Reveal";
import { container } from "@/presentation/container/container";

export const dynamic = "force-dynamic";

interface FlightsPageProps {
  searchParams: { date?: string };
}

export default async function FlightsPage({ searchParams }: FlightsPageProps) {
  const { flights } = await container.getFlights.execute({ date: searchParams.date });

  return (
    <AppShell title="Monastir International Airport">
      <div className="mx-auto max-w-[1440px]">
        <Reveal animation="fade-up">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="mb-1 font-headline-md text-headline-md font-bold text-primary">Suivi des Vols</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Programme opérationnel en temps réel — arrivées, départs et perturbations.
              </p>
            </div>
            <DateFilter />
          </div>
        </Reveal>
        <Reveal animation="fade-up" delay={140}>
          <FlightExplorer flights={flights} />
        </Reveal>
      </div>
    </AppShell>
  );
}
