import type {
  AirlineDelay,
  ArrivalDeparturePoint,
  HourlyTrafficPoint,
  MonthlyVolumePoint,
  PeakHourBar,
} from "@/core/domain/entities/Analytics";

export const MONTHLY_VOLUME: MonthlyVolumePoint[] = [
  { month: "Jan", value: 520 },
  { month: "Fév", value: 610 },
  { month: "Mar", value: 720 },
  { month: "Avr", value: 690 },
  { month: "Mai", value: 890 },
  { month: "Juin", value: 1020 },
  { month: "Juil", value: 1180 },
  { month: "Août", value: 1240 },
  { month: "Sep", value: 980 },
  { month: "Oct", value: 860 },
  { month: "Nov", value: 740 },
  { month: "Déc", value: 920 },
];

export const ARRIVALS_VS_DEPARTURES: ArrivalDeparturePoint[] = [
  { day: "Lun", arrivals: 60, departures: 55 },
  { day: "Mar", arrivals: 75, departures: 80 },
  { day: "Mer", arrivals: 40, departures: 45 },
  { day: "Jeu", arrivals: 90, departures: 85 },
  { day: "Ven", arrivals: 70, departures: 75 },
  { day: "Sam", arrivals: 95, departures: 90 },
  { day: "Dim", arrivals: 65, departures: 60 },
];

export const AIRLINE_DELAYS: AirlineDelay[] = [
  { code: "AFR", minutes: 45, barWidth: 85, barColor: "bg-error" },
  { code: "TUN", minutes: 32, barWidth: 60, barColor: "bg-secondary" },
  { code: "LHA", minutes: 24, barWidth: 45, barColor: "bg-secondary" },
  { code: "EZY", minutes: 16, barWidth: 30, barColor: "bg-primary-container" },
  { code: "RYR", minutes: 8, barWidth: 15, barColor: "bg-primary-container" },
];

export const PEAK_HOURS: PeakHourBar[] = [
  { hour: 0, density: 10, peak: false },
  { hour: 1, density: 5, peak: false },
  { hour: 2, density: 15, peak: false },
  { hour: 3, density: 25, peak: false },
  { hour: 4, density: 40, peak: false },
  { hour: 5, density: 80, peak: false },
  { hour: 6, density: 95, peak: false },
  { hour: 7, density: 100, peak: false },
  { hour: 8, density: 60, peak: false },
  { hour: 9, density: 45, peak: false },
  { hour: 10, density: 30, peak: false },
  { hour: 11, density: 70, peak: false },
  { hour: 12, density: 85, peak: false },
  { hour: 13, density: 50, peak: false },
  { hour: 14, density: 20, peak: false },
  { hour: 15, density: 10, peak: false },
  { hour: 16, density: 35, peak: false },
  { hour: 17, density: 55, peak: false },
  { hour: 18, density: 75, peak: false },
  { hour: 19, density: 65, peak: false },
  { hour: 20, density: 45, peak: false },
  { hour: 21, density: 30, peak: false },
  { hour: 22, density: 20, peak: false },
  { hour: 23, density: 12, peak: false },
];

/** Offline fallback so "Auj" (1 day) vs "Sem" (7 days) stay visually distinct without the API. */
export function peakHoursForWindow(days = 30): PeakHourBar[] {
  if (days <= 1) {
    return PEAK_HOURS.map((b) => ({ ...b, density: Math.min(100, Math.round(b.density * 1.15)) }));
  }
  if (days <= 7) {
    const avg = PEAK_HOURS.reduce((acc, b) => acc + b.density, 0) / PEAK_HOURS.length;
    return PEAK_HOURS.map((b) => ({ ...b, density: Math.round((b.density + avg) / 2), peak: false }));
  }
  return PEAK_HOURS;
}

export const HOURLY_TRAFFIC: HourlyTrafficPoint[] = [
  { label: "06h", departures: 22, arrivals: 18 },
  { label: "08h", departures: 34, arrivals: 28 },
  { label: "10h", departures: 41, arrivals: 36 },
  { label: "12h", departures: 38, arrivals: 44 },
  { label: "14h", departures: 52, arrivals: 40 },
  { label: "16h", departures: 61, arrivals: 55 },
  { label: "18h", departures: 58, arrivals: 64 },
  { label: "20h", departures: 72, arrivals: 68 },
];
