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

// ── POST /api/auth/register-business ─────────────────────────
export const registerBusiness = async (req, res) => {
  try {
    const { businessName, email, password, industry } = req.body;

    // Check duplicate user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    // Check duplicate business
    const existingBusiness = await Business.findOne({ email });
    if (existingBusiness) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const business = await Business.create({ name: businessName, email, industry });
    const user = await User.create({
      name: businessName,
      email,
      password,
      role: "business_admin",
      businessId: business._id,
      isActive: true,
    });

    // Non-blocking — email fail hone pe registration fail nahi hogi
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
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    console.error("registerBusiness:", err);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────
// works for all roles: super_admin, business_admin, agent
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
    console.error("login:", err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// ── POST /api/auth/refresh-token ──────────────────────────────
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token" });
    }
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const newAccessToken = signAccessToken(user._id, user.role, user.businessId);
    const newRefreshToken = signRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });
    setRefreshCookie(res, newRefreshToken);

    res.json({ success: true, accessToken: newAccessToken });
  } catch {
    res.status(401).json({ success: false, message: "Token refresh failed" });
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────
export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.clearCookie("refreshToken");
    res.json({ success: true, message: "Logged out" });
  } catch {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

// ── POST /api/auth/customer-session ──────────────────────────
// customer enters name+email in widget — no password needed
export const customerSession = async (req, res) => {
  try {
    const { name, email, businessId } = req.body;

    // find or create customer scoped to this business
    let customer = await User.findOne({ email, businessId, role: "customer" });
    if (!customer) {
      customer = await User.create({
        name, email,
        role: "customer",
        businessId,
        isActive: true,
      });
    }

    const accessToken = signAccessToken(customer._id, "customer", customer.businessId);
    res.json({
      success: true,
      accessToken,
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        role: "customer",
        businessId,
      },
    });
  } catch (err) {
    console.error("customerSession:", err);
    res.status(500).json({ success: false, message: "Failed to create session" });
  }
};

// ── POST /api/auth/invite-agent ───────────────────────────────
// business_admin invites an agent by email
export const inviteAgent = async (req, res) => {
  try {
    const { name, email } = req.body;
    const businessId = req.user.businessId;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }

    const inviteToken = uuidv4();
    const inviteExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hrs

    const agent = await User.create({
      name, email,
      role: "agent",
      businessId,
      isActive: false, // activated only after set-password
      inviteToken,
      inviteExpiry,
    });

    await sendInviteEmail(email, name, inviteToken);
    res.status(201).json({ success: true, message: "Invite sent", agentId: agent._id });
  } catch (err) {
    console.error("inviteAgent:", err);
    res.status(500).json({ success: false, message: "Failed to send invite" });
  }
};

// ── POST /api/auth/set-password ───────────────────────────────
// agent clicks invite link, sets password, account activated
export const setPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const agent = await User.findOne({
      inviteToken: token,
      inviteExpiry: { $gt: new Date() },
    });
    if (!agent) {
      return res.status(400).json({ success: false, message: "Invite link expired or invalid" });
    }

    agent.password = password;
    agent.isActive = true;
    agent.inviteToken = null;
    agent.inviteExpiry = null;
    await agent.save();

    const accessToken = signAccessToken(agent._id, agent.role, agent.businessId);
    const refreshToken = signRefreshToken(agent._id);
    agent.refreshToken = refreshToken;
    await agent.save({ validateBeforeSave: false });
    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      message: "Account activated",
      accessToken,
      user: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        role: agent.role,
        businessId: agent.businessId,
      },
    });
  } catch (err) {
    console.error("setPassword:", err);
    res.status(500).json({ success: false, message: "Failed to set password" });
  }
};