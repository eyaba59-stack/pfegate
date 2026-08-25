import { Flight } from "../models/Flight.js";
import { mapFlight } from "../utils/mappers.js";
import { asyncHandler } from "../middleware/auth.js";

const allowed = { status: 1, type: 1, airlineCode: 1, flightNumber: 1, date: 1 };

/**
 * GET /api/flights?flightNumber=&airlineCode=&status=&type=&date=&page=&limit=
 * Paginated operational feed with filters (mirrors FlightExplorer).
 */
export const listFlights = asyncHandler(async (req, res) => {
  const { flightNumber, airlineCode, status, type, date, page = 1, limit = 25 } = req.query;

  const q = {};
  if (flightNumber) q.flightNumber = new RegExp(String(flightNumber).toUpperCase(), "i");
  if (airlineCode) q.airlineCode = String(airlineCode);
  if (allowed.status && status) q.status = String(status);
  if (allowed.type && type) q.type = String(type);
  if (date) q.date = String(date);

  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(200, Math.max(1, parseInt(limit, 10) || 25));
  const skip = (p - 1) * l;

  const [flights, total] = await Promise.all([
    Flight.find(q).sort({ scheduledTime: 1 }).skip(skip).limit(l).lean(),
    Flight.countDocuments(q),
  ]);

  res.json({
    flights: flights.map(mapFlight),
    pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
  });
});

/** GET /api/flights/today?date=YYYY-MM-DD — schedule (unpaginated, falls back to latest date). */
export const getToday = asyncHandler(async (req, res) => {
  let date = req.query.date || new Date().toISOString().slice(0, 10);
  let flights = await Flight.find({ date }).sort({ scheduledTime: 1 }).lean();
  if (flights.length === 0) {
    const latest = await Flight.findOne().sort({ scheduledDateTime: -1 }).select({ date: 1 }).lean();
    if (latest?.date) {
      date = latest.date;
      flights = await Flight.find({ date }).sort({ scheduledTime: 1 }).lean();
    }
  }
  res.json({ flights: flights.map(mapFlight) });
});

/** GET /api/flights/:id */
export const getFlightById = asyncHandler(async (req, res) => {
  const flight = await Flight.findOne({ flightId: req.params.id }).lean();
  if (!flight) return res.status(404).json({ error: `Vol ${req.params.id} introuvable.` });
  res.json({ flight: mapFlight(flight) });
});
