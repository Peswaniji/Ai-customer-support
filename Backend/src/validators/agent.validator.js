import { body, param } from "express-validator";

export const availabilityValidator = [
  body("availabilityStatus")
    .isIn(["available", "busy"]).withMessage("Must be 'available' or 'busy'"),
];

export const agentStatusValidator = [
  param("agentId")
    .isMongoId().withMessage("Invalid agent ID"),
  body("isActive")
    .isBoolean().withMessage("isActive must be true or false"),
];
