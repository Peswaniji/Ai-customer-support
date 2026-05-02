import Ticket from "../models/ticket.model.js";
import User from "../models/user.model.js";
import Business from "../models/business.model.js";

// GET /api/analytics/overview
export const getOverview = async (req, res) => {
  try {
    const businessId = req.businessId;

    const [total, open, inProgress, resolved, autoResolved] = await Promise.all([
      Ticket.countDocuments({ businessId }),
      Ticket.countDocuments({ businessId, status: "open" }),
      Ticket.countDocuments({ businessId, status: "in_progress" }),
      Ticket.countDocuments({ businessId, status: { $in: ["resolved", "closed"] } }),
      Ticket.countDocuments({ businessId, aiHandled: true }),
    ]);

    const totalAgents = await User.countDocuments({
      businessId, role: "agent", isActive: true,
    });

    const business = await Business.findById(businessId);

    const humanResolved = resolved - autoResolved < 0 ? 0 : resolved - autoResolved;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const aiRate = total > 0 ? Math.round((autoResolved / total) * 100) : 0;

    // Avg resolution time
    const resolvedTickets = await Ticket.find({
      businessId,
      resolvedAt: { $ne: null },
    });
    const avgResolutionMs =
      resolvedTickets.length > 0
        ? resolvedTickets.reduce(
            (sum, t) => sum + (t.resolvedAt - t.createdAt), 0
          ) / resolvedTickets.length
        : 0;
    const avgResolutionMin = Math.round(avgResolutionMs / 60000);

    // Avg rating
    const ratedTickets = await Ticket.find({
      businessId, customerRating: { $ne: null },
    });
    const avgRating =
      ratedTickets.length > 0
        ? (
            ratedTickets.reduce((sum, t) => sum + t.customerRating, 0) /
            ratedTickets.length
          ).toFixed(1)
        : null;

    res.json({
      success: true,
      data: {
        totalTickets: total,
        open,
        inProgress,
        resolved,
        autoResolved,
        humanResolved,
        resolutionRate,
        aiRate,
        avgResolutionMin,
        avgRating,
        totalAgents,
        plan: business.plan,
        planLimits: business.planLimits,
        usage: business.usage,
      },
    });
  } catch (err) {
    console.error("getOverview:", err);
    res.status(500).json({ success: false, message: "Failed to fetch overview" });
  }
};

// GET /api/analytics/trends — last 30 days daily ticket count
export const getTrends = async (req, res) => {
  try {
    const businessId = req.businessId;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const results = await Ticket.aggregate([
      { $match: { businessId, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, trends: results });
  } catch (err) {
    console.error("getTrends:", err);
    res.status(500).json({ success: false, message: "Failed to fetch trends" });
  }
};

// GET /api/analytics/agents
export const getAgentStats = async (req, res) => {
  try {
    const businessId = req.businessId;
    const agents = await User.find({ businessId, role: "agent" });

    const agentStats = await Promise.all(
      agents.map(async (agent) => {
        const tickets = await Ticket.find({ assignedAgentId: agent._id, businessId });
        const resolved = tickets.filter((t) =>
          ["resolved", "closed"].includes(t.status)
        );
        const rated = tickets.filter((t) => t.customerRating != null);
        const avgRating =
          rated.length > 0
            ? (
                rated.reduce((s, t) => s + t.customerRating, 0) / rated.length
              ).toFixed(1)
            : null;
        const avgResMs =
          resolved.filter((t) => t.resolvedAt).length > 0
            ? resolved
                .filter((t) => t.resolvedAt)
                .reduce((s, t) => s + (t.resolvedAt - t.createdAt), 0) /
              resolved.filter((t) => t.resolvedAt).length
            : 0;

        return {
          agentId: agent._id,
          name: agent.name,
          email: agent.email,
          availabilityStatus: agent.availabilityStatus,
          isActive: agent.isActive,
          totalTickets: tickets.length,
          resolvedTickets: resolved.length,
          avgResolutionMin: Math.round(avgResMs / 60000),
          avgRating,
        };
      })
    );

    res.json({ success: true, agents: agentStats });
  } catch (err) {
    console.error("getAgentStats:", err);
    res.status(500).json({ success: false, message: "Failed to fetch agent stats" });
  }
};

// GET /api/analytics/all — super admin only
export const getPlatformStats = async (req, res) => {
  try {
    const [totalBusinesses, totalTickets, aiHandled, totalAgents] = await Promise.all([
      Business.countDocuments({ isActive: true }),
      Ticket.countDocuments(),
      Ticket.countDocuments({ aiHandled: true }),
      User.countDocuments({ role: "agent", isActive: true }),
    ]);

    res.json({
      success: true,
      data: {
        totalBusinesses,
        totalTickets,
        totalAgents,
        aiRate: totalTickets > 0
          ? Math.round((aiHandled / totalTickets) * 100)
          : 0,
      },
    });
  } catch (err) {
    console.error("getPlatformStats:", err);
    res.status(500).json({ success: false, message: "Failed to fetch platform stats" });
  }
};