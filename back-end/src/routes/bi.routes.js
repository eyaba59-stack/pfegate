import { Router } from "express";
import {
  kpis,
  flightFacts,
  airlineDimension,
  destinationDimension,
  dailyCube,
  monthlyCube,
  weeklyCube,
  delaysCube,
  peakHoursCube,
  leaderboard,
  destinations,
  fullDataset,
  exportCsv,
} from "../controllers/biController.js";
import { apiKeyGuard } from "../middleware/apiKey.js";
import { asyncHandler } from "../middleware/auth.js";

const router = Router();

// Optional key guard for all /api/bi/* endpoints
router.use(apiKeyGuard);

router.get("/kpis", asyncHandler(kpis));
router.get("/facts/flights", asyncHandler(flightFacts));
router.get("/dimensions/airlines", asyncHandler(airlineDimension));
router.get("/dimensions/destinations", asyncHandler(destinationDimension));
router.get("/cube/daily", asyncHandler(dailyCube));
router.get("/cube/monthly", asyncHandler(monthlyCube));
router.get("/cube/weekly", asyncHandler(weeklyCube));
router.get("/cube/delays", asyncHandler(delaysCube));
router.get("/cube/peak-hours", asyncHandler(peakHoursCube));
router.get("/leaderboard", asyncHandler(leaderboard));
router.get("/destinations", asyncHandler(destinations));
router.get("/dataset", asyncHandler(fullDataset));
router.get("/export/:kind", asyncHandler(exportCsv));

export default router;
