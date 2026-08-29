import { Destination } from "../models/Destination.js";
import { mapDestination } from "../utils/mappers.js";
import { computeDestinationAnalysis, computeAllDestinations } from "../services/biService.js";
import { asyncHandler } from "../middleware/auth.js";

/** GET /api/destinations/top — top by passengers (trailing 30 days ending at ?date=). */
export const getTopDestinations = asyncHandler(async (req, res) => {
  const { topDestinations } = await computeDestinationAnalysis(req.query.date);
  res.json({ topDestinations });
});

/** GET /api/destinations/regions — quarterly traffic per region. */
export const getTrafficByRegion = asyncHandler(async (req, res) => {
  const { trafficByRegion } = await computeDestinationAnalysis(req.query.date);
  res.json({ trafficByRegion });
});

/** GET /api/destinations — ALL destinations with real passenger counts from Flight table. */
export const listDestinations = asyncHandler(async (req, res) => {
  const allDestinations = await computeAllDestinations(req.query.date);
  res.json({ destinations: allDestinations });
});
