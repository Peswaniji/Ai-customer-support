import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import authRouter from "./routes/auth.routes.js";

const app = express();

// ── Security headers ───────────────────────────────────────
app.use(helmet());

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL || "http://localhost:5173",
}));

// ── Routes ─────────────────────────────────────────────────
app.use("/api/auth", authRouter);

// app.use("/api/business",  businessRouter);
// app.use("/api/agents",    agentRouter);
// app.use("/api/tickets",   ticketRouter);
// app.use("/api/messages",  messageRouter);
// app.use("/api/ai",        aiRouter);
// app.use("/api/analytics", analyticsRouter);

// ── Global error handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;