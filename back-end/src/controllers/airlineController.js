import { Airline } from "../models/Airline.js";
import { mapAirline } from "../utils/mappers.js";
import { computeAirlinePerformance } from "../services/biService.js";
import { asyncHandler } from "../middleware/auth.js";

/** GET /api/airlines — cached dimension list. */
export const listAirlines = asyncHandler(async (_req, res) => {
  const airlines = await Airline.find().sort({ totalFlights: -1 }).lean();
  res.json({ airlines: airlines.map(mapAirline) });
});

/** GET /api/airlines/leaderboard — BI-computed ranking (30-day window ending at ?date=). */
export const getLeaderboard = asyncHandler(async (req, res) => {
  const { leaderboard } = await computeAirlinePerformance(req.query.date);
  res.json({ leaderboard });
});

/** GET /api/airlines/highlights — best performer / worst delay / most reliable. */
export const getHighlights = asyncHandler(async (req, res) => {
  const { highlights } = await computeAirlinePerformance(req.query.date);
  res.json({ highlights });
});
