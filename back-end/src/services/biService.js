import { Flight } from "../models/Flight.js";
import { DailyStat } from "../models/DailyStat.js";
import { Airline } from "../models/Airline.js";
import { Destination } from "../models/Destination.js";
import { RegionTraffic } from "../models/RegionTraffic.js";
import { mapFlight, mapFlightFacts } from "../utils/mappers.js";

/* ------------------------------------------------------------------------- *
 *  BI / analytics service.
 *
 *  All measures are computed from the Flight fact table using MongoDB
 *  aggregation pipelines, then shaped for both the dashboard widgets and the
 *  Power BI consumption endpoints (/api/bi/*).
 *
 *  Scoring formula (documented, reproducible in Power BI):
 *    punctualityRate   = onTime / total * 100
 *    cancellationRate  = cancelled / total * 100
 *    loadFactor        = passengers / capacity * 100 (avg)
 *    airlineScore      = round(0.6 * punctuality + 0.2 * (100 - min(cancel*4,25)) + 0.2 * loadFactor)
 * ------------------------------------------------------------------------- */

const FRENCH_MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const FRENCH_DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export const todayStr = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

/**
 * Reference date = the latest date present in the Flight fact table, so all
 * BI time-windows ("today", last 7 days, last 12 months) are anchored to the
 * data itself rather than the wall clock. This keeps the dashboard correct
 * even when the report is historical (e.g. all rows in 2025).
 */
export async function dataTodayStr() {
  const latest = await Flight.findOne().sort({ scheduledDateTime: -1 }).select({ date: 1 }).lean();
  return latest?.date || todayStr();
}

/**
 * Resolve the reference date for a BI window: an explicit `date` filter wins,
 * otherwise the latest date present in the Flight fact table. Every metric in
 * this service is anchored to this date so a user-selected date from the PBIX
 * drives all time windows (today, trailing 7/30 days, trailing 12 months).
 */
async function refDate(date) {
  return date || (await dataTodayStr());
}

/** Date range for a trailing window (days days) ending at (inclusive) ref. */
function rangeFor(ref, days) {
  const from = new Date(ref);
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);
  const to = new Date(ref);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

export const round = (n, p = 1) => {
  const f = 10 ** p;
  return Math.round(n * f) / f;
};

/* ----------------------------- KPIs ----------------------------- */

export async function computeDashboardOverview(date) {
  const targetDate = date || (await dataTodayStr());
  const start = new Date(`${targetDate}T00:00:00.000Z`);
  const end = new Date(`${targetDate}T23:59:59.999Z`);

  const [totals, liveFlightsRaw] = await Promise.all([
    Flight.aggregate([
      { $match: { scheduledDateTime: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          arrivals: { $sum: { $cond: [{ $eq: ["$type", "ARRIVAL"] }, 1, 0] } },
          departures: { $sum: { $cond: [{ $eq: ["$type", "DEPARTURE"] }, 1, 0] } },
          delayedCount: { $sum: { $cond: [{ $eq: ["$status", "DELAYED"] }, 1, 0] } },
          cancelledCount: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
          onTimeCount: { $sum: { $cond: [{ $in: ["$status", ["ON_TIME", "BOARDING"]] }, 1, 0] } },
          passengers: { $sum: "$passengers" },
          avgDelay: { $avg: { $ifNull: ["$delayMinutes", 0] } },
        },
      },
    ]),
    Flight.find({ scheduledDateTime: { $gte: start, $lte: end } })
      .sort({ scheduledTime: 1 })
      .limit(5)
      .lean(),
  ]);

  const t = totals[0] || { total: 0, arrivals: 0, departures: 0, delayedCount: 0, cancelledCount: 0, onTimeCount: 0, passengers: 0, avgDelay: 0 };

  const punctuality = t.total ? Math.round((t.onTimeCount / t.total) * 100) : 0;

  const kpis = [
    { label: "Vols (Aujourd'hui)", value: String(t.total), icon: "flight", tone: "default" },
    { label: "Arrivées", value: String(t.arrivals), icon: "flight_land", tone: "default" },
    { label: "Départs", value: String(t.departures), icon: "flight_takeoff", tone: "default" },
    { label: "Retardés", value: String(t.delayedCount), icon: "timer", tone: "warning" },
    { label: "Annulés", value: String(t.cancelledCount), icon: "cancel", tone: "error" },
    { label: "Ponctualité", value: String(punctuality), icon: "check_circle", tone: "success", unit: "%" },
  ];

  return { date: targetDate, kpis, liveFlights: liveFlightsRaw.map(mapFlight) };
}

/* --------------------------- Time series --------------------------- */

