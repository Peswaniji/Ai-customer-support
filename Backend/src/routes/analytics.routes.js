import express from "express";
import { protect, authorize, scopeBusiness } from "../middlewares/auth.middleware.js";
import { cache } from "../middlewares/cache.middleware.js";
import { getOverview, getTrends, getAgentStats, getPlatformStats } from "../controllers/analytics.controller.js";

const router = express.Router();

// cache(60) = 60 seconds TTL
router.get("/overview", protect, authorize("business_admin"), scopeBusiness, cache(60), getOverview);
router.get("/trends",   protect, authorize("business_admin"), scopeBusiness, cache(60), getTrends);
router.get("/agents",   protect, authorize("business_admin"), scopeBusiness, cache(60), getAgentStats);
router.get("/all",      protect, authorize("super_admin"),                              getPlatformStats);

export default router;