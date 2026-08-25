import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { Flight } from "../models/Flight.js";
import { Airline } from "../models/Airline.js";
import { Destination } from "../models/Destination.js";
import { RegionTraffic } from "../models/RegionTraffic.js";
import { Report } from "../models/Report.js";
import { User } from "../models/User.js";
import { DailyStat } from "../models/DailyStat.js";
import { buildFlights, AIRLINES, DESTINATIONS } from "./generator.js";
import {
  computeAirlinePerformance,
  computeDestinationAnalysis,
  rebuildDailyCubes,
} from "../services/biService.js";

const DAYS = parseInt(process.env.SEED_DAYS || "120", 10);

export async function runSeed(days = DAYS) {
  await connectDB();

  console.log(`[seed] génération de ${DAYS} jours de vols...`);
  const flights = buildFlights(DAYS);
  await Flight.deleteMany({});
  await Flight.insertMany(flights, { ordered: false });
  console.log(`[seed] ${flights.length} vols insérés.`);

  console.log("[seed] mise à jour des dimensions compagnies (formule BI)...");
  const { leaderboard } = await computeAirlinePerformance();
  for (const row of leaderboard) {
    const meta = AIRLINES.find((a) => a.code === row.code);
    await Airline.updateOne(
      { code: row.code },
      {
        $set: {
          code: row.code,
          iata: meta?.iata ?? row.code,
          name: row.name,
          country: meta?.country ?? "",
          base: meta?.base ?? "",
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

  console.log("[seed] mise à jour des dimensions destinations...");
  const { topDestinations, trafficByRegion } = await computeDestinationAnalysis();
  for (const row of topDestinations) {
    const meta = DESTINATIONS.find((d) => d.code === row.code);
    await Destination.updateOne(
      { code: row.code },
      {
        $set: {
          code: row.code,
          city: row.city,
          country: row.country,
          region: meta?.region ?? "",
          rank: row.rank,
          passengers: row.passengers,
          sharePercent: row.sharePercent,
          flightsCount: row.flightsCount,
          avgLoadFactor: row.avgLoadFactor,
          onTimeRate: row.onTimeRate,
          barColor: row.barColor,
          lat: meta?.lat ?? 0,
          lng: meta?.lng ?? 0,
        },
      },
      { upsert: true }
    );
  }

  // Ensure every destination dimension row exists (including low-traffic ones).
  for (const d of DESTINATIONS) {
    await Destination.updateOne(
      { code: d.code },
      {
        $setOnInsert: {
          city: d.city,
          country: d.country,
          region: d.region,
          lat: d.lat,
          lng: d.lng,
          rank: 99,
          passengers: 0,
          sharePercent: 0,
          flightsCount: 0,
          avgLoadFactor: 0,
          onTimeRate: 0,
          barColor: "bg-secondary",
        },
      },
      { upsert: true }
    );
  }

  // Region traffic dimension (quarterly split of generated departures).
  const year = new Date().getFullYear();
  for (const region of [...new Set(DESTINATIONS.map((d) => d.region))]) {
    const destCodes = DESTINATIONS.filter((d) => d.region === region).map((d) => d.code);
    const agg = await Flight.aggregate([
      { $match: { type: "DEPARTURE", destinationCode: { $in: destCodes } } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);
    const total = agg[0]?.count || 0;
    await RegionTraffic.updateOne(
      { region },
      {
        $set: {
          region,
          year,
          q1: Math.round(total * 0.3),
          q2: Math.round(total * 0.3),
          q3: Math.round(total * 0.25),
          q4: Math.round(total * 0.15),
        },
      },
      { upsert: true }
    );
  }

  console.log("[seed] reconstruction du cube journalier...");
  await rebuildDailyCubes(DAYS);
  console.log(`[seed] ${await DailyStat.countDocuments()} jours agrégés.`);

  console.log("[seed] utilisateur administrateur...");
  const password = await bcrypt.hash(env.seedAdminPassword, 10);
  await User.updateOne(
    { username: env.seedAdminUsername },
    {
      $set: {
        password,
        fullName: "Administrateur",
        email: "admin@mir-airport.com",
        role: "Administrateur Système",
        department: "Operations Control Center (OCC)",
        isActive: true,
      },
    },
    { upsert: true }
  );

  console.log("[seed] rapports standard + historique...");
  await Report.deleteMany({});
  await Report.insertMany([
    { reportId: "REP-STD-1", name: "Rapport Mensuel - Octobre 2023", description: "Synthèse globale des mouvements aéroportuaires, flux passagers et incidents logistiques du mois écoulé.", kind: "standard", size: "2.4 MB", badge: "Auto-généré", icon: "picture_as_pdf", iconTone: "error" },
    { reportId: "REP-STD-2", name: "Bilan Annuel 2022", description: "Rapport d'activité annuel complet audité. Statistiques de croissance et objectifs de performance.", kind: "standard", size: "15.1 MB", badge: "Officiel", icon: "description", iconTone: "primary" },
    { reportId: "REP-STD-3", name: "Analyse Retards Q3", description: "Extraction Excel de tous les événements de retard dépassant 15 minutes pour le troisième trimestre.", kind: "standard", size: "8.7 MB", badge: "Données Brutes", icon: "table_chart", iconTone: "neutral" },
    { reportId: "REP-9942", name: "Extraction_Vols_Nuit", author: "J. Dupont", kind: "history", format: "CSV", generatedAt: new Date() },
    { reportId: "REP-9941", name: "Bilan_Hebdo", author: "Système (Auto)", kind: "history", format: "PDF", generatedAt: new Date(Date.now() - 86400000) },
  ]);

  await mongoose.disconnect();
  console.log("[seed] terminé ✓");
  return { flights: flights.length, days: DAYS };
}

// CLI entry: `npm run seed`
const isMain = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1].replace(/\\/g, "/")}`).href;
if (isMain) {
  runSeed().catch(async (err) => {
    console.error("[seed] échec:", err);
    await mongoose.disconnect();
    process.exit(1);
  });
}
