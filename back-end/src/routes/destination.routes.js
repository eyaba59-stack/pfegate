import { Router } from "express";
import { getTopDestinations, getTrafficByRegion, listDestinations } from "../controllers/destinationController.js";
import { asyncHandler } from "../middleware/auth.js";

const router = Router();

router.get("/", asyncHandler(listDestinations));
router.get("/top", asyncHandler(getTopDestinations));
router.get("/regions", asyncHandler(getTrafficByRegion));

export default router;
