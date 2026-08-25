import type { HourlyTrafficPoint } from "@/core/domain/entities/Analytics";
import type { AnalyticsRepository } from "@/core/domain/repositories/AnalyticsRepository";

/**
 * Use case: 24h traffic split for the dashboard line chart.
 */
export class GetHourlyTraffic {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(date?: string): Promise<HourlyTrafficPoint[]> {
    return this.analyticsRepository.getHourlyTraffic(date);
  }
}
