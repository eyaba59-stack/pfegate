import type { ReportRecord, StandardReport } from "@/core/domain/entities/Report";
import type { ReportRepository } from "@/core/domain/repositories/ReportRepository";

export interface ReportsView {
  history: ReportRecord[];
  standardReports: StandardReport[];
}

/**
 * Use case: list available reports and generation history.
 */
export class GetReports {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(): Promise<ReportsView> {
    const [history, standardReports] = await Promise.all([
      this.reportRepository.getHistory(),
      this.reportRepository.getStandardReports(),
    ]);
    return { history, standardReports };
  }
}
