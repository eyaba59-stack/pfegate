/**
 * Core domain entity representing an airline operating at MIR.
 */

export interface Airline {
  code: string;
  name: string;
  totalFlights: number;
  punctuality: number;
  cancellations: number;
  score: number;
  scoreBarWidth: number;
  scoreBarColor: string;
}

export interface AirlinePerformanceHighlights {
  bestPerformer: { name: string; value: string; icon: string; tone: "secondary" };
  worstDelay: { name: string; value: string; icon: string; tone: "error" };
  mostReliable: { name: string; value: string; icon: string; tone: "neutral" };
}
