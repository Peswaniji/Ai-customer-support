import User from "../models/user.model.js";
import Business from "../models/business.model.js";
import { getUsageStats } from "../utils/usageService.js";

// GET /api/business/me
export const getMyBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.user.businessId).lean();
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }
    res.json({ success: true, business });
  } catch (err) {
    console.error("getMyBusiness:", err);
    res.status(500).json({ success: false, message: "Failed to fetch business" });
  }
};

// PATCH /api/business/me
export const updateMyBusiness = async (req, res) => {
  try {
    const { name, industry, widgetConfig } = req.body;

    // Build update object safely — no undefined keys
    const update = {};
    if (name) update.name = name;
    if (industry) update.industry = industry;
    if (widgetConfig) {
      // Partial widgetConfig update — only update provided fields
      if (widgetConfig.color) update["widgetConfig.color"] = widgetConfig.color;
      if (widgetConfig.welcomeMessage)
        update["widgetConfig.welcomeMessage"] = widgetConfig.welcomeMessage;
      if (typeof widgetConfig.autoReplyEnabled === "boolean") {
        update["widgetConfig.autoReplyEnabled"] = widgetConfig.autoReplyEnabled;
      }
      if (widgetConfig.confidenceThreshold !== undefined) {
        update["widgetConfig.confidenceThreshold"] = widgetConfig.confidenceThreshold;
      }
    }

    const business = await Business.findByIdAndUpdate(
      req.user.businessId,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    res.json({ success: true, business });
  } catch (err) {
    console.error("updateMyBusiness:", err);
    res.status(500).json({ success: false, message: "Failed to update business" });
  }
};

// GET /api/business/widget-code
export const getWidgetCode = async (req, res) => {
  try {
    const business = await Business.findById(req.user.businessId).lean();
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    // FIX: Use X-Forwarded-Proto for protocol when behind a proxy (Render, Railway, etc.)
    const proto = req.headers["x-forwarded-proto"] || (req.secure ? "https" : req.protocol);
    const baseUrl = `${proto}://${req.get("host")}`;

    const cacheVersion = business.updatedAt ? new Date(business.updatedAt).getTime() : Date.now();
    const snippet = `<script
  src="${baseUrl}/api/widget/${business._id}/loader.js?v=${cacheVersion}"
  data-business-id="${business._id}"
  data-color="${business.widgetConfig.color}"
  data-welcome="${business.widgetConfig.welcomeMessage}"
></script>`;

    res.json({ success: true, snippet });
  } catch (err) {
    console.error("getWidgetCode:", err);
    res.status(500).json({ success: false, message: "Failed to generate widget code" });
  }
};

// GET /api/business/usage
export const getUsageStats_controller = async (req, res) => {
  try {
    const stats = await getUsageStats(req.user.businessId);
    if (!stats) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }
    res.json({ success: true, usage: stats });
  } catch (err) {
    console.error("getUsageStats:", err);
    res.status(500).json({ success: false, message: "Failed to fetch usage" });
  }
};

// PATCH /api/business/upgrade
export const upgradePlan = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!["free", "pro"].includes(plan)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid plan. Choose 'free' or 'pro'" });
    }

    const business = await Business.findById(req.user.businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    // Already on this plan
    if (business.plan === plan) {
      return res.status(400).json({
        success: false,
        message: `You are already on the ${plan} plan`,
      });
    }

    // Downgrade check — if downgrading to free, check current agent count
    if (plan === "free") {
      const agentCount = await User.countDocuments({
        businessId: req.user.businessId,
        role: "agent",
        isActive: true,
      });
      if (agentCount > 2) {
        return res.status(400).json({
          success: false,
          message: `Cannot downgrade to free plan. You have ${agentCount} active agents (free allows max 2). Please deactivate agents first.`,
          code: "DOWNGRADE_BLOCKED",
          currentAgents: agentCount,
          freeLimit: 2,
        });
      }
    }

    const limits = {
      free: { maxAgents: 2, maxChatsPerMonth: 100 },
      pro: { maxAgents: 10, maxChatsPerMonth: 1000 },
    };

    business.plan = plan;
    business.planLimits = limits[plan];
    business.usage.usageResetDate = new Date();
    await business.save();

    res.json({
      success: true,
      message: `Successfully ${plan === "pro" ? "upgraded to Pro" : "downgraded to Free"} plan`,
      business: {
        plan: business.plan,
        planLimits: business.planLimits,
        usage: business.usage,
      },
    });
  } catch (err) {
    console.error("upgradePlan:", err);
    res.status(500).json({ success: false, message: "Failed to change plan" });
  }
};

// GET /api/business/plans — public route, no auth needed
export const getPlans = (req, res) => {
  res.json({
    success: true,
    plans: [
      {
        id: "free",
        name: "Free",
        price: 0,
        currency: "INR",
        billing: "forever",
        limits: {
          maxAgents: 2,
          maxChatsPerMonth: 100,
        },
        features: [
          "2 support agents",
          "100 tickets/month",
          "AI auto-resolution",
          "Real-time chat",
          "Basic analytics",
          "Widget embed",
        ],
        recommended: false,
      },
      {
        id: "pro",
        name: "Pro",
        price: 2999,
        currency: "INR",
        billing: "per month",
        limits: {
          maxAgents: 10,
          maxChatsPerMonth: 1000,
        },
        features: [
          "10 support agents",
          "1000 tickets/month",
          "AI auto-resolution",
          "Real-time chat",
          "Advanced analytics",
          "Widget embed",
          "Priority support",
          "AI reply suggestions",
          "Ticket summaries",
        ],
        recommended: true,
      },
    ],
  });
};

// GET /api/business/all — super admin only
// FIX: Was N+1 queries (one countDocuments per business). Now: single aggregate.
export const getAllBusinesses = async (req, res) => {
  try {
    const [businesses, agentCounts] = await Promise.all([
      Business.find({}).sort({ createdAt: -1 }).lean(),
      // Single aggregate to get agent count per business
      User.aggregate([
        { $match: { role: "agent", isActive: true } },
        { $group: { _id: "$businessId", agentCount: { $sum: 1 } } },
      ]),
    ]);

    // Build lookup map
    const agentCountMap = {};
    for (const row of agentCounts) {
      agentCountMap[String(row._id)] = row.agentCount;
    }

    const result = businesses.map((biz) => ({
      ...biz,
      agentCount: agentCountMap[String(biz._id)] || 0,
    }));

    res.json({ success: true, businesses: result });
  } catch (err) {
    console.error("getAllBusinesses:", err);
    res.status(500).json({ success: false, message: "Failed to fetch businesses" });
  }
};
