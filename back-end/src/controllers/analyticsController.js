import {
  computeMonthlyVolume,
  computeArrivalsVsDepartures,
  computeDelaysByAirline,
  computePeakHours,
  computeHourlyTraffic,
  dataTodayStr,
} from "../services/biService.js";
import { asyncHandler } from "../middleware/auth.js";

export const getMonthlyVolume = asyncHandler(async (req, res) => {
  res.json({ monthlyVolume: await computeMonthlyVolume(req.query.date) });
});

export const getArrivalsVsDepartures = asyncHandler(async (req, res) => {
  res.json({ arrivalsVsDepartures: await computeArrivalsVsDepartures(req.query.date) });
});

export const getDelaysByAirline = asyncHandler(async (req, res) => {
  res.json({ delaysByAirline: await computeDelaysByAirline(req.query.date) });
});

export const getPeakHours = asyncHandler(async (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 30);
  res.json({ peakHours: await computePeakHours(req.query.date, days) });
});

export const getHourlyTraffic = asyncHandler(async (req, res) => {
  const date = req.query.date || (await dataTodayStr());
  res.json({ hourlyTraffic: await computeHourlyTraffic(date) });
});
