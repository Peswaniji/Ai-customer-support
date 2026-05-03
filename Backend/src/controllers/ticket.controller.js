import Ticket from "../models/ticket.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getIO } from "../utils/socket.js";
import { classifyQuery, generateSummary } from "../services/ai.service.js";
import { invalidateCache } from "../middlewares/cache.middleware.js";
import { checkAndIncrementUsage } from "../utils/usageService.js";

// Auto assign to most available agent — uses single aggregate instead of N DB calls
const autoAssignAgent = async (businessId) => {
  const agents = await User.find({
    businessId,
    role: "agent",
    isActive: true,
    availabilityStatus: "available",
  })
    .select("_id")
    .lean();

  if (agents.length === 0) return null;

  const agentIds = agents.map((a) => a._id);
  const ticketCounts = await Ticket.aggregate([
    {
      $match: {
        assignedAgentId: { $in: agentIds },
        status: { $in: ["open", "in_progress"] },
      },
    },
    {
      $group: {
        _id: "$assignedAgentId",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = {};
  for (const row of ticketCounts) {
    countMap[String(row._id)] = row.count;
  }

  let minCount = Infinity;
  let selectedAgent = null;
  for (const agent of agents) {
    const count = countMap[String(agent._id)] || 0;
    if (count < minCount) {
      minCount = count;
      selectedAgent = agent._id;
    }
  }

  return selectedAgent;
};

// POST /api/tickets
export const createTicket = async (req, res) => {
  let ticket;
  try {
    const { subject, description } = req.body;
    const businessId = req.user.businessId;
    const customerId = req.user._id;

    // ── Real usage enforcement ────────────────────────────────
    // Checks limit + auto-resets monthly counter + atomically increments
    const usageCheck = await checkAndIncrementUsage(businessId);
    if (!usageCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: usageCheck.reason,
        code: usageCheck.code,
        currentUsage: usageCheck.currentUsage,
        limit: usageCheck.limit,
        resetsOn: usageCheck.resetsOn,
        upgradeTo: usageCheck.upgradeTo,
      });
    }

    ticket = await Ticket.create({
      businessId,
      customerId,
      subject,
      description,
    });

    // Respond immediately — before AI classification (non-blocking UX)
    res.status(201).json({ success: true, ticket });

    // Socket emit — non-blocking
    try {
      const io = getIO();
      if (io) {
        io.to(`business_${businessId}`).emit("ticket:created", ticket);
      }
    } catch (emitErr) {
      console.error("Socket emit failed:", emitErr.message);
    }
  } catch (err) {
    console.error("createTicket:", err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: "Failed to create ticket" });
    }
    return;
  }

  // ── AI Classification — completely separate async flow ────────
  // Runs AFTER response sent. Errors here never affect the client.
  setImmediate(async () => {
    try {
      console.log("🤖 Starting AI classification for ticket:", ticket._id);
      const classification = await classifyQuery(ticket.subject, ticket.description);
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
          businessId: ticket.businessId,
          senderId: "ai",
          senderRole: "ai",
          content: classification.suggestedReply,
        });
        console.log("🤖 AI message created");

        try {
          const io = getIO();
          if (io) {
            io.to(`business_${ticket.businessId}`).emit("ticket:updated", {
              ticketId: ticket._id,
              status: "auto_resolved",
              aiHandled: true,
            });
          }
        } catch (_err) {
          // Socket notifications are non-critical.
        }
      } else {
        console.log("🤖 Routing to human agent");
        const agentId = await autoAssignAgent(ticket.businessId);
        ticket.status = agentId ? "in_progress" : "open";
        ticket.assignedAgentId = agentId || null;
        await ticket.save();

        if (agentId) {
          try {
            const io = getIO();
            if (io) {
              io.to(`agent_${agentId}`).emit("ticket:assigned", {
                ticketId: ticket._id,
                subject: ticket.subject,
              });
            }
          } catch (_err) {
            // Socket notifications are non-critical.
          }
        }
      }

      await invalidateCache(ticket.businessId.toString());
    } catch (aiErr) {
      console.error("❌ AI classification failed:", aiErr.message);
      try {
        await Ticket.findByIdAndUpdate(ticket._id, { status: "open" });
      } catch (_err) {
        // Best-effort recovery after AI failure.
      }
    }
  });
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

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate("customerId", "name email")
        .populate("assignedAgentId", "name email")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Ticket.countDocuments(filter),
    ]);

    res.json({
      success: true,
      tickets,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
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

    if (
      req.user.role !== "super_admin" &&
      String(ticket.businessId) !== String(req.user.businessId)
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (
      req.user.role === "customer" &&
      String(ticket.customerId._id || ticket.customerId) !== String(req.user._id)
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

    if (
      req.user.role !== "super_admin" &&
      String(ticket.businessId) !== String(req.user.businessId)
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    ticket.status = status;
    if (status === "resolved" || status === "closed") {
      ticket.resolvedAt = new Date();
    }
    await ticket.save();

    await invalidateCache(ticket.businessId.toString());

    if (status === "resolved" || status === "closed") {
      setImmediate(() => generateAISummary(ticket._id).catch(console.error));
    }

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

    const agent = await User.findOne({
      _id: agentId,
      businessId: req.user.businessId,
      role: "agent",
      isActive: true,
    });
    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found in your business" });
    }

    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.ticketId, businessId: req.user.businessId },
      { assignedAgentId: agentId, status: "in_progress" },
      { new: true }
    );
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    await invalidateCache(ticket.businessId.toString());

    try {
      const io = getIO();
      if (io) {
        io.to(`agent_${agentId}`).emit("ticket:assigned", {
          ticketId: ticket._id,
          subject: ticket.subject,
        });
      }
    } catch (_err) {
      // Socket notifications are non-critical.
    }

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
    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.ticketId, businessId: req.user.businessId },
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

    if (String(ticket.customerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (!["resolved", "auto_resolved", "closed"].includes(ticket.status)) {
      return res.status(400).json({
        success: false,
        message: "Can only rate resolved tickets",
      });
    }

    ticket.customerRating = rating;
    await ticket.save();
    await invalidateCache(ticket.businessId.toString());

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
