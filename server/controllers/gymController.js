import Gym from "../models/Gym.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const createGym = async (req, res) => {
  try {
    const { gymName } = req.body;
    const userId = req.user?.userId;

    console.log("🔧 Creating gym - userId:", userId, "gymName:", gymName);

    if (!gymName || !gymName.trim()) {
      return res.status(400).json({ message: "Gym name is required" });
    }

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Create gym
    const gym = await Gym.create({
      name: gymName.trim(),
      ownerId: userId
    });

    console.log("✅ Gym created:", gym._id);

    // Update user with gym ID
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { gymId: gym._id },
      { new: true }
    );

    console.log("✅ User updated with gymId:", gym._id);

    // 🔑 Generate NEW token with updated gymId
    const newToken = jwt.sign(
      { userId: updatedUser._id, gymId: gym._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ 
      token: newToken,
      gymId: gym._id,
      hasGym: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        gymId: gym._id
      },
      message: "Gym created successfully"
    });

  } catch (err) {
    console.error("❌ Gym creation error:", err);
    res.status(500).json({ message: err.message || "Failed to create gym" });
  }
};

export const getMyGym = async (req, res) => {
  try {
    const gymId = req.user?.gymId;
    if (!gymId) return res.status(404).json({ message: "No gym linked to user" });
    const gym = await Gym.findById(gymId).select("name ownerId createdAt logo");
    if (!gym) return res.status(404).json({ message: "Gym not found" });
    res.json(gym);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateLogo = async (req, res) => {
  try {
    const gymId = req.user?.gymId;
    const { logo } = req.body;
    
    if (!gymId) return res.status(404).json({ message: "No gym linked to user" });
    if (!logo) return res.status(400).json({ message: "Logo is required" });
    
    const gym = await Gym.findByIdAndUpdate(gymId, { logo }, { new: true });
    if (!gym) return res.status(404).json({ message: "Gym not found" });
    
    res.json({ message: "Logo updated successfully", logo: gym.logo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateGymProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const gymId = req.user?.gymId;
    if (!gymId) return res.status(404).json({ message: "No gym linked" });
    
    const gym = await Gym.findByIdAndUpdate(gymId, { name }, { new: true });
    res.json({ gym: { name: gym.name }, message: "Gym updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};