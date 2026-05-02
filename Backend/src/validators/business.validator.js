import { body } from "express-validator";

export const updateBusinessValidator = [
  body("name")
    .optional().trim()
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
  body("widgetConfig.color")
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Color must be valid hex e.g. #1E40AF"),
  body("widgetConfig.welcomeMessage")
    .optional().trim()
    .isLength({ max: 200 }).withMessage("Welcome message max 200 characters"),
  body("widgetConfig.autoReplyEnabled")
    .optional()
    .isBoolean().withMessage("Must be true or false"),
  body("widgetConfig.confidenceThreshold")
    .optional()
    .isInt({ min: 50, max: 100 }).withMessage("Must be between 50 and 100"),
];