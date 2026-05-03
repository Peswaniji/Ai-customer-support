import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Attempting reconnect...");
    });
    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
    });
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB error:", err.message);
    });

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // fail fast if Atlas unreachable
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
