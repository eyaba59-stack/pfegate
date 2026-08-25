import type { Flight } from "@/core/domain/entities/Flight";
import type { KpiMetric } from "@/core/domain/entities/KpiMetric";
import type { DashboardOverview, FlightRepository } from "@/core/domain/repositories/FlightRepository";

/**
 * Use case: aggregate the metrics and live feed shown on the main dashboard.
 * Prefers the backend-computed overview (KPIs + live feed); falls back to
 * deriving the KPIs from the today's flight list when the API is unreachable.
 */
export class GetDashboardOverview {
  constructor(private readonly flightRepository: FlightRepository) {}

  async execute(date?: string): Promise<DashboardOverview> {
    const backend = await this.flightRepository.getDashboardOverview(date);
    if (backend) return backend;

    const flights = await this.flightRepository.getToday(date);
    return {
      kpis: this.computeKpis(flights),
      liveFlights: flights.slice(0, 5),
    };
  }

  private computeKpis(flights: Flight[]): KpiMetric[] {
    return [
      {
        label: "Vols Aujourd'hui",
        value: String(flights.length),
        icon: "flight",
        tone: "default",
      },
      {
        label: "Arrivées",
        value: String(flights.filter((f) => f.type === "ARRIVAL").length),
        icon: "flight_land",
        tone: "default",
      },
      {
        label: "Départs",
        value: String(flights.filter((f) => f.type === "DEPARTURE").length),
        icon: "flight_takeoff",
        tone: "default",
      },
      {
        label: "Retardés",
        value: String(flights.filter((f) => f.status === "DELAYED").length),
        icon: "timer",
        tone: "warning",
      },
      {
        label: "Annulés",
        value: String(flights.filter((f) => f.status === "CANCELLED").length),
        icon: "cancel",
        tone: "error",
      },
      {
        label: "Ponctualité",
        value: this.computePunctuality(flights),
        icon: "check_circle",
        tone: "success",
        unit: "%",
      },
    ];
  }

  private computePunctuality(flights: Flight[]): string {
    if (flights.length === 0) return "0";
    const onTime = flights.filter((f) => f.status === "ON_TIME" || f.status === "BOARDING").length;
    return String(Math.round((onTime / flights.length) * 100));
  }
}
