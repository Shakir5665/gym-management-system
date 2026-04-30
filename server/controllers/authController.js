import User from "../models/User.js";
import Gym from "../models/Gym.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 🔐 Strong Password Regex: At least 8 chars, 1 number, 1 special character
const strongPasswordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

export const register = async (req, res) => {
  try {
    const { name, email, password, gymName } = req.body;

    if (!name || !email || !password || !gymName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long and include at least one number and one special character (!@#$%^&*)" 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed
    });

    const gym = await Gym.create({
      name: gymName,
      ownerId: user._id
    });

    user.gymId = gym._id;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, gymId: gym._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ 
      token,
      hasGym: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gymId: gym._id
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // 🔐 Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const { email, name, sub, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: "Google email not verified" });
    }

    let user = await User.findOne({ email });

    // ✅ Existing user → LINK account
    if (user) {
      if (!user.googleId) {
        user.googleId = sub;
        user.provider = "google";
        await user.save();
      }
    } else {
      // 🆕 New user (NO gym yet)
      user = await User.create({
        name,
        email,
        googleId: sub,
        provider: "google"
      });
    }

    const tokenJWT = jwt.sign(
      { userId: user._id, gymId: user.gymId || null, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token: tokenJWT,
      hasGym: !!user.gymId,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        googleId: user.googleId,
        gymId: user.gymId,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🆕 GOOGLE REGISTRATION (for Register page)
export const googleRegister = async (req, res) => {
  try {
    const { token, gymName } = req.body;

    if (!gymName || !gymName.trim()) {
      return res.status(400).json({ message: "Gym name is required" });
    }

    // 🔐 Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: "Google email not verified" });
    }

    // ❌ CHECK IF USER ALREADY EXISTS
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🆕 Create new user with gym
    const user = await User.create({
      name,
      email,
      googleId: sub,
      provider: "google"
    });

    // 🏋️ Create gym
    const gym = await Gym.create({
      name: gymName.trim(),
      ownerId: user._id
    });

    // 🔗 Link gym to user
    user.gymId = gym._id;
    await user.save();

    // 🔐 Generate token with gymId
    const tokenJWT = jwt.sign(
      { userId: user._id, gymId: gym._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token: tokenJWT,
      hasGym: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        googleId: user.googleId,
        gymId: gym._id
      },
      message: "Registration successful"
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
      user: { id: user._id, name: user.name, email: user.email, gymId: user.gymId, googleId: user.googleId }, 
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

    console.log(`\n========================================`);
    console.log(`🔐 PASSWORD RESET OTP FOR ${email}: ${otp}`);
    console.log(`========================================\n`);

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: `"Gym Management System" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Password Reset OTP",
          text: `Your password reset OTP is: ${otp}\n\nIt is valid for 10 minutes.`
        });
      }
    } catch (mailErr) {
      console.log("Failed to send email, but OTP generated in console:", mailErr.message);
    }

    res.json({ message: "OTP generated successfully. If email is not configured, check the backend terminal." });
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