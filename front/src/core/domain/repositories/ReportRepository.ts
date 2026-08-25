import type { ReportRecord, StandardReport } from "@/core/domain/entities/Report";

export interface ReportRepository {
  getHistory(): Promise<ReportRecord[]>;
  getStandardReports(): Promise<StandardReport[]>;
}
