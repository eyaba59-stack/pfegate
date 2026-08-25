import { Router } from "express";
import { listFlights, getToday, getFlightById } from "../controllers/flightController.js";
import { asyncHandler } from "../middleware/auth.js";

const router = Router();

router.get("/", asyncHandler(listFlights));
router.get("/today", asyncHandler(getToday));
router.get("/:id", asyncHandler(getFlightById));

export default router;
