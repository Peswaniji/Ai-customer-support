import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import User from "../models/user.model.js";
import Business from "../models/business.model.js";
import { sendInviteEmail, sendWelcomeEmail } from "../services/email.service.js";
import { blacklistToken } from "../middlewares/cache.middleware.js";

const refreshTokenMaxAgeMs = () => {
  const expires = process.env.JWT_REFRESH_EXPIRES || "7d";
  const match = /^(\d+)([dhm])$/.exec(expires);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const value = Number(match[1]);
  const unit = match[2];
  const multipliers = {
    d: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    m: 60 * 1000,
  };
  return value * multipliers[unit];
};

const refreshCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };
};

const signAccessToken = (userId, role, businessId) =>
  jwt.sign({ userId, role, businessId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  });

const signRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
  });

// FIX: cookie settings — sameSite "none" needed for cross-origin iframe (widget) in prod
const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    ...refreshCookieOptions(),
    maxAge: refreshTokenMaxAgeMs(),
  });
};

export const registerBusiness = async (req, res) => {
  try {
    const { businessName, email, password, industry } = req.body;

    const existingUser = await User.findOne({
      email,
      role: { $in: ["business_admin", "agent", "super_admin"] },
    });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // FIX: exclude customers from staff login — customers have no password
    const user = await User.findOne({ email, role: { $ne: "customer" } }).select("+password");
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.password) {
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

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token" });
    }
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId).select("+refreshToken");
    if (!user || user.refreshToken !== token || !user.isActive) {
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

export const logout = async (req, res) => {
  try {
    // FIX: Blacklist the current access token so it can't be used after logout
    // even if it hasn't expired yet
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const accessToken = authHeader.split(" ")[1];
      try {
        const decoded = jwt.decode(accessToken);
        if (decoded?.exp) {
          const ttl = decoded.exp - Math.floor(Date.now() / 1000);
          if (ttl > 0) {
            await blacklistToken(accessToken, ttl);
          }
        }
      } catch (_) {
        // non-critical — token already invalid
      }
    }

    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.clearCookie("refreshToken", refreshCookieOptions());
    res.json({ success: true, message: "Logged out" });
  } catch {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

export const customerSession = async (req, res) => {
  try {
    const { name, email, businessId } = req.body;

    const businessExists = await Business.exists({ _id: businessId, isActive: true });
    if (!businessExists) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    let customer = await User.findOne({ email, businessId, role: "customer" });
    if (!customer) {
      customer = await User.create({
        name,
        email,
        role: "customer",
        businessId,
        isActive: true,
      });
    } else if (customer.name !== name) {
      customer.name = name;
      await customer.save();
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
    // Handle race condition on unique index
    if (err.code === 11000) {
      try {
        const { email, businessId } = req.body;
        const customer = await User.findOne({ email, businessId, role: "customer" });
        if (customer) {
          const accessToken = signAccessToken(customer._id, "customer", customer.businessId);
          return res.json({
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
        }
      } catch (_err) {
        // Duplicate-key recovery is best-effort.
      }
    }
    console.error("customerSession:", err);
    res.status(500).json({ success: false, message: "Failed to create session" });
  }
};

export const inviteAgent = async (req, res) => {
  try {
    const { name, email } = req.body;
    const businessId = req.user.businessId;

    const existing = await User.findOne({
      email,
      role: { $in: ["business_admin", "agent", "super_admin"] },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    const currentAgentCount = await User.countDocuments({ businessId, role: "agent" });

    if (currentAgentCount >= business.planLimits.maxAgents) {
      return res.status(403).json({
        success: false,
        message: `Your ${business.plan} plan allows maximum ${business.planLimits.maxAgents} agents. Please upgrade.`,
        code: "PLAN_LIMIT_REACHED",
        currentCount: currentAgentCount,
        maxAllowed: business.planLimits.maxAgents,
        upgradeTo: "pro",
      });
    }

    const inviteToken = randomUUID();
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

   sendInviteEmail(email, name, inviteToken).catch((err) => {
  console.error("❌ Invite email failed:", err.message);
});
    res.status(201).json({
      success: true,
      message: "Invite sent",
      agentId: agent._id,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }
    console.error("inviteAgent:", err);
    res.status(500).json({ success: false, message: "Failed to send invite" });
  }
};

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

export const getMe = async (req, res) => {
  try {
    res.json({ success: true, user: req.user }); // ✅ directly req.user return karo
  } catch (err) {
    console.error("getMe:", err);
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};
