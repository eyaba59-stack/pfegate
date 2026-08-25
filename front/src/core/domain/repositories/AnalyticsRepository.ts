import type {
  AirlineDelay,
  ArrivalDeparturePoint,
  HourlyTrafficPoint,
  MonthlyVolumePoint,
  PeakHourBar,
} from "@/core/domain/entities/Analytics";

export interface AnalyticsRepository {
  getMonthlyVolume(date?: string): Promise<MonthlyVolumePoint[]>;
  getArrivalsVsDepartures(date?: string): Promise<ArrivalDeparturePoint[]>;
  getDelaysByAirline(date?: string): Promise<AirlineDelay[]>;
  getPeakHours(date?: string, days?: number): Promise<PeakHourBar[]>;
  getHourlyTraffic(date?: string): Promise<HourlyTrafficPoint[]>;
}
