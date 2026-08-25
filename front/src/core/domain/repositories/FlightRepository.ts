/**
 * Abstraction of the flight data source. Implementations may use a real API,
 * a database or in-memory mocks. The domain/usecase layer only depends on this.
 */
import type { Flight, FlightFilters } from "@/core/domain/entities/Flight";
import type { KpiMetric } from "@/core/domain/entities/KpiMetric";

/** Backend-computed dashboard overview (KPIs + live feed). */
export interface DashboardOverview {
  kpis: KpiMetric[];
  liveFlights: Flight[];
}

export interface FlightRepository {
  getToday(date?: string): Promise<Flight[]>;
  list(filters?: FlightFilters): Promise<Flight[]>;
  getById(id: string): Promise<Flight | null>;
  getDashboardOverview(date?: string): Promise<DashboardOverview | null>;
}
