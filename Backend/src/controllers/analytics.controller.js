import Ticket from "../models/ticket.model.js";
import User from "../models/user.model.js";
import Business from "../models/business.model.js";
import mongoose from "mongoose";
import { getUsageStats } from "../utils/usageService.js";

// GET /api/analytics/overview
export const getOverview = async (req, res) => {
  try {
    const businessId = req.businessId;

    const [statusAgg, ratingAgg, usageStats, totalAgents] = await Promise.all([
      // Status breakdown + avg resolution time — all in ONE query
      Ticket.aggregate([
        { $match: { businessId: new mongoose.Types.ObjectId(businessId) } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            open: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
            resolved: {
              $sum: {
                $cond: [{ $in: ["$status", ["resolved", "closed"]] }, 1, 0],
              },
            },
            autoResolved: { $sum: { $cond: ["$aiHandled", 1, 0] } },
            resolutionTimeSum: {
              $sum: {
                $cond: [
                  { $and: [{ $ne: ["$resolvedAt", null] }, { $ne: ["$createdAt", null] }] },
                  { $subtract: ["$resolvedAt", "$createdAt"] },
                  0,
                ],
              },
            },
            resolvedWithTime: {
              $sum: {
                $cond: [{ $ne: ["$resolvedAt", null] }, 1, 0],
              },
            },
          },
        },
      ]),

      // Avg rating aggregate
      Ticket.aggregate([
        {
          $match: {
            businessId: new mongoose.Types.ObjectId(businessId),
            customerRating: { $ne: null },
          },
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$customerRating" },
          },
        },
      ]),

      // Usage stats — handles auto-reset internally
      getUsageStats(businessId),

      User.countDocuments({ businessId, role: "agent", isActive: true }),
    ]);

    const stats = statusAgg[0] || {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      autoResolved: 0,
      resolutionTimeSum: 0,
      resolvedWithTime: 0,
    };

    const avgResolutionMs =
      stats.resolvedWithTime > 0 ? stats.resolutionTimeSum / stats.resolvedWithTime : 0;
    const avgResolutionMin = Math.round(avgResolutionMs / 60000);

    const avgRating = ratingAgg.length > 0 ? Number(ratingAgg[0].avgRating).toFixed(1) : null;

    const humanResolved = Math.max(0, stats.resolved - stats.autoResolved);
    const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
    const aiRate = stats.total > 0 ? Math.round((stats.autoResolved / stats.total) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalTickets: stats.total,
        open: stats.open,
        inProgress: stats.inProgress,
        resolved: stats.resolved,
        autoResolved: stats.autoResolved,
        humanResolved,
        resolutionRate,
        aiRate,
        avgResolutionMin,
        avgRating,
        totalAgents,
        // Plan + usage now comes from usageService (with auto-reset logic baked in)
        plan: usageStats?.plan,
        planLimits: {
          maxAgents: usageStats?.maxAgents,
          maxChatsPerMonth: usageStats?.maxChatsPerMonth,
        },
        usage: {
          chatsThisMonth: usageStats?.chatsThisMonth,
          percentUsed: usageStats?.percentUsed,
          resetsOn: usageStats?.resetsOn,
        },
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
      {
        $match: {
          businessId: new mongoose.Types.ObjectId(businessId),
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $in: ["$status", ["resolved", "closed", "auto_resolved"]] }, 1, 0],
            },
          },
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

    const [agents, ticketAgg] = await Promise.all([
      User.find({ businessId, role: "agent" })
        .select("_id name email availabilityStatus isActive")
        .lean(),

      Ticket.aggregate([
        { $match: { businessId: new mongoose.Types.ObjectId(businessId) } },
        {
          $group: {
            _id: "$assignedAgentId",
            totalTickets: { $sum: 1 },
            resolvedTickets: {
              $sum: {
                $cond: [{ $in: ["$status", ["resolved", "closed"]] }, 1, 0],
              },
            },
            resolutionTimeSum: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $in: ["$status", ["resolved", "closed"]] },
                      { $ne: ["$resolvedAt", null] },
                    ],
                  },
                  { $subtract: ["$resolvedAt", "$createdAt"] },
                  0,
                ],
              },
            },
            resolvedWithTime: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $in: ["$status", ["resolved", "closed"]] },
                      { $ne: ["$resolvedAt", null] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            ratingSum: {
              $sum: {
                $cond: [{ $ne: ["$customerRating", null] }, "$customerRating", 0],
              },
            },
            ratingCount: {
              $sum: {
                $cond: [{ $ne: ["$customerRating", null] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    const statsMap = {};
    for (const row of ticketAgg) {
      if (row._id) statsMap[String(row._id)] = row;
    }

    const agentStats = agents.map((agent) => {
      const s = statsMap[String(agent._id)] || {
        totalTickets: 0,
        resolvedTickets: 0,
        resolutionTimeSum: 0,
        resolvedWithTime: 0,
        ratingSum: 0,
        ratingCount: 0,
      };

      const avgResMs = s.resolvedWithTime > 0 ? s.resolutionTimeSum / s.resolvedWithTime : 0;
      const avgRating = s.ratingCount > 0 ? (s.ratingSum / s.ratingCount).toFixed(1) : null;

      return {
        agentId: agent._id,
        name: agent.name,
        email: agent.email,
        availabilityStatus: agent.availabilityStatus,
        isActive: agent.isActive,
        totalTickets: s.totalTickets,
        resolvedTickets: s.resolvedTickets,
        avgResolutionMin: Math.round(avgResMs / 60000),
        avgRating,
      };
    });

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
        aiRate: totalTickets > 0 ? Math.round((aiHandled / totalTickets) * 100) : 0,
      },
    });
  } catch (err) {
    console.error("getPlatformStats:", err);
    res.status(500).json({ success: false, message: "Failed to fetch platform stats" });
  }
};
