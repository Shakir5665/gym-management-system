import Gym from "../models/Gym.js";
import User from "../models/User.js";
import Member from "../models/Member.js";
import Attendance from "../models/Attendance.js";
import Payment from "../models/Payment.js";
import bcrypt from "bcryptjs";

export const getGyms = async (req, res) => {
  try {
    const gyms = await Gym.find().sort({ createdAt: -1 }).lean();
    
    // 🚀 BATCH ENRICHMENT (Avoids N+1 queries)
    const gymIds = gyms.map(g => g._id);
    const ownerIds = gyms.map(g => g.ownerId).filter(Boolean);

    const [memberCounts, owners] = await Promise.all([
      Member.aggregate([
        { $match: { gymId: { $in: gymIds } } },
        { $group: { _id: "$gymId", count: { $sum: 1 } } }
      ]),
      User.find({ _id: { $in: ownerIds } }).select("name email").lean()
    ]);

    // Create lookup maps for instant access
    const countMap = Object.fromEntries(memberCounts.map(c => [c._id.toString(), c.count]));
    const ownerMap = Object.fromEntries(owners.map(o => [o._id.toString(), o]));

    const enrichedGyms = gyms.map(gym => ({
      ...gym,
      memberCount: countMap[gym._id.toString()] || 0,
      owner: ownerMap[gym.ownerId?.toString()]
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
    const [totalGyms, totalMembers] = await Promise.all([
      Gym.countDocuments().lean(),
      Member.countDocuments().lean()
    ]);

    res.json({
      totalGyms,
      totalMembers
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const registerGym = async (req, res) => {
  try {
    const { name, email, password, gymName } = req.body;

    if (!name || !email || !password || !gymName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "A user with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // 1. Create Owner User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: "ADMIN"
    });

    // 2. Create Gym
    const gym = await Gym.create({
      name: gymName.trim(),
      ownerId: user._id,
      isApproved: true, // Super admin created gyms are pre-approved
      isActive: true
    });

    // 3. Link User to Gym
    user.gymId = gym._id;
    await user.save();

    res.json({ message: "Gym and owner registered successfully", gym, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const scheduleGymDeletion = async (req, res) => {
  try {
    const { id } = req.params;
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 15);

    const gym = await Gym.findByIdAndUpdate(id, { 
      scheduledDeletionAt: deletionDate,
      isActive: false 
    }, { new: true });

    if (!gym) return res.status(404).json({ message: "Gym not found" });

    res.json({ message: "Gym scheduled for deletion in 15 days", gym });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const revokeGymDeletion = async (req, res) => {
  try {
    const { id } = req.params;

    const gym = await Gym.findByIdAndUpdate(id, { 
      scheduledDeletionAt: null,
      isActive: true 
    }, { new: true });

    if (!gym) return res.status(404).json({ message: "Gym not found" });

    res.json({ message: "Gym deletion revoked successfully", gym });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
