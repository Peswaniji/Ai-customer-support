import express from "express";
import {
  registerBusiness, login, refreshToken,
  logout, customerSession, inviteAgent, setPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authLimiter, inviteLimiter } from "../middlewares/rateLimiter.middleware.js";
import {
  registerBusinessValidator, loginValidator, customerSessionValidator,
  inviteAgentValidator, setPasswordValidator,
} from "../validators/auth.validator.js";

const router = express.Router();

// rate limited routes
router.post("/register-business", authLimiter, registerBusinessValidator, validate, registerBusiness);
router.post("/login",             authLimiter, loginValidator,             validate, login);
router.post("/set-password",      authLimiter, setPasswordValidator,       validate, setPassword);

// normal routes
router.post("/refresh-token",    refreshToken);
router.post("/logout",           protect, logout);
router.post("/customer-session", customerSessionValidator, validate, customerSession);
router.post("/invite-agent",     protect, inviteLimiter, inviteAgentValidator, validate, inviteAgent);

export default router;