/** Monthly flight volume, last 12 months ending at the reference date. */
export async function computeMonthlyVolume(date) {
  const months = await Flight.aggregate([
    {
      $group: {
        _id: { year: { $year: "$scheduledDateTime" }, month: { $month: "$scheduledDateTime" } },
        value: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const byKey = new Map(months.map((m) => [`${m._id.year}-${m._id.month}`, m.value]));

  const ref = new Date(await refDate(date));
  const out = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    out.push({
      month: FRENCH_MONTHS[d.getMonth()],
      value: byKey.get(`${d.getFullYear()}-${d.getMonth() + 1}`) || 0,
    });
  }
  return out;
}

/** Arrivals vs departures for the last 7 days ending at the reference date, ordered Monday-first. */
export async function computeArrivalsVsDepartures(date) {
  const end = await refDate(date);
  const from = new Date(end);
  from.setDate(from.getDate() - 6);
  from.setHours(0, 0, 0, 0);

  const to = new Date(end);
  to.setHours(23, 59, 59, 999);

  const rows = await Flight.aggregate([
    { $match: { scheduledDateTime: { $gte: from, $lte: to } } },
    {
      $group: {
        _id: { $dayOfWeek: "$scheduledDateTime" }, // 1=Sunday .. 7=Saturday
        arrivals: { $sum: { $cond: [{ $eq: ["$type", "ARRIVAL"] }, 1, 0] } },
        departures: { $sum: { $cond: [{ $eq: ["$type", "DEPARTURE"] }, 1, 0] } },
      },
    },
  ]);

  const byDow = new Map(rows.map((r) => [r._id, r]));

  // Monday-first order: [2,3,4,5,6,7,1]
  const order = [2, 3, 4, 5, 6, 7, 1];
  return order.map((dow) => ({
    day: FRENCH_DAYS[dow % 7],
    arrivals: byDow.get(dow)?.arrivals || 0,
    departures: byDow.get(dow)?.departures || 0,
  }));
}

/** Average delay per airline (top 5), trailing 30 days ending at the reference date. */
export async function computeDelaysByAirline(date) {
  const { from, to } = rangeFor(await refDate(date), 30);
  const rows = await Flight.aggregate([
    { $match: { delayMinutes: { $gt: 0 }, scheduledDateTime: { $gte: from, $lte: to } } },
    {
      $group: {
        _id: "$airlineCode",
        minutes: { $avg: "$delayMinutes" },
      },
    },
    { $sort: { minutes: -1 } },
    { $limit: 5 },
  ]);

  const maxMin = Math.max(...rows.map((r) => r.minutes), 1);
  return rows.map((r) => ({
    code: r._id,
    minutes: round(r.minutes),
    barWidth: Math.round((r.minutes / maxMin) * 100),
    barColor: r.minutes >= 40 ? "bg-error" : r.minutes >= 20 ? "bg-secondary" : "bg-primary-container",
  }));
}

/** Traffic density per hour (0-23) as a percentage of the peak hour, trailing N days (default 30). */
export async function computePeakHours(date, days = 30) {
  const { from, to } = rangeFor(await refDate(date), days);
  const rows = await Flight.aggregate([
    { $match: { scheduledDateTime: { $gte: from, $lte: to } } },
    { $group: { _id: { $hour: "$scheduledDateTime" }, count: { $sum: 1 } } },
    { $sort: { "_id.hour": 1 } },
  ]);

  const byHour = new Map(rows.map((r) => [r._id, r.count]));
  const maxCount = Math.max(...rows.map((r) => r.count), 1);

  return Array.from({ length: 24 }, (_, hour) => {
    const count = byHour.get(hour) || 0;
    const density = Math.round((count / maxCount) * 100);
    return { hour, density, peak: density >= 80 };
  });
}

/** Arrivals vs departures for today, bucketed every 2h (06h -> 20h). */
export async function computeHourlyTraffic(date = todayStr()) {
  const latest = await Flight.findOne({ date }).sort({ scheduledDateTime: -1 }).select({ date: 1 }).lean();
  const target = latest?.date || (await Flight.findOne().sort({ scheduledDateTime: -1 }).select({ date: 1 }).lean())?.date || date;
  const rows = await Flight.aggregate([
    { $match: { date: target } },
    {
      $project: {
        type: 1,
        hour: { $toInt: { $substr: ["$scheduledTime", 0, 2] } },
      },
    },
    {
      $group: {
        _id: { type: "$type", bucket: { $floor: { $divide: ["$hour", 2] } } },
        count: { $sum: 1 },
      },
    },
  ]);

  const byBucket = new Map();
  for (const r of rows) {
    byBucket.set(`${r._id.type}-${r._id.bucket}`, r.count);
  }

  const bucketStarts = [6, 8, 10, 12, 14, 16, 18, 20];
  return bucketStarts.map((h) => {
    const bucket = Math.floor(h / 2);
    return {
      label: `${String(h).padStart(2, "0")}h`,
      departures: byBucket.get(`DEPARTURE-${bucket}`) || 0,
      arrivals: byBucket.get(`ARRIVAL-${bucket}`) || 0,
    };
  });
}

/* ----------------------- Airlines performance ----------------------- */

/** Leaderboard + highlights using the documented BI score formula, trailing 30 days. */
export async function computeAirlinePerformance(date) {
  const { from, to } = rangeFor(await refDate(date), 30);
  const stats = await Flight.aggregate([
    { $match: { scheduledDateTime: { $gte: from, $lte: to } } },
    {
      $group: {
        _id: "$airlineCode",
        name: { $first: "$airlineName" },
        totalFlights: { $sum: 1 },
        onTime: { $sum: { $cond: [{ $in: ["$status", ["ON_TIME", "BOARDING"]] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
        delayed: { $sum: { $cond: [{ $eq: ["$status", "DELAYED"] }, 1, 0] } },
        avgDelay: { $avg: { $ifNull: ["$delayMinutes", 0] } },
        passengers: { $sum: "$passengers" },
        capacity: { $sum: "$capacity" },
      },
    },
    { $sort: { totalFlights: -1 } },
  ]);

  const airlines = stats.map((s) => {
    const total = s.totalFlights || 1;
    const punctuality = round((s.onTime / total) * 100);
    const cancellations = round((s.cancelled / total) * 100);
    const loadFactor = s.capacity ? round((s.passengers / s.capacity) * 100) : 0;
    const score = round(
      0.6 * punctuality + 0.2 * (100 - Math.min(cancellations * 4, 25)) + 0.2 * loadFactor,
      0
    );
    return {
      code: s._id,
      name: s.name,
      totalFlights: s.totalFlights,
      punctuality,
      cancellations,
      avgDelayMinutes: round(s.avgDelay),
      avgLoadFactor: loadFactor,
      score,
      scoreBarWidth: score,
      scoreBarColor: score >= 90 ? "bg-secondary" : score >= 80 ? "bg-outline" : "bg-error",
    };
  });

  airlines.sort((a, b) => b.score - a.score);

  const best = [...airlines].sort((a, b) => b.score - a.score)[0];
  const worst = [...airlines].sort((a, b) => b.avgDelayMinutes - a.avgDelayMinutes)[0];
  const reliable = [...airlines].sort((a, b) => a.cancellations - b.cancellations)[0];

  const highlights = {
    bestPerformer: { name: best?.name || "—", value: `${best?.score ?? 0}/100`, icon: "emoji_events", tone: "secondary" },
    worstDelay: { name: worst?.name || "—", value: `${worst?.avgDelayMinutes ?? 0} min`, icon: "timer_off", tone: "error" },
    mostReliable: { name: reliable?.name || "—", value: `${reliable?.cancellations ?? 0}% annulés`, icon: "verified_user", tone: "neutral" },
  };

  return { leaderboard: airlines, highlights };
}

/* --------------------------- Destinations --------------------------- */

/** Top destinations by passengers + regional quarterly traffic, trailing 30 days. */
export async function computeDestinationAnalysis(date) {
  const { from, to } = rangeFor(await refDate(date), 30);
  const topRaw = await Flight.aggregate([
    { $match: { type: "DEPARTURE", destinationCode: { $nin: ["", null] }, scheduledDateTime: { $gte: from, $lte: to } } },
    {
      $group: {
        _id: { code: "$destinationCode", name: "$destination" },
        passengers: { $sum: "$passengers" },
        flights: { $sum: 1 },
        onTime: { $sum: { $cond: [{ $in: ["$status", ["ON_TIME", "BOARDING"]] }, 1, 0] } },
        capacity: { $sum: "$capacity" },
      },
    },
    { $sort: { passengers: -1 } },
    { $limit: 10 },
  ]);

  const totalPax = topRaw.reduce((acc, r) => acc + r.passengers, 0) || 1;

  const destinations = await Promise.all(
    topRaw.map(async (r, i) => {
      const dest = await Destination.findOne({ code: r._id.code }).lean();
      const code = dest?.code ?? r._id.code;
      const city = dest?.city ?? r._id.name.split(" (")[0];
      const country = dest?.country ?? "";
      const loadFactor = r.capacity ? Math.round((r.passengers / r.capacity) * 100) : 0;
      const onTimeRate = r.flights ? Math.round((r.onTime / r.flights) * 100) : 0;
      return {
        rank: i + 1,
        city,
        code,
        country,
        passengers: r.passengers,
        sharePercent: Math.round((r.passengers / totalPax) * 100),
        barColor: barColorForRank(i + 1),
        flightsCount: r.flights,
        avgLoadFactor: loadFactor,
        onTimeRate,
      };
    })
  );

  const regions = await RegionTraffic.find().sort({ region: 1 }).lean();
  const trafficByRegion = regions.map((r) => ({ region: r.region, q1: r.q1, q2: r.q2 }));

  return { topDestinations: destinations, trafficByRegion };
}

function barColorForRank(rank) {
  return ["bg-secondary", "bg-secondary-container", "bg-tertiary-fixed-dim", "bg-primary-fixed-dim", "bg-surface-variant"][rank - 1] || "bg-secondary";
}

/* ----------------------------- Cubes ----------------------------- */

/** Rebuild the DailyStat cube for a date range ending at the latest data date (idempotent). */
export async function rebuildDailyCubes(days = 120) {
  const endDate = await dataTodayStr();
  const from = new Date(endDate);
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  const to = new Date(endDate);
  to.setHours(23, 59, 59, 999);

  const rows = await Flight.aggregate([
    { $match: { scheduledDateTime: { $gte: from, $lte: to } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$scheduledDateTime" } },
        totalFlights: { $sum: 1 },
        arrivals: { $sum: { $cond: [{ $eq: ["$type", "ARRIVAL"] }, 1, 0] } },
        departures: { $sum: { $cond: [{ $eq: ["$type", "DEPARTURE"] }, 1, 0] } },
        onTime: { $sum: { $cond: [{ $in: ["$status", ["ON_TIME", "BOARDING"]] }, 1, 0] } },
        delayed: { $sum: { $cond: [{ $eq: ["$status", "DELAYED"] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
        boarding: { $sum: { $cond: [{ $eq: ["$status", "BOARDING"] }, 1, 0] } },
        passengers: { $sum: "$passengers" },
        avgDelay: { $avg: { $ifNull: ["$delayMinutes", 0] } },
        loadFactor: { $avg: "$loadFactor" },
        airlines: { $addToSet: "$airlineCode" },
        routes: { $addToSet: { $concat: ["$originCode", "-", "$destinationCode"] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const ops = rows.map((r) => ({
    updateOne: {
      filter: { date: r._id },
      update: {
        $set: {
          date: r._id,
          dayName: FRENCH_DAYS[new Date(`${r._id}T00:00:00.000Z`).getUTCDay()],
          totalFlights: r.totalFlights,
          arrivals: r.arrivals,
          departures: r.departures,
          onTime: r.onTime,
          delayed: r.delayed,
          cancelled: r.cancelled,
          boarding: r.boarding,
          punctualityRate: r.totalFlights ? round((r.onTime / r.totalFlights) * 100) : 0,
          avgDelayMinutes: round(r.avgDelay),
          passengers: r.passengers,
          activeAirlines: r.airlines.length,
          activeRoutes: r.routes.length,
          avgLoadFactor: round(r.loadFactor),
        },
      },
      upsert: true,
    },
  }));

  if (ops.length) await DailyStat.bulkWrite(ops);

  // Purge stale cube rows (dates that no longer have any flights), otherwise
  // old rows survive re-seeds and inflate /api/bi/cube/daily.
  const activeDates = rows.map((r) => r._id);
  if (activeDates.length) {
    await DailyStat.deleteMany({ date: { $nin: activeDates } });
  }
  return ops.length;
}

/* ------------------------ Power BI datasets ------------------------ */

export async function getFlightFacts({ from, to, limit = 100000 } = {}) {
  const q = {};
  if (from || to) {
    q.scheduledDateTime = {};
    if (from) q.scheduledDateTime.$gte = new Date(`${from}T00:00:00.000Z`);
    if (to) q.scheduledDateTime.$lte = new Date(`${to}T23:59:59.999Z`);
  }
  const rows = await Flight.find(q).sort({ scheduledDateTime: 1 }).limit(limit).lean();
  return mapFlightFacts(rows);
}

/** Complete star-schema payload for a one-shot Power BI import. */
export async function buildBiDataset({ from, to } = {}) {
  const facts = await getFlightFacts({ from, to });
  const [airlines, destinations, daily, monthly, arrivalsVsDep, delays, peakHours] = await Promise.all([
    Airline.find().sort({ totalFlights: -1 }).lean(),
    Destination.find().sort({ rank: 1 }).lean(),
    DailyStat.find().sort({ date: 1 }).lean(),
    computeMonthlyVolume(),
    computeArrivalsVsDepartures(),
    computeDelaysByAirline(),
    computePeakHours(),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    range: { from: from || null, to: to || null },
    facts: { flights: facts },
    dimensions: {
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
      destinations: destinations.map((d) => ({
        code: d.code,
        city: d.city,
        country: d.country,
        region: d.region,
        passengers: d.passengers,
        flightsCount: d.flightsCount,
        onTimeRate: d.onTimeRate,
      })),
    },
    cubes: {
      daily,
      monthly: monthly.map((m) => ({ ...m, year: new Date().getFullYear() })),
      arrivalsVsDepartures: arrivalsVsDep,
      delaysByAirline: delays,
      peakHours,
    },
  };
}
