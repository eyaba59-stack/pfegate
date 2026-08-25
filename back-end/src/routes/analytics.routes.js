import { Router } from "express";
import {
  getMonthlyVolume,
  getArrivalsVsDepartures,
  getDelaysByAirline,
  getPeakHours,
  getHourlyTraffic,
} from "../controllers/analyticsController.js";
import { asyncHandler } from "../middleware/auth.js";

const router = Router();

router.get("/monthly-volume", asyncHandler(getMonthlyVolume));
router.get("/arrivals-vs-departures", asyncHandler(getArrivalsVsDepartures));
router.get("/delays-by-airline", asyncHandler(getDelaysByAirline));
router.get("/peak-hours", asyncHandler(getPeakHours));
router.get("/hourly-traffic", asyncHandler(getHourlyTraffic));

export default router;
