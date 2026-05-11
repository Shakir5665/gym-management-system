import User from "../models/User.js";
import Gym from "../models/Gym.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendPasswordReset } from "../services/mailService.js";

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
    
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: userId } });
      if (existing) return res.status(400).json({ message: "Email already in use" });
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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`\n========================================`);
      console.log(`🔐 PASSWORD RESET OTP FOR ${email}: ${otp}`);
      console.log(`⚠️  EMAIL NOT CONFIGURED IN ENV`);
      console.log(`========================================\n`);
      return res.json({ 
        message: "OTP generated successfully, but email service is not configured on this server. Check backend console." 
      });
    }

    try {
      await sendPasswordReset(email, { otp });
      res.json({ message: "OTP sent to your email successfully." });
    } catch (mailErr) {
      console.error("❌ FAILED TO SEND EMAIL:", mailErr);
      res.status(500).json({ 
        message: `Mail Error: ${mailErr.message}. Ensure your Gmail App Password is correct.`
      });
    }

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ 
      email, 
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const resetToken = jwt.sign({ userId: user._id, resetPass: true }, process.env.JWT_SECRET, { expiresIn: '15m' });
    
    res.json({ resetToken, message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) return res.status(400).json({ message: "Token and new password required" });

    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long and include at least one number and one special character (!@#$%^&*)" 
      });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (!decoded.resetPass) return res.status(400).json({ message: "Invalid reset token" });

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message === 'jwt expired' ? "Reset session expired" : err.message });
  }
};