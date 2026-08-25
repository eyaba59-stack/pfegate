import type { Airline, AirlinePerformanceHighlights } from "@/core/domain/entities/Airline";
import type { AirlineRepository } from "@/core/domain/repositories/AirlineRepository";

export interface AirlinePerformance {
  leaderboard: Airline[];
  highlights: AirlinePerformanceHighlights;
}

/**
 * Use case: build the airlines performance view (leaderboard + highlights).
 */
export class GetAirlinePerformance {
  constructor(private readonly airlineRepository: AirlineRepository) {}

  async execute(date?: string): Promise<AirlinePerformance> {
    const [leaderboard, highlights] = await Promise.all([
      this.airlineRepository.getLeaderboard(date),
      this.airlineRepository.getHighlights(date),
    ]);
    return { leaderboard, highlights };
  }
}
