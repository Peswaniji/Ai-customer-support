import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRouter from "./routes/auth.routes.js";
import businessRouter from "./routes/business.routes.js";
import agentRouter from "./routes/agent.routes.js";
import ticketRouter from "./routes/ticket.routes.js";
import messageRouter from "./routes/message.routes.js";
import aiRouter from "./routes/ai.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";
import widgetRouter from "./routes/widget.routes.js";

const app = express();

// FIX: Trust proxy — required for Render, Railway, Heroku, Nginx reverse proxy.
// This ensures: req.secure, req.protocol, req.ip all work correctly behind a proxy.
// Also required for express-rate-limit to use real client IP (not proxy IP).
app.set("trust proxy", 1);

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdn.socket.io"],
        frameAncestors: [
          "'self'",
          "http://localhost:3001",
          "http://localhost:5173",
          "http://localhost:3000",
          process.env.CLIENT_URL || "",
        ].filter(Boolean),
      },
    },
  })
);

// FIX: Add body size limit to prevent DoS via large payloads
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// CORS — scoped to allowed origins only
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:3001",
  "http://localhost:3000",
];

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  })
);

// Global rate limiter — prevents DDoS on all routes (100 req/min per IP)
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please slow down.",
  },
  // Skip rate limiting for health check
  skip: (req) => req.path === "/health",
});
app.use(globalLimiter);

// Health check — used by deployment platforms (Render, Railway)
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/business", businessRouter);
app.use("/api/agents", agentRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/messages", messageRouter);
app.use("/api/ai", aiRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/widget", widgetRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, _next) => {
  // Don't log CORS errors as crashes
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ success: false, message: "CORS: Origin not allowed" });
  }
  console.error("Global Error:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
