import AppShell from "@/presentation/components/layout/AppShell";
import DestinationsPageClient from "@/presentation/components/widgets/DestinationsPageClient";
import Reveal from "@/presentation/components/ui/Reveal";
import Icon from "@/presentation/components/ui/Icon";
import { container } from "@/presentation/container/container";
import { API_BASE_URL } from "@/config/api";

export const dynamic = "force-dynamic";

interface DestinationsPageProps {
  searchParams: { date?: string };
}

export default async function DestinationsPage({ searchParams }: DestinationsPageProps) {
  const date = searchParams.date;
  const { topDestinations, allDestinations } = await container.getDestinationAnalysis.execute(date);

  return (
    <AppShell title="Monastir International Airport">
      <div className="mx-auto max-w-[1440px]">
        <Reveal animation="fade-up">
          <header className="mb-section-gap flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display-lg text-display-lg text-on-surface">Analyse des Destinations</h1>
              <p className="mt-2 max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
                Cartographie des flux de trafic et volumes de passagers au départ de MIR.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 font-body-md text-body-md font-medium text-on-surface transition-colors hover:bg-surface-variant">
                <Icon name="filter_list" className="text-[18px]" />
                Filtrer
              </button>
              <a
                href={`${API_BASE_URL}/api/bi/export/destinations${date ? `?date=${encodeURIComponent(date)}` : ""}`}
                target="_blank"
                rel="noreferrer"
                className="motion-hover flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 font-body-md text-body-md font-medium text-on-secondary shadow-sm transition-colors hover:bg-on-secondary-container"
              >
                Exporter le Rapport
              </a>
            </div>
          </header>
        </Reveal>

        <Reveal animation="fade-up" delay={100}>
          <div className="grid grid-cols-12 gap-section-gap">
            <DestinationsPageClient destinations={topDestinations} allDestinations={allDestinations} />
          </div>
        </Reveal>

        <Reveal animation="fade-in" delay={300}>
          <footer className="mt-section-gap py-6 text-center text-label-caps font-label-caps text-on-surface-variant border-t border-surface-variant">
            Données consolidées depuis le système AODB. Mise à jour: il y a 5 minutes.
          </footer>
        </Reveal>
      </div>
    </AppShell>
  );
}
