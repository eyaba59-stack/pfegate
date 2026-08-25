import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    region: { type: String, default: "" },
    rank: { type: Number, default: 0 },
    passengers: { type: Number, default: 0 },
    sharePercent: { type: Number, default: 0 },
    flightsCount: { type: Number, default: 0 },
    avgLoadFactor: { type: Number, default: 0 },
    onTimeRate: { type: Number, default: 0 },
    barColor: { type: String, default: "bg-secondary" },
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Destination = mongoose.model("Destination", destinationSchema);
