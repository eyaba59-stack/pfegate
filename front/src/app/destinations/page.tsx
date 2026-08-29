import AppShell from "@/presentation/components/layout/AppShell";
import DestinationsPageClient from "@/presentation/components/widgets/DestinationsPageClient";
import { container } from "@/presentation/container/container";
import { API_BASE_URL } from "@/config/api";
import Icon from "@/presentation/components/ui/Icon";

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
        <header className="mb-section-gap flex justify-between items-end">
          <div>
            <h1 className="text-display-lg font-display-lg text-on-surface">Analyse des Destinations</h1>
            <p className="text-body-lg font-body-lg text-on-surface-variant mt-2 max-w-2xl">
              Cartographie des flux de trafic et volumes de passagers au départ de MIR.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-outline-variant rounded-lg text-body-md font-body-md font-medium text-on-surface hover:bg-surface-variant transition-colors flex items-center gap-2">
              <Icon name="filter_list" className="text-[18px]" />
              Filtrer
            </button>
            <a
              href={`${API_BASE_URL}/api/bi/export/destinations${date ? `?date=${encodeURIComponent(date)}` : ""}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-secondary text-on-secondary rounded-lg text-body-md font-body-md font-medium hover:bg-on-secondary-container transition-colors shadow-sm"
            >
              Exporter le Rapport
            </a>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-section-gap">
          <DestinationsPageClient destinations={topDestinations} allDestinations={allDestinations} />
        </div>

        <footer className="mt-section-gap py-6 text-center text-label-caps font-label-caps text-on-surface-variant border-t border-surface-variant">
          Données consolidées depuis le système AODB. Mise à jour: il y a 5 minutes.
        </footer>
      </div>
    </AppShell>
  );
}
