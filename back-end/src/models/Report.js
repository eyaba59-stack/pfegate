import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reportId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    kind: { type: String, enum: ["history", "standard"], default: "history" },
    format: { type: String, enum: ["PDF", "CSV", "XLSX"], default: "PDF" },
    author: { type: String, default: "Système (Auto)" },
    size: { type: String, default: "1.0 MB" },
    badge: { type: String, default: "" },
    icon: { type: String, default: "picture_as_pdf" },
    iconTone: { type: String, enum: ["error", "primary", "neutral"], default: "neutral" },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);
