import type { ReportRecord, StandardReport } from "@/core/domain/entities/Report";
import type { ReportRepository } from "@/core/domain/repositories/ReportRepository";
import { safe } from "@/config/serverApi";
import { REPORT_HISTORY, STANDARD_REPORTS } from "@/data/mocks/reports";

export class ApiReportRepository implements ReportRepository {
  async getHistory(): Promise<ReportRecord[]> {
    const res = await safe<{ history: ReportRecord[] }>("/api/reports/history", { history: REPORT_HISTORY });
    return res.history;
  }

  async getStandardReports(): Promise<StandardReport[]> {
    const res = await safe<{ standardReports: StandardReport[] }>("/api/reports/standards", {
      standardReports: STANDARD_REPORTS,
    });
    return res.standardReports;
  }
}
