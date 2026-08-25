"use client";

import { useState } from "react";
import type { ReportRecord, StandardReport } from "@/core/domain/entities/Report";
import Icon from "@/presentation/components/ui/Icon";
import Reveal from "@/presentation/components/ui/Reveal";
import { API_BASE_URL, apiFetch } from "@/config/api";

const ICON_TONES: Record<StandardReport["iconTone"], string> = {
  error: "bg-error-container text-on-error-container",
  primary: "bg-primary-container text-on-primary-container",
  neutral: "bg-surface-variant text-on-surface-variant",
};

interface ReportSectionProps {
  initialHistory: ReportRecord[];
  standardReports: StandardReport[];
}

export default function ReportSection({ initialHistory, standardReports }: ReportSectionProps) {
  const [history, setHistory] = useState<ReportRecord[]>(initialHistory);
  const [type, setType] = useState("Bilan Mensuel Opérations");
  const [from, setFrom] = useState("2026-01-01");
  const [to, setTo] = useState("2026-01-31");
  const [format, setFormat] = useState<"PDF" | "XLSX" | "CSV">("PDF");
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setFeedback(null);
    try {
      const res = await apiFetch<{ report: ReportRecord }>("/api/reports/generate", {
        method: "POST",
        body: JSON.stringify({ type, format, from, to }),
      });
      setHistory((prev) => [res.report, ...prev]);
      setFeedback({ type: "success", text: `Rapport "${res.report.name}" généré avec succès dans le backend !` });

      // Automatically trigger download from the BI export API
      const exportKind = mapTypeToExportKind(type);
      window.open(`${API_BASE_URL}/api/bi/export/${exportKind}?from=${from}&to=${to}`, "_blank");
    } catch {
      setFeedback({ type: "error", text: "Impossible de générer le rapport. Vérifiez la connexion backend." });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (kind: string) => {
    window.open(`${API_BASE_URL}/api/bi/export/${kind}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-container-margin">
      {/* Generator Form */}
      <Reveal animation="fade-up" delay={100}>
        <section className="flex flex-col gap-6 rounded-xl border border-surface-container-high bg-surface-container-lowest p-widget-padding card-shadow">
          <div className="flex items-center gap-2 border-b border-surface-container pb-4">
            <Icon name="tune" className="text-secondary" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Paramètres d'Exportation</h3>
          </div>

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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Type de Rapport</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2.5 font-body-md text-body-md text-on-surface transition-all outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              >
                <option value="Bilan Mensuel Opérations">Bilan Mensuel Opérations</option>
                <option value="Analyse des Retards (Périodique)">Analyse des Retards (Périodique)</option>
                <option value="Performance Compagnies Aériennes">Performance Compagnies Aériennes</option>
                <option value="Flux Passagers et Bagages">Flux Passagers et Bagages</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Période</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container py-2 px-3 font-data-mono text-body-md outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                />
                <span className="text-on-surface-variant">-</span>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container py-2 px-3 font-data-mono text-body-md outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                />
              </div>
            </div>

            <div className="flex flex-col justify-between gap-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Format de Sortie</label>
              <div className="flex flex-wrap gap-2">
                {(["PDF", "XLSX", "CSV"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={`flex items-center gap-2 rounded px-4 py-2 font-body-md text-body-md font-medium transition-colors ${
                      format === f
                        ? "bg-secondary text-on-secondary"
                        : "border border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    <Icon name={f === "PDF" ? "picture_as_pdf" : f === "XLSX" ? "table_view" : "csv"} className="text-[18px]" />
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-surface-container pt-4">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="motion-hover flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-body-md text-body-md font-medium text-on-primary shadow-sm transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-60"
            >
              <Icon name="magic_button" />
              {generating ? "Génération en cours..." : "Générer le Rapport"}
            </button>
          </div>
        </section>
      </Reveal>

      {/* Standard reports */}
      <section className="flex flex-col gap-4">
        <Reveal animation="fade-up" delay={120}>
          <h3 className="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
            <Icon name="folder_special" className="text-on-surface-variant" />
            Rapports Standard Pré-générés
          </h3>
        </Reveal>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {standardReports.map((r, i) => {
            const exportKind = mapTypeToExportKind(r.title);
            return (
              <Reveal key={r.title} animation="zoom-in" delay={160 + i * 90}>
                <div className="group flex h-full flex-col gap-4 rounded-xl border border-surface-container-high bg-surface-container-lowest p-widget-padding transition-all hover:border-l-2 hover:border-l-secondary hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded ${ICON_TONES[r.iconTone]}`}>
                      <Icon name={r.icon} filled />
                    </div>
                    <span className="rounded bg-surface-container px-2 py-1 font-label-caps text-label-caps text-on-surface-variant">
                      {r.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-body-lg text-body-lg font-semibold text-on-surface transition-colors group-hover:text-secondary">
                      {r.title}
                    </h4>
                    <p className="mt-1 line-clamp-2 font-body-sm text-body-sm text-on-surface-variant">{r.description}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-surface-container pt-4">
                    <span className="font-data-mono text-body-sm text-on-surface-variant">Taille: {r.size}</span>
                    <button
                      type="button"
                      onClick={() => handleDownload(exportKind)}
                      className="motion-hover flex items-center justify-center rounded-full p-2 text-secondary transition-colors hover:bg-secondary-container"
                      title="Télécharger CSV / Données"
                    >
                      <Icon name="download" />
                    </button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* History */}
      <Reveal animation="slide-right" delay={180}>
        <section className="overflow-hidden rounded-xl border border-surface-container-high bg-surface-container-lowest card-shadow">
          <div className="flex items-center justify-between border-b border-surface-container bg-surface-bright px-widget-padding py-4">
            <h3 className="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
              <Icon name="history" className="text-on-surface-variant" />
              Historique des Générations
            </h3>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-surface-container bg-surface-container-low">
                <tr>
                  {["ID Rapport", "Nom du Document", "Date de Création", "Auteur", "Format", "Action"].map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-3 font-label-caps text-label-caps font-semibold text-on-surface-variant ${
                        h === "Action" ? "text-right" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-body-md text-body-md text-on-surface">
                {history.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-surface-bright">
                    <td className="px-6 py-4 font-data-mono text-data-mono text-on-surface-variant">{r.id}</td>
                    <td className="px-6 py-4 font-medium">{r.name}</td>
                    <td className="px-6 py-4 font-data-mono text-data-mono text-on-surface-variant">{r.createdAt}</td>
                    <td className="px-6 py-4">{r.author}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                          r.format === "PDF"
                            ? "bg-error-container text-on-error-container"
                            : r.format === "XLSX"
                              ? "bg-secondary-container text-on-secondary-container"
                              : "bg-surface-variant text-on-surface-variant"
                        }`}
                      >
                        {r.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDownload("flights")}
                        className="text-secondary transition-colors hover:text-on-secondary-container"
                        title="Télécharger l'export backend"
                      >
                        <Icon name="download" className="text-[20px]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>
    </div>
  );
}

function mapTypeToExportKind(title: string): string {
  if (title.includes("Retard") || title.includes("Delays")) return "delays";
  if (title.includes("Compagnie") || title.includes("Airline")) return "airlines";
  if (title.includes("Passager") || title.includes("Destination")) return "destinations";
  if (title.includes("Mensuel") || title.includes("Volume")) return "monthly";
  return "flights";
}
