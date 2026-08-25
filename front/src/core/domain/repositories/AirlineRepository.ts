import type { Airline, AirlinePerformanceHighlights } from "@/core/domain/entities/Airline";

export interface AirlineRepository {
  getLeaderboard(date?: string): Promise<Airline[]>;
  getHighlights(date?: string): Promise<AirlinePerformanceHighlights>;
}
