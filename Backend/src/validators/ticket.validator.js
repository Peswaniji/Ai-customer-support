import { body, param, query } from "express-validator";

export const createTicketValidator = [
  body("subject")
    .trim().notEmpty().withMessage("Subject is required")
    .isLength({ max: 200 }).withMessage("Subject max 200 characters"),
  body("description")
    .trim().notEmpty().withMessage("Description is required")
    .isLength({ max: 2000 }).withMessage("Description max 2000 characters"),
];

export const getTicketsValidator = [
  query("status")
    .optional()
    .isIn(["open", "in_progress", "resolved", "closed", "auto_resolved"])
    .withMessage("Invalid status"),
  query("priority")
    .optional()
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid priority"),
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("Page must be positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
];

export const ticketIdValidator = [
  param("ticketId")
    .isMongoId().withMessage("Invalid ticket ID"),
];

export const updateStatusValidator = [
  param("ticketId")
    .isMongoId().withMessage("Invalid ticket ID"),
  body("status")
    .isIn(["open", "in_progress", "resolved", "closed"])
    .withMessage("Invalid status value"),
];

export const assignTicketValidator = [
  param("ticketId")
    .isMongoId().withMessage("Invalid ticket ID"),
  body("agentId")
    .isMongoId().withMessage("Invalid agent ID"),
];

export const updatePriorityValidator = [
  param("ticketId")
    .isMongoId().withMessage("Invalid ticket ID"),
  body("priority")
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid priority value"),
];

export const rateTicketValidator = [
  param("ticketId")
    .isMongoId().withMessage("Invalid ticket ID"),
  body("rating")
    .isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
];