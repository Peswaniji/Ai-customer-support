import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "SET ✅" : "NOT SET ❌");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });


import app from "./app.js";
import { connectDB } from "./config/db.js";
import mongoose from "mongoose";

// Dynamic import — redis.js tab load hoga jab dotenv already set ho
await import("./config/redis.js");

connectDB();

let server;

// Start server with graceful shutdown support (horizontal scaling readiness)
const startServer = async () => {
  try {
    server = app.listen(process.env.PORT || 3000, () => {
      console.log(`✅ Server running on port ${process.env.PORT || 3000}`);
      console.log(`📌 Environment: ${process.env.NODE_ENV || "development"}`);
    });
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