import { Router } from "express";
import { getOverview } from "../controllers/dashboardController.js";
import { asyncHandler } from "../middleware/auth.js";

const router = Router();

router.get("/overview", asyncHandler(getOverview));

export default router;
