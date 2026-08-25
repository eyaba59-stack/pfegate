import type { Flight, FlightFilters } from "@/core/domain/entities/Flight";
import type { DashboardOverview, FlightRepository } from "@/core/domain/repositories/FlightRepository";
import { ApiError, safe, serverFetch } from "@/config/serverApi";
import { generateFlights } from "@/data/mocks/flights";

const MOCK_FLIGHTS = generateFlights(124);

interface FlightListResponse {
  flights: Flight[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export class ApiFlightRepository implements FlightRepository {
  async getToday(date?: string): Promise<Flight[]> {
    const path = date ? `/api/flights/today?date=${encodeURIComponent(date)}` : "/api/flights/today";
    const res = await safe<{ flights: Flight[] }>(path, { flights: MOCK_FLIGHTS });
    return res.flights;
  }

  async list(filters: FlightFilters = {}): Promise<Flight[]> {
    const params = new URLSearchParams();
    if (filters.flightNumber) params.set("flightNumber", filters.flightNumber);
    if (filters.airlineCode) params.set("airlineCode", filters.airlineCode);
    if (filters.status) params.set("status", filters.status);
    if (filters.type) params.set("type", filters.type);
    if (filters.date) params.set("date", filters.date);
    params.set("limit", "200");

    const qs = params.toString();
    const res = await safe<FlightListResponse>(`/api/flights${qs ? `?${qs}` : ""}`, {
      flights: filterMocks(filters),
      pagination: { page: 1, limit: 200, total: filterMocks(filters).length, totalPages: 1 },
    });
    return res.flights;
  }

  async getById(id: string): Promise<Flight | null> {
    try {
      const res = await serverFetch<{ flight: Flight }>(`/api/flights/${encodeURIComponent(id)}`);
      return res.flight;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  }

  async getDashboardOverview(date?: string): Promise<DashboardOverview | null> {
    const path = date ? `/api/dashboard/overview?date=${encodeURIComponent(date)}` : "/api/dashboard/overview";
    return safe<DashboardOverview | null>(path, null);
  }
}

function filterMocks(filters: FlightFilters): Flight[] {
  return MOCK_FLIGHTS.filter((f) => {
    if (filters.flightNumber && !f.flightNumber.toUpperCase().includes(filters.flightNumber.toUpperCase())) return false;
    if (filters.airlineCode && f.airline.code !== filters.airlineCode) return false;
    if (filters.status && f.status !== filters.status) return false;
    if (filters.type && f.type !== filters.type) return false;
    return true;
  });
}
