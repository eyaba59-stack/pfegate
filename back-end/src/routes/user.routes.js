import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/userController.js";
import { authenticate, asyncHandler } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);
router.get("/profile", asyncHandler(getProfile));
router.put("/profile", asyncHandler(updateProfile));

export default router;
