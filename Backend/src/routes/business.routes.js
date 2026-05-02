import express from "express";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateBusinessValidator } from "../validators/business.validator.js";
import {
  getMyBusiness, updateMyBusiness,
  getWidgetCode, getAllBusinesses,
} from "../controllers/business.controller.js";

const router = express.Router();

router.get("/all",        protect, authorize("super_admin"),    getAllBusinesses);
router.get("/me",         protect, authorize("business_admin"), getMyBusiness);
router.patch("/me",       protect, authorize("business_admin"), updateBusinessValidator, validate, updateMyBusiness);
router.get("/widget-code",protect, authorize("business_admin"), getWidgetCode);

export default router;