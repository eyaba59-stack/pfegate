import type { Airline } from "@/core/domain/entities/Airline";

export const AIRLINE_LEADERBOARD: Airline[] = [
  {
    code: "TU",
    name: "Tunisair",
    totalFlights: 1245,
    punctuality: 94.2,
    cancellations: 0.3,
    score: 96,
    scoreBarWidth: 96,
    scoreBarColor: "bg-secondary",
  },
  {
    code: "BJ",
    name: "Nouvelair",
    totalFlights: 890,
    punctuality: 91.5,
    cancellations: 0.1,
    score: 92,
    scoreBarWidth: 92,
    scoreBarColor: "bg-secondary",
  },
  {
    code: "LH",
    name: "Lufthansa",
    totalFlights: 420,
    punctuality: 85.0,
    cancellations: 1.2,
    score: 82,
    scoreBarWidth: 82,
    scoreBarColor: "bg-outline",
  },
  {
    code: "AF",
    name: "Air France",
    totalFlights: 650,
    punctuality: 72.4,
    cancellations: 3.5,
    score: 65,
    scoreBarWidth: 65,
    scoreBarColor: "bg-error",
  },
];
