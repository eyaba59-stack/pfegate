import mongoose from "mongoose";

/**
 * Flight fact table (grain: one row per flight movement).
 * Denormalized with airline/destination codes so Power BI and aggregations
 * never need joins.
 */
const flightSchema = new mongoose.Schema(
  {
    flightId: { type: String, required: true, unique: true, trim: true },
    flightNumber: { type: String, required: true, trim: true },

    // airline dimension snapshot
    airlineCode: { type: String, required: true, trim: true },
    airlineName: { type: String, required: true },

    type: { type: String, enum: ["ARRIVAL", "DEPARTURE"], required: true },
    status: {
      type: String,
      enum: ["ON_TIME", "DELAYED", "CANCELLED", "BOARDING"],
      required: true,
    },

    // route snapshot
    origin: { type: String, required: true },
    originCode: { type: String, default: "" },
    destination: { type: String, required: true },
    destinationCode: { type: String, default: "" },

    // times
    date: { type: String, required: true }, // YYYY-MM-DD (scheduled day)
    scheduledTime: { type: String, required: true }, // HH:mm
    actualTime: { type: String, default: null },
    scheduledDateTime: { type: Date, required: true },
    actualDateTime: { type: Date, default: null },
    delayMinutes: { type: Number, default: null },

    // operational details (BI dimensions)
    gate: { type: String, default: "" },
    terminal: { type: String, default: "" },
    aircraft: { type: String, default: "" },
    passengers: { type: Number, default: 0 },
    capacity: { type: Number, default: 0 },
    loadFactor: { type: Number, default: 0 }, // passengers / capacity * 100
  },
  { timestamps: true }
);

flightSchema.index({ date: 1, airlineCode: 1 });
flightSchema.index({ status: 1 });
flightSchema.index({ type: 1 });

export const Flight = mongoose.model("Flight", flightSchema);
