import { Destination } from "../models/Destination.js";
import { mapDestination } from "../utils/mappers.js";
import { computeDestinationAnalysis } from "../services/biService.js";
import { asyncHandler } from "../middleware/auth.js";

/** GET /api/destinations/top — top 5 by passengers (trailing 30 days ending at ?date=). */
export const getTopDestinations = asyncHandler(async (req, res) => {
  const { topDestinations } = await computeDestinationAnalysis(req.query.date);
  res.json({ topDestinations });
});

/** GET /api/destinations/regions — quarterly traffic per region. */
export const getTrafficByRegion = asyncHandler(async (req, res) => {
  const { trafficByRegion } = await computeDestinationAnalysis(req.query.date);
  res.json({ trafficByRegion });
});

/** GET /api/destinations — all destination dimension rows. */
export const listDestinations = asyncHandler(async (_req, res) => {
  const destinations = await Destination.find().sort({ rank: 1 }).lean();
  res.json({ destinations: destinations.map(mapDestination) });
});
