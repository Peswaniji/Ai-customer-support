import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import User from "../models/user.model.js";
import Business from "../models/business.model.js";
import { sendInviteEmail, sendWelcomeEmail } from "../services/email.service.js";

// ── JWT helpers ───────────────────────────────────────────────
const signAccessToken = (userId, role, businessId) =>
  jwt.sign(
    { userId, role, businessId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
  );

const signRefreshToken = (userId) =>
  jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d" }
  );

const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// ── POST /register-business ───────────────────────────────────
export const registerBusiness = async (req, res) => {
  try {
    const { businessName, email, password, industry } = req.body;

    const existingUser = await User.findOne({ email });
    const existingBusiness = await Business.findOne({ email });

    if (existingUser || existingBusiness) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const business = await Business.create({
      name: businessName,
      email,
      industry,
    });

    const user = await User.create({
      name: businessName,
      email,
      password,
      role: "business_admin",
      businessId: business._id,
      isActive: true,
    });

    sendWelcomeEmail(email, businessName).catch(console.error);

    const accessToken = signAccessToken(user._id, user.role, user.businessId);
    const refreshToken = signRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: "Business registered successfully",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    console.error("registerBusiness:", err);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

// ── POST /login ───────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = signAccessToken(user._id, user.role, user.businessId);
    const refreshToken = signRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        availabilityStatus: user.availabilityStatus,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// ── POST /invite-agent (FIXED CONFLICT HERE) ──────────────────
export const inviteAgent = async (req, res) => {
  try {
    const { name, email } = req.body;
    const businessId = req.user.businessId;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }

    const business = await Business.findById(businessId);

    const currentAgentCount = await User.countDocuments({
      businessId,
      role: "agent",
    });

    if (currentAgentCount >= business.planLimits.maxAgents) {
      return res.status(403).json({
        success: false,
        message: `Your ${business.plan} plan allows maximum ${business.planLimits.maxAgents} agents.`,
        code: "PLAN_LIMIT_REACHED",
        currentCount: currentAgentCount,
        maxAllowed: business.planLimits.maxAgents,
        upgradeTo: "pro",
      });
    }

    const inviteToken = uuidv4();
    const inviteExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const agent = await User.create({
      name,
      email,
      role: "agent",
      businessId,
      isActive: false,
      inviteToken,
      inviteExpiry,
    });

    // ✅ FIXED CONFLICT (clean + production safe)
    sendInviteEmail(email, name, inviteToken).catch((err) => {
      console.error("Invite email failed (non-critical):", err.message);
      console.error("Full error:", err);
    });

    res.status(201).json({
      success: true,
      message: "Invite sent",
      agentId: agent._id,
      inviteToken,
    });
  } catch (err) {
    console.error("inviteAgent:", err);
    res.status(500).json({ success: false, message: "Failed to send invite" });
  }
};