import { body } from "express-validator";

export const registerBusinessValidator = [
  body("businessName")
    .trim().notEmpty().withMessage("Business name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Business name must be 2-100 characters"),
  body("email")
    .trim().isEmail().withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("industry")
    .optional().trim()
    .isLength({ max: 50 }).withMessage("Industry max 50 characters"),
];

export const loginValidator = [
  body("email")
    .trim().isEmail().withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required"),
];

export const customerSessionValidator = [
  body("name")
    .trim().notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
  body("email")
    .trim().isEmail().withMessage("Valid email is required")
    .normalizeEmail(),
  body("businessId")
    .notEmpty().withMessage("Business ID is required")
    .isMongoId().withMessage("Invalid business ID format"),
];

export const inviteAgentValidator = [
  body("name")
    .trim().notEmpty().withMessage("Agent name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
  body("email")
    .trim().isEmail().withMessage("Valid email is required")
    .normalizeEmail(),
];

export const setPasswordValidator = [
  body("token")
    .notEmpty().withMessage("Invite token is required"),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
];