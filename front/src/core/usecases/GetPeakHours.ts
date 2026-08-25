import type { PeakHourBar } from "@/core/domain/entities/Analytics";
import type { AnalyticsRepository } from "@/core/domain/repositories/AnalyticsRepository";

/**
 * Use case: hourly traffic density over a trailing window.
 * `days` anchors the BI window: 1 = selected day, 7 = trailing week (default 30).
 */
export class GetPeakHours {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(date?: string, days?: number): Promise<PeakHourBar[]> {
    return this.analyticsRepository.getPeakHours(date, days);
  }
}
