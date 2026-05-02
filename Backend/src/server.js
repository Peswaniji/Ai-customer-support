import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";
import mongoose from "mongoose";
import { createServer } from "http";
import { initSocket } from "./utils/socket.js";

// Dynamic import — redis.js tab load hoga jab dotenv already set ho
await import("./config/redis.js");

connectDB();

let server;
let io;

// Start server with graceful shutdown support and Socket.io
const startServer = async () => {
  try {
    const port = process.env.PORT || 3000;
    const httpServer = createServer(app);
    server = httpServer.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`📌 Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // initialize socket.io
    io = await initSocket(httpServer, { origins: [process.env.CLIENT_URL || "http://localhost:5173", "http://localhost:3001", "http://localhost:3000"] });
    console.log("🔌 Socket.io initialized");
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

// Graceful shutdown handler (critical for zero-downtime deployments)
const gracefulShutdown = async (signal) => {
  console.log(`\n⏹️  Received ${signal}. Starting graceful shutdown...`);
  
  if (server) {
    server.close(async () => {
      console.log("✅ HTTP server closed");
      
      try {
        // Close MongoDB connection
        await mongoose.connection.close();
        console.log("✅ MongoDB disconnected");
      } catch (err) {
        console.error("❌ MongoDB close error:", err);
      }
      
      console.log("✅ Graceful shutdown complete");
      process.exit(0);
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
      console.error("❌ Forced shutdown after 30s timeout");
      process.exit(1);
    }, 30000);
  }
};

// Listen for termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});

startServer();