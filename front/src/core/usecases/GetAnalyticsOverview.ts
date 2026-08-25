import type {
  AirlineDelay,
  ArrivalDeparturePoint,
  MonthlyVolumePoint,
  PeakHourBar,
} from "@/core/domain/entities/Analytics";
import type { AnalyticsRepository } from "@/core/domain/repositories/AnalyticsRepository";

export interface AnalyticsOverview {
  monthlyVolume: MonthlyVolumePoint[];
  arrivalsVsDepartures: ArrivalDeparturePoint[];
  delaysByAirline: AirlineDelay[];
  peakHours: PeakHourBar[];
}

/**
 * Use case: assemble all BI & performance widgets.
 */
export class GetAnalyticsOverview {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(date?: string): Promise<AnalyticsOverview> {
    const [monthlyVolume, arrivalsVsDepartures, delaysByAirline, peakHours] = await Promise.all([
      this.analyticsRepository.getMonthlyVolume(date),
      this.analyticsRepository.getArrivalsVsDepartures(date),
      this.analyticsRepository.getDelaysByAirline(date),
      this.analyticsRepository.getPeakHours(date),
    ]);
    return { monthlyVolume, arrivalsVsDepartures, delaysByAirline, peakHours };
  }
}
