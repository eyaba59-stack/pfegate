import type { ReportRecord, StandardReport } from "@/core/domain/entities/Report";
import type { ReportRepository } from "@/core/domain/repositories/ReportRepository";
import { REPORT_HISTORY, STANDARD_REPORTS } from "@/data/mocks/reports";

export class MockReportRepository implements ReportRepository {
  async getHistory(): Promise<ReportRecord[]> {
    return REPORT_HISTORY;
  }

  async getStandardReports(): Promise<StandardReport[]> {
    return STANDARD_REPORTS;
  }
}
