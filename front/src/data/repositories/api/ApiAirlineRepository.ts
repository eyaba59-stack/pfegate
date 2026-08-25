import type { Airline, AirlinePerformanceHighlights } from "@/core/domain/entities/Airline";
import type { AirlineRepository } from "@/core/domain/repositories/AirlineRepository";
import { safe } from "@/config/serverApi";
import { AIRLINE_LEADERBOARD } from "@/data/mocks/airlines";

const MOCK_HIGHLIGHTS: AirlinePerformanceHighlights = {
  bestPerformer: { name: "Tunisair", value: "94.2% Ponctualité", icon: "trophy", tone: "secondary" },
  worstDelay: { name: "Air France", value: "42 mins moy.", icon: "timer", tone: "error" },
  mostReliable: { name: "Nouvelair", value: "0.1% Taux d'annulation", icon: "verified", tone: "neutral" },
};

export class ApiAirlineRepository implements AirlineRepository {
  async getLeaderboard(date?: string): Promise<Airline[]> {
    const path = date ? `/api/airlines/leaderboard?date=${encodeURIComponent(date)}` : "/api/airlines/leaderboard";
    const res = await safe<{ leaderboard: Airline[] }>(path, {
      leaderboard: AIRLINE_LEADERBOARD,
    });
    return res.leaderboard;
  }

  async getHighlights(date?: string): Promise<AirlinePerformanceHighlights> {
    const path = date ? `/api/airlines/highlights?date=${encodeURIComponent(date)}` : "/api/airlines/highlights";
    const res = await safe<{ highlights: AirlinePerformanceHighlights }>(path, {
      highlights: MOCK_HIGHLIGHTS,
    });
    return res.highlights;
  }
}
