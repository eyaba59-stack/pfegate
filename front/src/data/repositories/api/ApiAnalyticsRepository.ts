import type {
  AirlineDelay,
  ArrivalDeparturePoint,
  HourlyTrafficPoint,
  MonthlyVolumePoint,
  PeakHourBar,
} from "@/core/domain/entities/Analytics";
import type { AnalyticsRepository } from "@/core/domain/repositories/AnalyticsRepository";
import { safe } from "@/config/serverApi";
import {
  AIRLINE_DELAYS,
  ARRIVALS_VS_DEPARTURES,
  HOURLY_TRAFFIC,
  MONTHLY_VOLUME,
  PEAK_HOURS,
  peakHoursForWindow,
} from "@/data/mocks/analytics";

export class ApiAnalyticsRepository implements AnalyticsRepository {
  async getMonthlyVolume(date?: string): Promise<MonthlyVolumePoint[]> {
    const res = await safe<{ monthlyVolume: MonthlyVolumePoint[] }>(withDate("/api/analytics/monthly-volume", date), {
      monthlyVolume: MONTHLY_VOLUME,
    });
    return res.monthlyVolume;
  }

  async getArrivalsVsDepartures(date?: string): Promise<ArrivalDeparturePoint[]> {
    const res = await safe<{ arrivalsVsDepartures: ArrivalDeparturePoint[] }>(
      withDate("/api/analytics/arrivals-vs-departures", date),
      { arrivalsVsDepartures: ARRIVALS_VS_DEPARTURES }
    );
    return res.arrivalsVsDepartures;
  }

  async getDelaysByAirline(date?: string): Promise<AirlineDelay[]> {
    const res = await safe<{ delaysByAirline: AirlineDelay[] }>(withDate("/api/analytics/delays-by-airline", date), {
      delaysByAirline: AIRLINE_DELAYS,
    });
    return res.delaysByAirline;
  }

  async getPeakHours(date?: string, days?: number): Promise<PeakHourBar[]> {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (days) params.set("days", String(days));
    const qs = params.toString();
    const res = await safe<{ peakHours: PeakHourBar[] }>(`/api/analytics/peak-hours${qs ? `?${qs}` : ""}`, {
      peakHours: peakHoursForWindow(days),
    });
    return res.peakHours;
  }

  async getHourlyTraffic(date?: string): Promise<HourlyTrafficPoint[]> {
    const res = await safe<{ hourlyTraffic: HourlyTrafficPoint[] }>(withDate("/api/analytics/hourly-traffic", date), {
      hourlyTraffic: HOURLY_TRAFFIC,
    });
    return res.hourlyTraffic;
  }
}

function withDate(path: string, date?: string): string {
  return date ? `${path}?date=${encodeURIComponent(date)}` : path;
}
