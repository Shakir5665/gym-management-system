import User from "../models/User.js";
import Gym from "../models/Gym.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🔐 Strong Password Regex: At least 8 chars, 1 number, 1 special character
const strongPasswordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

// Public registration has been disabled. Gyms must be registered by Super Admin.
export const register = async (req, res) => {
  res.status(403).json({ message: "Public registration is disabled. Please contact system administrator." });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
     return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });

    // ❌ USER NOT FOUND
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const valid = await bcrypt.compare(password, user.password);

    // ❌ WRONG PASSWORD
    if (!valid) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { userId: user._id, gymId: user.gymId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ 
      token,
      hasGym: !!user.gymId,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gymId: user.gymId,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    
    // 🛡️ Check if new email is already taken by another user
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: userId } });
      if (existing) return res.status(400).json({ message: "This email is already in use by another account" });
    }

    const user = await User.findByIdAndUpdate(userId, { name, email }, { new: true });
    res.json({ 
      user: { id: user._id, name: user.name, email: user.email, gymId: user.gymId }, 
      message: "Profile updated successfully" 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (!newPassword) return res.status(400).json({ message: "New password is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🛡️ Validate New Password Strength
    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: "New password must be at least 8 characters long and include at least one number and one special character (!@#$%^&*)" 
      });
    }

    // 🛡️ Hash and Save (Removing current password check as requested)
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};