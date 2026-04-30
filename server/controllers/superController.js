import Gym from "../models/Gym.js";
import User from "../models/User.js";
import Member from "../models/Member.js";
import Attendance from "../models/Attendance.js";
import Payment from "../models/Payment.js";

export const getGyms = async (req, res) => {
  try {
    const gyms = await Gym.find().sort({ createdAt: -1 });
    
    // Enrich gyms with member counts
    const enrichedGyms = await Promise.all(gyms.map(async (gym) => {
      const memberCount = await Member.countDocuments({ gymId: gym._id });
      const owner = await User.findById(gym.ownerId).select("name email");
      return {
        ...gym.toObject(),
        memberCount,
        owner
      };
    }));

    res.json(enrichedGyms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleGymStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, isApproved } = req.body;

    const updateData = {};
    if (typeof isActive !== "undefined") updateData.isActive = isActive;
    if (typeof isApproved !== "undefined") updateData.isApproved = isApproved;

    const gym = await Gym.findByIdAndUpdate(id, updateData, { new: true });
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    res.json({ message: "Gym status updated successfully", gym });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getGlobalStats = async (req, res) => {
  try {
    const [totalGyms, totalMembers, totalPayments, totalCheckins] = await Promise.all([
      Gym.countDocuments(),
      Member.countDocuments(),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      Attendance.countDocuments({ status: "SUCCESS" })
    ]);

    res.json({
      totalGyms,
      totalMembers,
      totalRevenue: totalPayments[0]?.total || 0,
      totalCheckins
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
