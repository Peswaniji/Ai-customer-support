import User from "../models/user.model.js";
import Ticket from "../models/ticket.model.js";

// GET /api/agents
export const getAgents = async (req, res) => {
  try {
    const agents = await User.find({
      businessId: req.user.businessId,
      role: "agent",
    }).select("-password -refreshToken -inviteToken -inviteExpiry");

    res.json({ success: true, agents });
  } catch (err) {
    console.error("getAgents:", err);
    res.status(500).json({ success: false, message: "Failed to fetch agents" });
  }
};

// PATCH /api/agents/availability
export const updateAvailability = async (req, res) => {
  try {
    const { availabilityStatus } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { availabilityStatus },
      { new: true }
    ).select("-password -refreshToken");

    res.json({ success: true, availabilityStatus: user.availabilityStatus });
  } catch (err) {
    console.error("updateAvailability:", err);
    res.status(500).json({ success: false, message: "Failed to update availability" });
  }
};

// PATCH /api/agents/:agentId/status
export const updateAgentStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const agent = await User.findOneAndUpdate(
      { _id: req.params.agentId, businessId: req.user.businessId },
      { isActive },
      { new: true }
    ).select("-password -refreshToken");

    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found" });
    }

    res.json({ success: true, agent });
  } catch (err) {
    console.error("updateAgentStatus:", err);
    res.status(500).json({ success: false, message: "Failed to update agent status" });
  }
};