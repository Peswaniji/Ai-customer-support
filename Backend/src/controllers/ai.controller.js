import Ticket from "../models/ticket.model.js";
import Message from "../models/message.model.js";
import { getSuggestedReplies } from "../services/ai.service.js";

// POST /api/ai/suggest
export const suggestReplies = async (req, res) => {
  try {
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    if (
      req.user.role !== "super_admin" &&
      String(ticket.businessId) !== String(req.user.businessId)
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const messages = await Message.find({
      ticketId,
      isInternal: false,
    }).sort({ createdAt: 1 });

    const suggestions = await getSuggestedReplies({
      subject: ticket.subject,
      category: ticket.category,
      messages: messages.map((message) => ({
        senderRole: message.senderRole,
        content: message.content,
      })),
    });

    res.json({
      success: true,
      ticketId,
      suggestions,
    });
  } catch (err) {
    console.error("suggestReplies:", err);
    res.status(500).json({ success: false, message: "Failed to generate suggestions" });
  }
}; 