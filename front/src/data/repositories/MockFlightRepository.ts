import type { Flight, FlightFilters } from "@/core/domain/entities/Flight";
import type { DashboardOverview, FlightRepository } from "@/core/domain/repositories/FlightRepository";
import { generateFlights } from "@/data/mocks/flights";

/**
 * In-memory implementation backed by mock data. Swapping this for a remote
 * implementation must not affect the domain / use case layer.
 */
export class MockFlightRepository implements FlightRepository {
  private readonly cache: Flight[] = generateFlights(124);

  async getToday(_date?: string): Promise<Flight[]> {
    return this.cache;
  }

  async list(filters: FlightFilters = {}): Promise<Flight[]> {
    let result = [...this.cache];

    if (filters.flightNumber) {
      const q = filters.flightNumber.trim().toUpperCase();
      result = result.filter((f) => f.flightNumber.toUpperCase().includes(q));
    }
    if (filters.airlineCode) {
      result = result.filter((f) => f.airline.code === filters.airlineCode);
    }
    if (filters.status) {
      result = result.filter((f) => f.status === filters.status);
    }
    if (filters.type) {
      result = result.filter((f) => f.type === filters.type);
    }

    return result;
  }

  async getById(id: string): Promise<Flight | null> {
    return this.cache.find((f) => f.id === id) ?? null;
  }

  async getDashboardOverview(_date?: string): Promise<DashboardOverview | null> {
    const flights = this.cache;
    const onTime = flights.filter((f) => f.status === "ON_TIME" || f.status === "BOARDING").length;
    return {
      kpis: [
        { label: "Vols Aujourd'hui", value: String(flights.length), icon: "flight", tone: "default" },
        { label: "Arrivées", value: String(flights.filter((f) => f.type === "ARRIVAL").length), icon: "flight_land", tone: "default" },
        { label: "Départs", value: String(flights.filter((f) => f.type === "DEPARTURE").length), icon: "flight_takeoff", tone: "default" },
        { label: "Retardés", value: String(flights.filter((f) => f.status === "DELAYED").length), icon: "timer", tone: "warning" },
        { label: "Annulés", value: String(flights.filter((f) => f.status === "CANCELLED").length), icon: "cancel", tone: "error" },
        { label: "Ponctualité", value: String(flights.length ? Math.round((onTime / flights.length) * 100) : 0), icon: "check_circle", tone: "success", unit: "%" },
      ],
      liveFlights: flights.slice(0, 5),
    };
  }
}
