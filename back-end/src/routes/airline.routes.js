import { Router } from "express";
import { listAirlines, getLeaderboard, getHighlights } from "../controllers/airlineController.js";
import { asyncHandler } from "../middleware/auth.js";

const router = Router();

router.get("/", asyncHandler(listAirlines));
router.get("/leaderboard", asyncHandler(getLeaderboard));
router.get("/highlights", asyncHandler(getHighlights));

export default router;
