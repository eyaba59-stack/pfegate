import { computeDashboardOverview } from "../services/biService.js";
import { asyncHandler } from "../middleware/auth.js";

/** GET /api/dashboard/overview?date=YYYY-MM-DD — KPI cards + live feed (defaults to latest data date). */
export const getOverview = asyncHandler(async (req, res) => {
  const overview = await computeDashboardOverview(req.query.date || undefined);
  res.json(overview);
});
