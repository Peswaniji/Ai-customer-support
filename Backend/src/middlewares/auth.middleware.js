import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { isTokenBlacklisted } from "./cache.middleware.js";

// verify JWT + attach req.user
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];

    // FIX: Check if token was blacklisted (i.e. user already logged out)
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      return res.status(401).json({ success: false, message: "Token has been revoked" });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.userId).select("-password -refreshToken");
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "User not found or inactive" });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Token expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// role check — usage: authorize("business_admin", "agent")
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized for this route`,
      });
    }
    next();
  };
};

// attach req.businessId — enforces multi-tenant scoping on every query
export const scopeBusiness = (req, res, next) => {
  if (req.user.role === "super_admin") return next();
  if (!req.user.businessId) {
    return res
      .status(403)
      .json({ success: false, message: "No business associated with this account" });
  }
  req.businessId = req.user.businessId;
  next();
};
