/**
 * Import real flight data exported from Power BI into MongoDB.
 *
 * Pipeline:
 *   npm run extract:powerbi   -> pbi-tools reads pfe.pbix and exports ALL tables
 *                               (Vols, Compagnies, Destinations, ...) as CSVs
 *                               into back-end/data/powerbi/
 *   npm run import:powerbi    -> this script maps those CSVs into the Flight /
 *                               Airline / Destination collections and rebuilds
 *                               the daily cubes.
 *
 * Mapping is accent/whitespace-insensitive so Power BI column names such as
 * "NumVol", "Compagnie", "Heure", "RetardMin" match regardless of accents.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDB } from "../config/db.js";
import { Flight } from "../models/Flight.js";
import { Airline } from "../models/Airline.js";
import { Destination } from "../models/Destination.js";
import { RegionTraffic } from "../models/RegionTraffic.js";
import { DailyStat } from "../models/DailyStat.js";
import {
  computeAirlinePerformance,
  computeDestinationAnalysis,
  rebuildDailyCubes,
} from "../services/biService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PBI_DIR = process.env.POWERBI_DATA_DIR || path.resolve(__dirname, "../../data/powerbi");

/** Normalise a header cell for comparison (strip accents + spaces). */
export function norm(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

/** Map accent-insensitive Power BI column names -> Flight schema fields. */
const COLUMN_MAP = {
  numvol: "flightNumber",
  id: "flightId",
  compagnie: "airlineName",
  type: "type",
  statut: "status",
  date: "date",
  heure: "scheduledTime",
  retardmin: "delayMinutes",
  destination: "destination",
  destinationcode: "destinationCode",
  origine: "origin",
  originecode: "originCode",
  passagers: "passengers",
  capacite: "capacity",
  facteurchargement: "loadFactor",
};

/** IATA code lookups for the values present in the PFE Power BI report. */
const CITY_IATA = {
  paris: "CDG",
  lyon: "LYS",
  marseille: "MRS",
  milan: "MXP",
  rome: "FCO",
  istanbul: "IST",
  tunis: "TUN",
  alger: "ALG",
};

const AIRLINE_IATA = {
  tunisair: "TU",
  nouvelair: "BJ",
  transavia: "HV",
  airfrance: "AF",
  lufthansa: "LH",
  itaairways: "AZ",
};

export function cityCode(name) {
  return CITY_IATA[norm(name)] || norm(name).replace(" ", "").slice(0, 3).toUpperCase() || "";
}

export function airlineCode(name) {
  return AIRLINE_IATA[norm(name)] || norm(name).replace(/\s+/g, "").slice(0, 3).toUpperCase() || "";
}

export function toIsoDate(d) {
  if (!d) return "";
  const s = String(d).trim();
  const m = s.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  const m2 = s.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (m2) return `${m2[3]}-${m2[2].padStart(2, "0")}-${m2[1].padStart(2, "0")}`;
  const dte = new Date(s);
  if (!Number.isNaN(dte.getTime())) return dte.toISOString().slice(0, 10);
  return s;
}

export function parseNum(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function normalizeStatus(s) {
  const v = norm(s);
  if (v.includes("retard")) return "DELAYED";
  if (v.includes("annul")) return "CANCELLED";
  if (v.includes("embarqu")) return "BOARDING";
  if (v.includes("heure") || v.includes("on")) return "ON_TIME";
  return "ON_TIME";
}

export function normalizeType(s) {
  const v = norm(s);
  if (v.includes("depart") || v.startsWith("d")) return "DEPARTURE";
  return "ARRIVAL";
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === "," || c === ";") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/** Map CSV rows (header + data) to Flight documents. */
export function mapRowsToFlights(all) {
  if (all.length < 2) return [];
  const headers = all[0].map(norm);
  const colIndex = {};
  for (const [h, field] of Object.entries(COLUMN_MAP)) {
    const idx = headers.indexOf(h);
    if (idx >= 0) colIndex[field] = idx;
  }

  if (colIndex.flightNumber === undefined && colIndex.flightId === undefined) {
    const sample = headers.join(", ");
    console.error(`[pbi] Could not find a flight-number column. Headers seen: ${sample}`);
    process.exit(1);
  }

  const docs = [];
  const seen = new Set();
  for (let i = 1; i < all.length; i++) {
    const r = all[i];
    const get = (field) => (colIndex[field] !== undefined ? r[colIndex[field]] : undefined);

    const type = normalizeType(get("type"));
    const flightNumber = String(get("flightNumber") ?? get("flightId") ?? "").trim();
    if (!flightNumber) continue;

    const flightId = String(get("flightId") ?? `${flightNumber}_${i}`).trim();
    if (seen.has(flightId)) continue;
    seen.add(flightId);

    const date = toIsoDate(get("date"));
    const scheduledTime = String(get("scheduledTime") ?? "").trim();
    const delayMinutes = parseNum(get("delayMinutes"));
    const passengers = parseNum(get("passengers"));
    const capacity = parseNum(get("capacity"));
    const airlineName = String(get("airlineName") ?? "").trim();
    const destinationClean = String(get("destination") ?? "").replace(/\s*\(.*\)\s*$/, "").trim();

    let scheduledDateTime = null;
    if (date) {
      const time = scheduledTime || "00:00";
      const hm = String(time).match(/(\d{1,2}):(\d{2})/);
      const h = hm ? hm[1] : "0";
      const m = hm ? hm[2] : "0";
      scheduledDateTime = new Date(`${date}T${h.padStart(2, "0")}:${m.padStart(2, "0")}:00.000Z`);
    }

    const startCity = type === "ARRIVAL" ? destinationClean : "Monastir (MIR)";
    const endCity = type === "DEPARTURE" ? destinationClean : "Monastir (MIR)";

    docs.push({
      flightId,
      flightNumber,
      airlineCode: airlineCode(airlineName),
      airlineName,
      type,
      status: normalizeStatus(get("status")),
      origin: startCity || "Monastir (MIR)",
      originCode: type === "ARRIVAL" ? cityCode(destinationClean) : "MIR",
      destination: endCity || "Monastir (MIR)",
      destinationCode: type === "DEPARTURE" ? cityCode(destinationClean) : "MIR",
      date,
      scheduledTime,
      actualTime: null,
      scheduledDateTime,
      actualDateTime: null,
      delayMinutes,
      gate: "",
      terminal: "",
      aircraft: "",
      passengers: passengers ?? 0,
      capacity: capacity ?? 0,
      loadFactor: capacity ? Math.round(((passengers ?? 0) / capacity) * 100) : 0,
    });
  }
  return docs;
}

/** Parse a simple 2-column dimension CSV (ID;Nom). Returns [{code,name}]. */
export function mapDimensionRows(all) {
  if (all.length < 2) return [];
  const docs = [];
  for (let i = 1; i < all.length; i++) {
    const r = all[i];
    const id = String(r[0] ?? "").trim();
    const name = String(r[1] ?? "").trim();
    if (!name) continue;
    docs.push({ code: id || name, name });
  }
  return docs;
}

async function run() {
  await connectDB();

  const allCsv = listCsvFiles();

  const volsFile = allCsv.find((f) => /^vols$/i.test(path.basename(f, ".csv")));
  const destFile = allCsv.find((f) => /^destinations$/i.test(path.basename(f, ".csv")));
  const compFile = allCsv.find((f) => /^compagnies$|^airlines?$/i.test(path.basename(f, ".csv")));

  if (!volsFile) {
    console.error("[pbi] Missing Vols.csv in the export folder. Run extract:powerbi first.");
    process.exit(1);
  }

  const raw = fs.readFileSync(volsFile, "utf8");
  const docs = mapRowsToFlights(parseCsv(raw));
  if (docs.length === 0) {
    console.error(`[pbi] CSV "${volsFile}" produced no flight rows.`);
    process.exit(1);
  }

  await Flight.deleteMany({});
  const inserted = await Flight.insertMany(docs, { ordered: false });
  console.log(`[pbi] Imported ${inserted.length} flights from Vols (${path.basename(volsFile)}).`);

  console.log("[pbi] rebuilding airline dimensions...");
  const { leaderboard } = await computeAirlinePerformance();
  if (compFile) {
    const comps = mapDimensionRows(parseCsv(fs.readFileSync(compFile, "utf8")));
    for (const c of comps) {
      const stats = leaderboard.find((a) => norm(a.name) === norm(c.name));
      const code = airlineCode(c.name);
      await Airline.updateOne(
        { code },
        {
          $set: {
            code,
            iata: code,
            name: c.name,
            country: "",
            base: "",
            totalFlights: stats?.totalFlights ?? 0,
            punctuality: stats?.punctuality ?? 0,
            cancellations: stats?.cancellations ?? 0,
            avgDelayMinutes: stats?.avgDelayMinutes ?? 0,
            avgLoadFactor: stats?.avgLoadFactor ?? 0,
            score: stats?.score ?? 0,
            scoreBarWidth: stats?.scoreBarWidth ?? 0,
            scoreBarColor: stats?.scoreBarColor ?? "bg-secondary",
          },
        },
        { upsert: true }
      );
    }
  } else {
    for (const row of leaderboard) {
      await Airline.updateOne(
        { code: row.code },
        {
          $set: {
            code: row.code,
            iata: row.code,
            name: row.name,
            country: "",
            base: "",
            totalFlights: row.totalFlights,
            punctuality: row.punctuality,
            cancellations: row.cancellations,
            avgDelayMinutes: row.avgDelayMinutes,
            avgLoadFactor: row.avgLoadFactor,
            score: row.score,
            scoreBarWidth: row.scoreBarWidth,
            scoreBarColor: row.scoreBarColor,
          },
        },
        { upsert: true }
      );
    }
  }

  console.log("[pbi] rebuilding destination dimensions...");
  const { topDestinations } = await computeDestinationAnalysis();
  const ALL_DEST = { paris: { country: "France" }, lyon: { country: "France" }, marseille: { country: "France" }, milan: { country: "Italie" }, rome: { country: "Italie" }, istanbul: { country: "Turquie" }, tunis: { country: "Tunisie" }, alger: { country: "Algérie" } };
  if (destFile) {
    const dests = mapDimensionRows(parseCsv(fs.readFileSync(destFile, "utf8")));
    for (const d of dests) {
      const code = cityCode(d.name);
      const top = topDestinations.find((t) => norm(t.city) === norm(d.name));
      await Destination.updateOne(
        { code },
        {
          $set: {
            code,
            city: d.name,
            country: ALL_DEST[norm(d.name)]?.country ?? "",
            region: "",
            rank: top?.rank ?? 99,
            passengers: top?.passengers ?? 0,
            sharePercent: top?.sharePercent ?? 0,
            flightsCount: top?.flightsCount ?? 0,
            avgLoadFactor: top?.avgLoadFactor ?? 0,
            onTimeRate: top?.onTimeRate ?? 0,
            barColor: top?.barColor ?? "bg-secondary",
          },
        },
        { upsert: true }
      );
    }
  } else {
    for (const row of topDestinations) {
      await Destination.updateOne(
        { code: row.code },
        {
          $set: {
            code: row.code,
            city: row.city,
            country: row.country,
            region: "",
            rank: row.rank,
            passengers: row.passengers,
            sharePercent: row.sharePercent,
            flightsCount: row.flightsCount,
            avgLoadFactor: row.avgLoadFactor,
            onTimeRate: row.onTimeRate,
            barColor: row.barColor,
          },
        },
        { upsert: true }
      );
    }
  }

  console.log("[pbi] rebuilding daily cubes...");
  await rebuildDailyCubes(365);
  console.log(`[pbi] ${await DailyStat.countDocuments()} daily rows aggregated.`);

  console.log("[pbi] removing stale dimensions...");
  const activeAirlines = await Flight.distinct("airlineCode");
  const activeDests = await Flight.distinct("destinationCode");
  await Airline.deleteMany({ code: { $nin: activeAirlines } });
  await Destination.deleteMany({ code: { $nin: activeDests } });

  console.log(
    `[pbi] Done: ${inserted.length} flights, ${await Airline.countDocuments()} airlines, ` +
      `${await Destination.countDocuments()} destinations, ${await DailyStat.countDocuments()} daily rows.`
  );
  process.exit(0);
}

function listCsvFiles() {
  if (!fs.existsSync(PBI_DIR)) {
    console.error(`[pbi] Missing data dir: ${PBI_DIR}`);
    process.exit(1);
  }
  return fs.readdirSync(PBI_DIR).filter((f) => f.toLowerCase().endsWith(".csv")).map((f) => path.join(PBI_DIR, f));
}

run().catch((err) => {
  console.error("[pbi] Import failed:", err);
  process.exit(1);
});
