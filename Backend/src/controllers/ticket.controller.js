import Ticket from "../models/ticket.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { classifyQuery, generateSummary } from "../services/ai.service.js";
import { invalidateCache } from "../middlewares/cache.middleware.js";

// Auto assign to most available agent
const autoAssignAgent = async (businessId) => {
  const agents = await User.find({
    businessId,
    role: "agent",
    isActive: true,
    availabilityStatus: "available",
  });
  if (agents.length === 0) return null;

  const ticketCounts = await Promise.all(
    agents.map(async (a) => ({
      agentId: a._id,
      count: await Ticket.countDocuments({
        assignedAgentId: a._id,
        status: { $in: ["open", "in_progress"] },
      }),
    }))
  );
  ticketCounts.sort((a, b) => a.count - b.count);
  return ticketCounts[0].agentId;
};

// POST /api/tickets
export const createTicket = async (req, res) => {
  try {
    const { subject, description } = req.body;
    const businessId = req.user.businessId;
    const customerId = req.user._id;

    const ticket = await Ticket.create({
      businessId, customerId, subject, description,
    });

    // Respond immediately
    res.status(201).json({ success: true, ticket });

    
    // AI classification — async non-blocking
try {
  console.log("🤖 Starting AI classification for ticket:", ticket._id);
  const classification = await classifyQuery(subject, description);
  console.log("🤖 AI classification result:", JSON.stringify(classification));

  ticket.category = classification.category || "general";
  ticket.priority = classification.priority || "low";
  ticket.aiConfidenceScore = classification.confidence;

  if (classification.canAutoResolve && classification.confidence >= 80) {
    console.log("🤖 Auto-resolving ticket via AI");
    ticket.status = "auto_resolved";
    ticket.aiHandled = true;
    ticket.resolvedAt = new Date();
    await ticket.save();

    await Message.create({
      ticketId: ticket._id,
      businessId,
      senderId: "ai",
      senderRole: "ai",
      content: classification.suggestedReply,
    });
    console.log("🤖 AI message created");
  } else {
    console.log("🤖 Routing to human agent");
    const agentId = await autoAssignAgent(businessId);
    ticket.status = agentId ? "in_progress" : "open";
    ticket.assignedAgentId = agentId || null;
    await ticket.save();
  }

  await invalidateCache(businessId.toString());
} catch (aiErr) {
  console.error("❌ AI classification failed:", aiErr.message);
  console.error("❌ Full error:", aiErr);
  ticket.status = "open";
  await ticket.save();
} 
  } catch (err) {
    console.error("createTicket:", err);
    res.status(500).json({ success: false, message: "Failed to create ticket" });
  }
};

// GET /api/tickets
export const getTickets = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user.role === "super_admin") {
      // sees everything
    } else if (req.user.role === "business_admin") {
      filter.businessId = req.user.businessId;
    } else if (req.user.role === "agent") {
      filter.assignedAgentId = req.user._id;
      filter.businessId = req.user.businessId;
    } else if (req.user.role === "customer") {
      filter.customerId = req.user._id;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tickets = await Ticket.find(filter)
      .populate("customerId", "name email")
      .populate("assignedAgentId", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Ticket.countDocuments(filter);

    res.json({
      success: true,
      tickets,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("getTickets:", err);
    res.status(500).json({ success: false, message: "Failed to fetch tickets" });
  }
};

// GET /api/tickets/:ticketId
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId)
      .populate("customerId", "name email")
      .populate("assignedAgentId", "name email");

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

    res.json({ success: true, ticket });
  } catch (err) {
    console.error("getTicketById:", err);
    res.status(500).json({ success: false, message: "Failed to fetch ticket" });
  }
};

// PATCH /api/tickets/:ticketId/status
export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    ticket.status = status;
    if (status === "resolved" || status === "closed") {
      ticket.resolvedAt = new Date();
      // Generate AI summary async
      generateAISummary(ticket._id).catch(console.error);
    }
    await ticket.save();

    await invalidateCache(ticket.businessId.toString());
    res.json({ success: true, ticket });
  } catch (err) {
    console.error("updateTicketStatus:", err);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

// PATCH /api/tickets/:ticketId/assign
export const assignTicket = async (req, res) => {
  try {
    const { agentId } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.ticketId,
      { assignedAgentId: agentId, status: "in_progress" },
      { new: true }
    );
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }
    await invalidateCache(ticket.businessId.toString());
    res.json({ success: true, ticket });
  } catch (err) {
    console.error("assignTicket:", err);
    res.status(500).json({ success: false, message: "Failed to assign ticket" });
  }
};

// PATCH /api/tickets/:ticketId/priority
export const updatePriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.ticketId,
      { priority },
      { new: true }
    );
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }
    res.json({ success: true, ticket });
  } catch (err) {
    console.error("updatePriority:", err);
    res.status(500).json({ success: false, message: "Failed to update priority" });
  }
};

// POST /api/tickets/:ticketId/rate
export const rateTicket = async (req, res) => {
  try {
    const { rating } = req.body;
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }
    if (!["resolved", "auto_resolved", "closed"].includes(ticket.status)) {
      return res.status(400).json({
        success: false,
        message: "Can only rate resolved tickets",
      });
    }
    ticket.customerRating = rating;
    await ticket.save();
    res.json({ success: true, message: "Rating saved" });
  } catch (err) {
    console.error("rateTicket:", err);
    res.status(500).json({ success: false, message: "Failed to save rating" });
  }
};

// Internal — generate and store AI summary
const generateAISummary = async (ticketId) => {
  const messages = await Message.find({
    ticketId,
    isInternal: false,
  }).sort("createdAt");
  if (messages.length === 0) return;
  const summary = await generateSummary(messages);
  await Ticket.findByIdAndUpdate(ticketId, { aiSummary: summary });
};