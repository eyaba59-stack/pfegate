import { Router } from "express";
import { login, me } from "../controllers/authController.js";
import { authenticate, asyncHandler } from "../middleware/auth.js";

const router = Router();

router.post("/login", asyncHandler(login));
router.get("/me", authenticate, asyncHandler(me));

export default router;
