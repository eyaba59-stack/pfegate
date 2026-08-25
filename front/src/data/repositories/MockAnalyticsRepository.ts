import type {
  AirlineDelay,
  ArrivalDeparturePoint,
  HourlyTrafficPoint,
  MonthlyVolumePoint,
  PeakHourBar,
} from "@/core/domain/entities/Analytics";
import type { AnalyticsRepository } from "@/core/domain/repositories/AnalyticsRepository";
import {
  AIRLINE_DELAYS,
  ARRIVALS_VS_DEPARTURES,
  HOURLY_TRAFFIC,
  MONTHLY_VOLUME,
  peakHoursForWindow,
} from "@/data/mocks/analytics";

export class MockAnalyticsRepository implements AnalyticsRepository {
  async getMonthlyVolume(_date?: string): Promise<MonthlyVolumePoint[]> {
    return MONTHLY_VOLUME;
  }

  async getArrivalsVsDepartures(_date?: string): Promise<ArrivalDeparturePoint[]> {
    return ARRIVALS_VS_DEPARTURES;
  }

  async getDelaysByAirline(_date?: string): Promise<AirlineDelay[]> {
    return AIRLINE_DELAYS;
  }

  async getPeakHours(_date?: string, days?: number): Promise<PeakHourBar[]> {
    return peakHoursForWindow(days);
  }

  async getHourlyTraffic(_date?: string): Promise<HourlyTrafficPoint[]> {
    return HOURLY_TRAFFIC;
  }
}
