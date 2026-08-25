import mongoose from "mongoose";

/**
 * Pre-aggregated daily cube, refreshed by the BI service (or the seed).
 * Designed to be consumed directly by Power BI for fast, simple visuals.
 */
const dailyStatSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true }, // YYYY-MM-DD
    dayName: { type: String, default: "" }, // Lun..Dim
    totalFlights: { type: Number, default: 0 },
    arrivals: { type: Number, default: 0 },
    departures: { type: Number, default: 0 },
    onTime: { type: Number, default: 0 },
    delayed: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 },
    boarding: { type: Number, default: 0 },
    punctualityRate: { type: Number, default: 0 }, // %
    avgDelayMinutes: { type: Number, default: 0 },
    passengers: { type: Number, default: 0 },
    activeAirlines: { type: Number, default: 0 },
    activeRoutes: { type: Number, default: 0 },
    avgLoadFactor: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const DailyStat = mongoose.model("DailyStat", dailyStatSchema);
