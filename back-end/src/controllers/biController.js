import {
  buildBiDataset,
  computeDashboardOverview,
  computeMonthlyVolume,
  computeArrivalsVsDepartures,
  computeDelaysByAirline,
  computePeakHours,
  computeAirlinePerformance,
  computeDestinationAnalysis,
  getFlightFacts,
  dataTodayStr,
} from "../services/biService.js";
import { DailyStat } from "../models/DailyStat.js";
import { Airline } from "../models/Airline.js";
import { Destination } from "../models/Destination.js";
import { asyncHandler } from "../middleware/auth.js";

/* ---------------------------------------------------------------------- *
 *  Power BI endpoints.
 *
 *  Power BI Desktop -> Get Data -> Web -> JSON URL. Each endpoint below
 *  returns a flat, tabular JSON array (or an object of flat arrays) that
 *  Power BI can expand into tables. The /api/bi/* endpoints are publicly
 *  reachable (optionally key-protected via x-api-key).
 * ---------------------------------------------------------------------- */

/** GET /api/bi/kpis — today's KPI cards. */
export const kpis = asyncHandler(async (req, res) => {
  const { kpis } = await computeDashboardOverview(req.query.date || (await dataTodayStr()));
  res.json({ kpis });
});

/** GET /api/bi/facts/flights?from=&to= — flight fact table (tabular). */
export const flightFacts = asyncHandler(async (req, res) => {
  const facts = await getFlightFacts({ from: req.query.from, to: req.query.to });
  res.json({ flights: facts });
});

/** GET /api/bi/dimensions/airlines — airline dimension table. */
export const airlineDimension = asyncHandler(async (_req, res) => {
  const airlines = await Airline.find().sort({ totalFlights: -1 }).lean();
  res.json({
    airlines: airlines.map((a) => ({
      code: a.code,
      iata: a.iata,
      name: a.name,
      country: a.country,
      totalFlights: a.totalFlights,
      punctuality: a.punctuality,
      cancellations: a.cancellations,
      avgDelayMinutes: a.avgDelayMinutes,
      avgLoadFactor: a.avgLoadFactor,
      score: a.score,
    })),
  });
});

/** GET /api/bi/dimensions/destinations — destination dimension table. */
export const destinationDimension = asyncHandler(async (_req, res) => {
  const destinations = await Destination.find().sort({ rank: 1 }).lean();
  res.json({
    destinations: destinations.map((d) => ({
      code: d.code,
      city: d.city,
      country: d.country,
      region: d.region,
      passengers: d.passengers,
      flightsCount: d.flightsCount,
      onTimeRate: d.onTimeRate,
      lat: d.lat,
      lng: d.lng,
    })),
  });
});

/** GET /api/bi/cube/daily — pre-aggregated daily cube. */
export const dailyCube = asyncHandler(async (_req, res) => {
  const rows = await DailyStat.find().sort({ date: 1 }).lean();
  res.json({ daily: rows });
});

/** GET /api/bi/cube/monthly — 12-month flight volume ending at ?date=. */
export const monthlyCube = asyncHandler(async (req, res) => {
  res.json({ monthly: await computeMonthlyVolume(req.query.date) });
});

/** GET /api/bi/cube/weekly — arrivals vs departures per weekday ending at ?date=. */
export const weeklyCube = asyncHandler(async (req, res) => {
  res.json({ arrivalsVsDepartures: await computeArrivalsVsDepartures(req.query.date) });
});

/** GET /api/bi/cube/delays — average delay per airline (trailing 30 days ending at ?date=). */
export const delaysCube = asyncHandler(async (req, res) => {
  res.json({ delaysByAirline: await computeDelaysByAirline(req.query.date) });
});

/** GET /api/bi/cube/peak-hours — hourly density (trailing 30 days ending at ?date=). */
export const peakHoursCube = asyncHandler(async (req, res) => {
  res.json({ peakHours: await computePeakHours(req.query.date) });
});

/** GET /api/bi/leaderboard — airline scoring (trailing 30 days ending at ?date=). */
export const leaderboard = asyncHandler(async (req, res) => {
  const { leaderboard } = await computeAirlinePerformance(req.query.date);
  res.json({ leaderboard });
});

/** GET /api/bi/destinations — top destinations analysis (trailing 30 days ending at ?date=). */
export const destinations = asyncHandler(async (req, res) => {
  const data = await computeDestinationAnalysis(req.query.date);
  res.json(data);
});

/**
 * GET /api/bi/dataset?from=&to= — one-shot star-schema payload.
 * Best for Power BI: import this single JSON and expand facts/dimensions/cubes.
 */
export const fullDataset = asyncHandler(async (req, res) => {
  const dataset = await buildBiDataset({ from: req.query.from, to: req.query.to });
  res.json(dataset);
});

/**
 * GET /api/bi/export/flights?format=csv — CSV download for Power BI / Excel.
 * Supported: flights, daily, monthly, weekly, delays, peak-hours, airlines, destinations.
 */
export const exportCsv = asyncHandler(async (req, res) => {
  const kind = req.params.kind;
  const rows = await collectRows(kind, req.query);
  if (!rows) return res.status(400).json({ error: `Collection "${kind}" inconnue.` });

  const csv = toCsv(rows);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="mir_bi_${kind}.csv"`);
  res.send(`\uFEFF${csv}`);
});

async function collectRows(kind, query) {
  switch (kind) {
    case "flights":
      return getFlightFacts({ from: query.from, to: query.to });
    case "daily":
      return DailyStat.find().sort({ date: 1 }).lean();
    case "monthly":
      return computeMonthlyVolume(query.date);
    case "weekly":
      return computeArrivalsVsDepartures(query.date);
    case "delays":
      return computeDelaysByAirline(query.date);
    case "peak-hours":
      return computePeakHours(query.date);
    case "airlines":
      return (await Airline.find().lean()).map((a) => ({
        code: a.code, iata: a.iata, name: a.name, country: a.country,
        totalFlights: a.totalFlights, punctuality: a.punctuality,
        cancellations: a.cancellations, avgDelayMinutes: a.avgDelayMinutes,
        avgLoadFactor: a.avgLoadFactor, score: a.score,
      }));
    case "destinations":
      return (await Destination.find().sort({ rank: 1 }).lean()).map((d) => ({
        code: d.code, city: d.city, country: d.country, region: d.region,
        passengers: d.passengers, flightsCount: d.flightsCount, onTimeRate: d.onTimeRate,
      }));
    default:
      return null;
  }
}

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = rows.map((r) =>
    headers.map((h) => String(r[h] ?? "").replace(/(\r\n|\n|\r|")/g, " ")).join(";")
  );
  return [headers.join(";"), ...lines].join("\r\n");
}
