import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    industry: { type: String, default: "General" },
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    // plan limits — used by dashboard usage cards
    planLimits: {
      maxAgents:        { type: Number, default: 2 },
      maxChatsPerMonth: { type: Number, default: 100 },
    },
    // live usage counters — used by dashboard
    usage: {
      chatsThisMonth: { type: Number, default: 0 },
      usageResetDate: { type: Date, default: () => new Date() },
    },
    widgetConfig: {
      color:               { type: String, default: "#1E40AF" },
      welcomeMessage:      { type: String, default: "Hi! How can we help you today?" },
      autoReplyEnabled:    { type: Boolean, default: true },
      confidenceThreshold: { type: Number, default: 80 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Business", businessSchema);