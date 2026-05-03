import Business from "../models/business.model.js";

const monthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const nextMonthStart = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 1);

const isNewBillingMonth = (lastReset, now) =>
  now.getFullYear() > lastReset.getFullYear() || now.getMonth() > lastReset.getMonth();

export const checkAndIncrementUsage = async (businessId) => {
  const business = await Business.findById(businessId).lean();
  if (!business) {
    return { allowed: false, reason: "Business not found", code: "BUSINESS_NOT_FOUND" };
  }

  const now = new Date();
  const lastReset = new Date(business.usage.usageResetDate);

  if (isNewBillingMonth(lastReset, now)) {
    await Business.findByIdAndUpdate(businessId, {
      $set: {
        "usage.chatsThisMonth": 0,
        "usage.usageResetDate": monthStart(now),
      },
    });
  }

  const limit = business.planLimits.maxChatsPerMonth;
  const updated = await Business.findOneAndUpdate(
    {
      _id: businessId,
      "usage.chatsThisMonth": { $lt: limit },
    },
    { $inc: { "usage.chatsThisMonth": 1 } },
    { new: true }
  ).lean();

  if (updated) {
    return { allowed: true };
  }

  const latest = await Business.findById(businessId).lean();
  if (!latest) {
    return { allowed: false, reason: "Business not found", code: "BUSINESS_NOT_FOUND" };
  }

  const resetDate = nextMonthStart(new Date(latest.usage.usageResetDate));
  return {
    allowed: false,
    code: "MONTHLY_LIMIT_REACHED",
    reason: `Monthly ticket limit of ${latest.planLimits.maxChatsPerMonth} reached on your ${latest.plan} plan.`,
    currentUsage: latest.usage.chatsThisMonth,
    limit: latest.planLimits.maxChatsPerMonth,
    resetsOn: resetDate.toISOString(),
    upgradeTo: latest.plan === "free" ? "pro" : null,
  };
};

export const getUsageStats = async (businessId) => {
  const business = await Business.findById(businessId).lean();
  if (!business) return null;

  const now = new Date();
  const lastReset = new Date(business.usage.usageResetDate);

  if (isNewBillingMonth(lastReset, now)) {
    const updated = await Business.findByIdAndUpdate(
      businessId,
      {
        $set: {
          "usage.chatsThisMonth": 0,
          "usage.usageResetDate": monthStart(now),
        },
      },
      { new: true }
    ).lean();

    return {
      chatsThisMonth: 0,
      maxAgents: updated.planLimits.maxAgents,
      maxChatsPerMonth: updated.planLimits.maxChatsPerMonth,
      percentUsed: 0,
      resetsOn: nextMonthStart(now).toISOString(),
      plan: updated.plan,
    };
  }

  const nextReset = nextMonthStart(lastReset);
  return {
    chatsThisMonth: business.usage.chatsThisMonth,
    maxAgents: business.planLimits.maxAgents,
    maxChatsPerMonth: business.planLimits.maxChatsPerMonth,
    percentUsed: Math.round(
      (business.usage.chatsThisMonth / business.planLimits.maxChatsPerMonth) * 100
    ),
    resetsOn: nextReset.toISOString(),
    plan: business.plan,
  };
};
