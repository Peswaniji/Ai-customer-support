import { body, param } from "express-validator";

export const messageParamValidator = [
  param("ticketId")
    .isMongoId().withMessage("Invalid ticket ID"),
];

export const sendMessageValidator = [
  param("ticketId")
    .isMongoId().withMessage("Invalid ticket ID"),
  body("content")
    .trim().notEmpty().withMessage("Message content is required")
    .isLength({ max: 5000 }).withMessage("Message max 5000 characters"),
  body("isInternal")
    .optional()
    .isBoolean().withMessage("isInternal must be boolean"),
];