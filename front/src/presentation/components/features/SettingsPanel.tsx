"use client";

import { useState } from "react";
import type { UserProfile } from "@/core/domain/entities/UserProfile";
import Icon from "@/presentation/components/ui/Icon";
import { apiFetch } from "@/config/api";

interface SettingsPanelProps {
  profile: UserProfile;
}

const TABS = [
  { id: "profile", label: "Profil", icon: "person" },
  { id: "security", label: "Sécurité", icon: "lock" },
  { id: "notifications", label: "Notifications", icon: "notifications_active" },
  { id: "preferences", label: "Préférences de l'application", icon: "tune" },
  { id: "access", label: "Gestion des accès", icon: "admin_panel_settings" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPanel({ profile }: SettingsPanelProps) {
  const [active, setActive] = useState<TabId>("profile");
  const [form, setForm] = useState({ fullName: profile.fullName, email: profile.email });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await apiFetch<UserProfile>("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setFeedback({ type: "success", text: "Profil mis à jour avec succès dans le backend !" });
    } catch {
      setFeedback({ type: "error", text: "Impossible de mettre à jour le profil. Vérifiez la connexion au serveur." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-12 items-start gap-8">
      {/* Tabs */}
      <div className="col-span-12 flex flex-col gap-1 rounded-xl border border-surface-container-highest bg-surface-container-lowest p-2 card-shadow md:col-span-3">
        {TABS.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={[
                "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-body-md text-body-md transition-all",
                isActive
                  ? "border-l-2 border-secondary bg-secondary/10 text-secondary"
                  : "text-on-surface-variant hover:bg-surface-container-low",
              ].join(" ")}
            >
              <Icon name={t.icon} filled={isActive} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="col-span-12 flex flex-col gap-6 md:col-span-9">
        {active === "profile" ? (
          <form onSubmit={handleSaveProfile} className="rounded-xl border border-surface-container-highest bg-surface-container-lowest shadow-[0_4px_12px_rgba(15,23,42,0.03)] transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between border-b border-surface-container-highest p-widget-padding">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-background">Informations Personnelles</h3>
                <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                  Mettez à jour vos informations de contact de base.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 p-widget-padding">
              {feedback && (
                <div
                  className={`flex items-center gap-2 rounded px-3 py-2 font-body-sm text-body-sm ${
                    feedback.type === "success"
                      ? "bg-secondary-container/60 text-on-secondary-container"
                      : "bg-error-container/60 text-on-error-container"
                  }`}
                >
                  <Icon name={feedback.type === "success" ? "check_circle" : "error"} className="text-[18px]" />
                  {feedback.text}
                </div>
              )}

              <div className="flex items-center gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-outline-variant bg-tertiary-fixed-dim font-headline-md text-headline-md text-on-tertiary">
                  {form.fullName ? form.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "AD"}
                </div>
                <div>
                  <button type="button" className="rounded-lg border border-outline-variant bg-surface-container-high px-4 py-2 font-body-md text-body-md font-medium text-on-surface transition-colors hover:bg-surface-dim">
                    Changer la photo
                  </button>
                  <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">JPG, GIF ou PNG. Max 1MB.</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-label-caps text-on-surface">Nom complet</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    className="rounded-lg border border-outline-variant bg-surface px-4 py-2.5 font-body-md text-body-md text-on-surface transition-all focus:border-secondary focus:ring-1 focus:ring-secondary"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-label-caps text-on-surface">Adresse Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="rounded-lg border border-outline-variant bg-surface px-4 py-2.5 font-body-md text-body-md text-on-surface transition-all focus:border-secondary focus:ring-1 focus:ring-secondary"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-label-caps text-on-surface">Rôle Principal</label>
                  <input
                    type="text"
                    disabled
                    value={profile.role}
                    className="cursor-not-allowed rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 font-body-md text-body-md text-on-surface-variant"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-caps text-label-caps text-on-surface">Département</label>
                  <input
                    type="text"
                    disabled
                    value={profile.department}
                    className="cursor-not-allowed rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2.5 font-body-md text-body-md text-on-surface-variant"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end rounded-b-xl border-t border-surface-container-highest bg-surface-container-lowest p-4">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-6 py-2 font-body-md text-body-md font-medium text-on-primary shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-xl border border-surface-container-highest bg-surface-container-lowest p-10 text-center card-shadow">
            <Icon name={TABS.find((t) => t.id === active)?.icon ?? "settings"} className="text-[40px] text-on-surface-variant/50" />
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-background">
                {TABS.find((t) => t.id === active)?.label}
              </h3>
              <p className="mt-2 max-w-md font-body-md text-body-md text-on-surface-variant">
                Cette section est en cours de construction et sera disponible dans une prochaine version.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
