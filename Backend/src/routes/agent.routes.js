import express from "express";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { availabilityValidator, agentStatusValidator } from "../validators/agent.validator.js";
import { getAgents, updateAvailability, updateAgentStatus } from "../controllers/agent.controller.js";

const router = express.Router();

router.get("/",                  protect, authorize("business_admin"),  getAgents);
router.patch("/availability",    protect, authorize("agent"),           availabilityValidator, validate, updateAvailability);
router.patch("/:agentId/status", protect, authorize("business_admin"), agentStatusValidator,  validate, updateAgentStatus);

export default router;