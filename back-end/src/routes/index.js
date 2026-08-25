import { Router } from "express";
import authRoutes from "./auth.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import flightRoutes from "./flight.routes.js";
import airlineRoutes from "./airline.routes.js";
import destinationRoutes from "./destination.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import reportRoutes from "./report.routes.js";
import userRoutes from "./user.routes.js";
import biRoutes from "./bi.routes.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Public
router.use("/auth", authRoutes);
router.use("/bi", biRoutes); // Power BI data endpoints (optional key guard)

// Authenticated application routes
router.use("/dashboard", authenticate, dashboardRoutes);
router.use("/flights", authenticate, flightRoutes);
router.use("/airlines", authenticate, airlineRoutes);
router.use("/destinations", authenticate, destinationRoutes);
router.use("/analytics", authenticate, analyticsRoutes);
router.use("/reports", reportRoutes); // GETs are read-only; /generate is guarded inline
router.use("/users", userRoutes);

export default router;
