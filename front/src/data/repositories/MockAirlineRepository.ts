import type { Airline, AirlinePerformanceHighlights } from "@/core/domain/entities/Airline";
import type { AirlineRepository } from "@/core/domain/repositories/AirlineRepository";
import { AIRLINE_LEADERBOARD } from "@/data/mocks/airlines";

export class MockAirlineRepository implements AirlineRepository {
  async getLeaderboard(_date?: string): Promise<Airline[]> {
    return AIRLINE_LEADERBOARD;
  }

  async getHighlights(_date?: string): Promise<AirlinePerformanceHighlights> {
    return {
      bestPerformer: { name: "Tunisair", value: "94.2% Ponctualité", icon: "trophy", tone: "secondary" },
      worstDelay: { name: "Air France", value: "42 mins moy.", icon: "timer", tone: "error" },
      mostReliable: { name: "Nouvelair", value: "0.1% Taux d'annulation", icon: "verified", tone: "neutral" },
    };
  }
}
