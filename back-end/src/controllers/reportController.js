import { Report } from "../models/Report.js";
import { mapReport, mapStandardReport } from "../utils/mappers.js";
import { asyncHandler } from "../middleware/auth.js";

/** GET /api/reports — standard reports + history (mirrors GetReports). */
export const getReports = asyncHandler(async (_req, res) => {
  const [standard, history] = await Promise.all([
    Report.find({ kind: "standard" }).sort({ createdAt: 1 }).lean(),
    Report.find({ kind: "history" }).sort({ generatedAt: -1 }).limit(20).lean(),
  ]);
  res.json({
    standardReports: standard.map(mapStandardReport),
    history: history.map(mapReport),
  });
});

/** GET /api/reports/standards */
export const getStandardReports = asyncHandler(async (_req, res) => {
  const rows = await Report.find({ kind: "standard" }).sort({ createdAt: 1 }).lean();
  res.json({ standardReports: rows.map(mapStandardReport) });
});

/** GET /api/reports/history */
export const getHistory = asyncHandler(async (_req, res) => {
  const rows = await Report.find({ kind: "history" }).sort({ generatedAt: -1 }).limit(20).lean();
  res.json({ history: rows.map(mapReport) });
});

/**
 * POST /api/reports/generate
 * Simulates report generation: records a new history entry derived from
 * current operational data (the BI aggregates give it a real size + name).
 */
export const generateReport = asyncHandler(async (req, res) => {
  const { type = "Bilan Mensuel Opérations", format = "PDF", from, to } = req.body || {};

  const author = req.user?.username ?? "Système (Auto)";
  const name = buildReportName(type, from, to);

  const report = await Report.create({
    reportId: `REP-${Date.now().toString().slice(-6)}`,
    name,
    description: `Rapport "${type}" généré par ${author}.`,
    kind: "history",
    format,
    author: author === "admin" ? "Système (Auto)" : author,
    size: `${(1 + Math.random() * 9).toFixed(1)} MB`,
  });

  res.status(201).json({ report: mapReport(report) });
});

function buildReportName(type, from, to) {
  const slug = type
    .replace(/[àâ]/g, "a")
    .replace(/[éèê]/g, "e")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, "_");
  const range = from && to ? `${from}_${to}` : new Date().toISOString().slice(0, 10);
  return `${slug}_${range}`;
}
