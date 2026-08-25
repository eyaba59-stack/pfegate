import AppShell from "@/presentation/components/layout/AppShell";
import SettingsPanel from "@/presentation/components/features/SettingsPanel";
import Reveal from "@/presentation/components/ui/Reveal";
import { container } from "@/presentation/container/container";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await container.getUserProfile.execute();

  return (
    <AppShell title="Monastir International Airport">
      <div className="mx-auto max-w-6xl">
        <Reveal animation="fade-up">
          <div className="mb-section-gap">
            <h2 className="font-display-lg text-display-lg text-on-background">Paramètres du Compte</h2>
            <p className="mt-2 font-body-lg text-body-lg text-on-surface-variant">
              Gérez vos préférences, votre sécurité et les accès à la plateforme.
            </p>
          </div>
        </Reveal>
        <Reveal animation="fade-up" delay={140}>
          <SettingsPanel profile={profile} />
        </Reveal>
      </div>
    </AppShell>
  );
}
