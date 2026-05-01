import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    ticketId:   { type: mongoose.Schema.Types.ObjectId, ref: "Ticket",   required: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    senderId:   { type: mongoose.Schema.Types.Mixed, required: true },
    senderRole: { type: String, enum: ["customer", "agent", "ai", "system"], required: true },
    content:    { type: String, required: true, maxlength: 5000 },
    isInternal: { type: Boolean, default: false },
    isRead:     { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ ticketId: 1, createdAt: 1 });
messageSchema.index({ businessId: 1 });

export default mongoose.model("Message", messageSchema);