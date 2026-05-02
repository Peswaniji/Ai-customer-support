import Message from "../models/message.model.js";
import Ticket from "../models/ticket.model.js";

// GET /api/messages/:ticketId
export const getMessages = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    // Scope check
    if (
      req.user.role !== "super_admin" &&
      String(ticket.businessId) !== String(req.user.businessId)
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const filter = { ticketId };
    // Customers cannot see internal notes
    if (req.user.role === "customer") filter.isInternal = false;

    const messages = await Message.find(filter).sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (err) {
    console.error("getMessages:", err);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};

// POST /api/messages/:ticketId — HTTP fallback (primary is Socket.io)
export const sendMessage = async (req, res) => {
  try {
    const { content, isInternal = false } = req.body;
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const message = await Message.create({
      ticketId,
      businessId: ticket.businessId,
      senderId: req.user._id,
      senderRole: req.user.role,
      content,
      isInternal,
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    console.error("sendMessage:", err);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};