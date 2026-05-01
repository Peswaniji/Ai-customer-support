import rateLimit from "express-rate-limit";

// Auth routes — max 10 attempts per 15 minutes per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Invite agent — max 20 per hour (prevent spam invites)
export const inviteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many invite requests. Please try again after 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});