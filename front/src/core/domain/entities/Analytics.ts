/**
 * Core domain entity for BI analytics widgets.
 */

export interface MonthlyVolumePoint {
  month: string;
  value: number;
}

export interface ArrivalDeparturePoint {
  day: string;
  arrivals: number;
  departures: number;
}

export interface AirlineDelay {
  code: string;
  minutes: number;
  barWidth: number;
  barColor: string;
}

export interface PeakHourBar {
  hour: number;
  density: number;
  peak: boolean;
}

/** Arrivals vs departures bucketed every 2h (06h -> 20h) for a given day. */
export interface HourlyTrafficPoint {
  label: string;
  departures: number;
  arrivals: number;
}
