/**
 * Core domain entity representing a flight at Monastir International Airport.
 * Framework-agnostic — must not depend on Next.js / React.
 */

export enum FlightType {
  ARRIVAL = "ARRIVAL",
  DEPARTURE = "DEPARTURE",
}

export enum FlightStatus {
  ON_TIME = "ON_TIME",
  DELAYED = "DELAYED",
  CANCELLED = "CANCELLED",
  BOARDING = "BOARDING",
}

export interface AirlineRef {
  code: string;
  name: string;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: AirlineRef;
  type: FlightType;
  origin: string;
  destination: string;
  scheduledTime: string;
  actualTime: string | null;
  status: FlightStatus;
  delayMinutes: number | null;
}

export interface FlightFilters {
  flightNumber?: string;
  date?: string;
  airlineCode?: string;
  status?: FlightStatus | "";
  type?: FlightType | "";
}
