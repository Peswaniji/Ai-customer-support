import Business from "../models/business.model.js";
import User from "../models/user.model.js";

// GET /api/business/me
export const getMyBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.user.businessId);
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
    const business = await Business.findByIdAndUpdate(
      req.user.businessId,
      {
        ...(name && { name }),
        ...(industry && { industry }),
        ...(widgetConfig && { widgetConfig }),
      },
      { new: true, runValidators: true }
    );
    res.json({ success: true, business });
  } catch (err) {
    console.error("updateMyBusiness:", err);
    res.status(500).json({ success: false, message: "Failed to update business" });
  }
};

// GET /api/business/widget-code
export const getWidgetCode = async (req, res) => {
  try {
    const business = await Business.findById(req.user.businessId);
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const snippet = `<script
  src="${baseUrl}/api/widget/${business._id}/loader.js"
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

// GET /api/business/all — super admin only
export const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({}).sort({ createdAt: -1 });

    // agent count per business
    const businessesWithStats = await Promise.all(
      businesses.map(async (biz) => {
        const agentCount = await User.countDocuments({
          businessId: biz._id,
          role: "agent",
          isActive: true,
        });
        return { ...biz.toObject(), agentCount };
      })
    );

    res.json({ success: true, businesses: businessesWithStats });
  } catch (err) {
    console.error("getAllBusinesses:", err);
    res.status(500).json({ success: false, message: "Failed to fetch businesses" });
  }
};
