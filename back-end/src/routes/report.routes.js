import { Router } from "express";
import { getReports, getStandardReports, getHistory, generateReport } from "../controllers/reportController.js";
import { authenticate, asyncHandler } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(getReports));
router.get("/standards", asyncHandler(getStandardReports));
router.get("/history", asyncHandler(getHistory));
router.post("/generate", asyncHandler(generateReport));

export default router;
