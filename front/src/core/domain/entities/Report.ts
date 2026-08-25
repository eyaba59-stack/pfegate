/**
 * Core domain entity for generated reports.
 */

export type ReportFormat = "PDF" | "CSV" | "XLSX";

export interface ReportRecord {
  id: string;
  name: string;
  createdAt: string;
  author: string;
  format: ReportFormat;
}

export interface StandardReport {
  title: string;
  description: string;
  size: string;
  badge: string;
  icon: string;
  iconTone: "error" | "primary" | "neutral";
}
