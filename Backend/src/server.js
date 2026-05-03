import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";
import mongoose from "mongoose";
import { createServer } from "http";
import { initSocket } from "./utils/socket.js";
import redisClient from "./config/redis.js";
import { validateEnv } from "./config/env.js";

const startServer = async () => {
  try {
    validateEnv();
    // Connect DB first, then start server
    await connectDB();

    const port = process.env.PORT || 3000;
    const httpServer = createServer(app);

    await initSocket(httpServer, {
      origins: [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:3001",
        "http://localhost:3000",
      ],
    });

    httpServer.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`📌 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔌 Socket.io initialized`);
    });

    return httpServer;
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

// Graceful shutdown — close everything in correct order:
// 1. Stop accepting new requests (HTTP server close)
// 2. Close Redis (flush pending writes)
// 3. Close MongoDB (flush pending writes)
// 4. Exit
const gracefulShutdown = async (signal) => {
  console.log(`\n⏹️  Received ${signal}. Starting graceful shutdown...`);

  // Force exit after 30s no matter what
  const forceExit = setTimeout(() => {
    console.error("❌ Forced shutdown after 30s timeout");
    process.exit(1);
  }, 30000);
  forceExit.unref(); // don't let this timer keep process alive

  try {
    // 1. Stop HTTP server (stop accepting new connections)
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log("✅ HTTP server closed");
    }

    // 2. Close Redis
    try {
      await redisClient.quit();
      console.log("✅ Redis disconnected");
    } catch (err) {
      console.warn("⚠️  Redis close error:", err.message);
    }

    // 3. Close MongoDB
    await mongoose.connection.close();
    console.log("✅ MongoDB disconnected");

    console.log("✅ Graceful shutdown complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Shutdown error:", err);
    process.exit(1);
  }
};

let server;

startServer().then((httpServer) => {
  server = httpServer;
});

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});
