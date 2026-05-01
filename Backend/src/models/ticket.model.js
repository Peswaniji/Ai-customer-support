import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    businessId:      { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    customerId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    subject:         { type: String, required: true, maxlength: 200, trim: true },
    description:     { type: String, required: true, maxlength: 2000 },
    category: {
      type: String,
      enum: ["billing", "technical", "general", "complaint", "delivery"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed", "auto_resolved"],
      default: "open",
    },
    aiHandled:         { type: Boolean, default: false },
    aiConfidenceScore: { type: Number,  default: null },
    aiSummary:         { type: String,  default: null },
    customerRating:    { type: Number,  min: 1, max: 5, default: null },
    resolvedAt:        { type: Date,    default: null },
  },
  { timestamps: true }
);

ticketSchema.index({ businessId: 1, status: 1 });
ticketSchema.index({ businessId: 1, assignedAgentId: 1 });
ticketSchema.index({ businessId: 1, createdAt: -1 });
ticketSchema.index({ customerId: 1 });

export default mongoose.model("Ticket", ticketSchema);