import express from "express";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateBusinessValidator } from "../validators/business.validator.js";
import {
  getMyBusiness,
  updateMyBusiness,
  getWidgetCode,
  getAllBusinesses,
  getPlans,
  upgradePlan,
  getUsageStats_controller,
} from "../controllers/business.controller.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────
router.get("/plans", getPlans);

// ── Business Admin ────────────────────────────────────────────
router.get("/me", protect, authorize("business_admin"), getMyBusiness);
router.patch(
  "/me",
  protect,
  authorize("business_admin"),
  updateBusinessValidator,
  validate,
  updateMyBusiness
);
router.get("/widget-code", protect, authorize("business_admin"), getWidgetCode);
router.patch("/upgrade", protect, authorize("business_admin"), upgradePlan);

// ── Super Admin ───────────────────────────────────────────────
router.get("/all", protect, authorize("super_admin"), getAllBusinesses);

router.get("/usage", protect, authorize("business_admin"), getUsageStats_controller);
export default router;
