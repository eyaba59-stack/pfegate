import mongoose from "mongoose";

/**
 * Region traffic fact (quarterly volumes per region) — dimension for BI.
 */
const regionTrafficSchema = new mongoose.Schema(
  {
    region: { type: String, required: true, unique: true },
    year: { type: Number, default: () => new Date().getFullYear() },
    q1: { type: Number, default: 0 },
    q2: { type: Number, default: 0 },
    q3: { type: Number, default: 0 },
    q4: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const RegionTraffic = mongoose.model("RegionTraffic", regionTrafficSchema);
