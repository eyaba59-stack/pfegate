/**
 * KPI metric card value object used across dashboards.
 */

export type KpiTone = "default" | "warning" | "error" | "success";

export interface KpiMetric {
  label: string;
  value: string;
  icon: string;
  tone: KpiTone;
  unit?: string;
}
