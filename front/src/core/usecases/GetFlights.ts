import type { Flight, FlightFilters } from "@/core/domain/entities/Flight";
import type { FlightRepository } from "@/core/domain/repositories/FlightRepository";

export interface FlightListResult {
  flights: Flight[];
  total: number;
}

/**
 * Use case: query the flight list with optional operational filters.
 */
export class GetFlights {
  constructor(private readonly flightRepository: FlightRepository) {}

  async execute(filters: FlightFilters = {}): Promise<FlightListResult> {
    const flights = await this.flightRepository.list(filters);
    return { flights, total: flights.length };
  }
}
