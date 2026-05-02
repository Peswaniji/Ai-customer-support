import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import authRouter from "./routes/auth.routes.js";
import businessRouter from "./routes/business.routes.js";
import agentRouter from "./routes/agent.routes.js";
import ticketRouter from "./routes/ticket.routes.js";
import messageRouter from "./routes/message.routes.js";
import aiRouter from "./routes/ai.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";
import widgetRouter from "./routes/widget.routes.js";

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      frameAncestors: ["'self'", "http://localhost:3001", "http://localhost:5173", "http://localhost:3000"],
    },
  },
}));

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    const whitelist = [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:3001",
      "http://localhost:3000",
    ];
    if (!origin) return callback(null, true);
    if (whitelist.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
}));

app.use("/api/auth",      authRouter);
app.use("/api/business",  businessRouter);
app.use("/api/agents",    agentRouter);
app.use("/api/tickets",   ticketRouter);
app.use("/api/messages",  messageRouter);
app.use("/api/ai",        aiRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/widget",    widgetRouter);

app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;