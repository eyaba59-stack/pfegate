import mongoose from "mongoose";

/**
 * Airline dimension table. TotalFlights / punctuality / cancellations are
 * denormalized snapshots refreshed by the BI service, while the raw flight
 * fact table remains the source of truth for aggregations.
 */
const airlineSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    iata: { type: String, required: true, trim: true },
    name: { type: String, required: true },
    country: { type: String, default: "" },
    base: { type: String, default: "" },
    totalFlights: { type: Number, default: 0 },
    punctuality: { type: Number, default: 0 },
    cancellations: { type: Number, default: 0 },
    avgDelayMinutes: { type: Number, default: 0 },
    avgLoadFactor: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    scoreBarWidth: { type: Number, default: 0 },
    scoreBarColor: { type: String, default: "bg-secondary" },
  },
  { timestamps: true }
);

export const Airline = mongoose.model("Airline", airlineSchema);
