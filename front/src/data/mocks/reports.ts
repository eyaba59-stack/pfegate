import type { ReportRecord, StandardReport } from "@/core/domain/entities/Report";

export const REPORT_HISTORY: ReportRecord[] = [
  { id: "REP-9942", name: "Extraction_Vols_Nuit_Oct23", createdAt: "24/10/2023 14:32", author: "J. Dupont", format: "CSV" },
  { id: "REP-9941", name: "Bilan_Hebdo_S42", createdAt: "23/10/2023 09:15", author: "Système (Auto)", format: "PDF" },
  { id: "REP-9940", name: "Analyse_Compagnies_LowCost_Q3", createdAt: "20/10/2023 16:45", author: "M. Kallel", format: "XLSX" },
  { id: "REP-9939", name: "Flux_Passagers_Sept23", createdAt: "18/10/2023 11:02", author: "J. Dupont", format: "PDF" },
];

export const STANDARD_REPORTS: StandardReport[] = [
  {
    title: "Rapport Mensuel - Octobre 2023",
    description: "Synthèse globale des mouvements aéroportuaires, flux passagers et incidents logistiques du mois écoulé.",
    size: "2.4 MB",
    badge: "Auto-généré",
    icon: "picture_as_pdf",
    iconTone: "error",
  },
  {
    title: "Bilan Annuel 2022",
    description: "Rapport d'activité annuel complet audité. Statistiques de croissance et objectifs de performance.",
    size: "15.1 MB",
    badge: "Officiel",
    icon: "description",
    iconTone: "primary",
  },
  {
    title: "Analyse Retards Q3",
    description: "Extraction Excel de tous les événements de retard dépassant 15 minutes pour le troisième trimestre.",
    size: "8.7 MB",
    badge: "Données Brutes",
    icon: "table_chart",
    iconTone: "neutral",
  },
];
