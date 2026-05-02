import express from "express";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { suggestRepliesValidator } from "../validators/ai.validator.js";
import { suggestReplies } from "../controllers/ai.controller.js";

const router = express.Router();

router.post(
  "/suggest",
  protect,
  authorize("agent", "business_admin", "super_admin"),
  suggestRepliesValidator,
  validate,
  suggestReplies
);

export default router;