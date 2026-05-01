import mongoose from "mongoose";
import Member from "../models/Member.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Attendance from "../models/Attendance.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Gamification from "../models/Gamification.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js";

const strongPasswordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

// Helper for dates (using noon to avoid timezone-border issues with UTC conversion)
const startOfNoonDay = (d) => {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
};

const addDays = (d, days) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
};

export const memberRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long and include at least one number and one special character (!@#$%^&*)" 
      });
    }

    // 1. Check if they are actually a member in ANY gym
    const memberRecord = await Member.findOne({ email: email.toLowerCase() });
    if (!memberRecord) {
      return res.status(403).json({ 
        message: "You are not registered as a member in any gym. Please contact your gym administrator." 
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists. Please login." });
    }

    // 3. Create User account
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: "MEMBER",
      gymId: memberRecord.gymId
    });

    // 4. Link Member record to User
    memberRecord.userId = user._id;
    await memberRecord.save();

    const token = jwt.sign(
      { userId: user._id, gymId: user.gymId, role: user.role, memberId: memberRecord._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        memberId: memberRecord._id,
        gymId: user.gymId
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBasicProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    // 🚀 EXCLUDE heavy profilePicture for instant text load
    const member = await Member.findOne({ userId })
      .populate("gymId", "name logo")
      .lean();
      
    if (!member) return res.status(404).json({ message: "Member record not found" });
    res.json({ member });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMemberProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const member = await Member.findOne({ userId })
      .populate("gymId", "name logo")
      .lean();
    
    if (!member) return res.status(404).json({ message: "Member record not found" });

    const memberId = member._id;
    const gymId = member.gymId._id;

    // 🏎️ PARALLEL EXECUTION (Much faster)
    const [totalCheckins, gamification] = await Promise.all([
      Attendance.countDocuments({ memberId, status: "SUCCESS" }),
      Gamification.findOne({ memberId, gymId })
    ]);
    
    // 3. Notifications Logic (Non-blocking)
    const notifications = [];
    if (member.subscriptionEnd) {
      const end = new Date(member.subscriptionEnd);
      const now = new Date();
      const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        notifications.push({
          id: "pay_expired",
          type: "DANGER",
          title: "Subscription Expired",
          message: "Your subscription has ended. Please renew to continue using the gym.",
          daysLeft: diffDays
        });
      } else if (diffDays <= 2) {
        notifications.push({
          id: "pay_soon",
          type: "WARNING",
          title: "Payment Due Soon",
          message: `Your subscription will expire in ${diffDays} day${diffDays > 1 ? 's' : ''}.`,
          daysLeft: diffDays
        });
      }
    }

    res.json({
      member,
      stats: {
        totalCheckins,
        points: gamification?.points || 0,
        streak: gamification?.streak || 0
      },
      notifications
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const gymId = req.user.gymId;
    if (!gymId) return res.status(403).json({ message: "Gym ID missing" });

    const limit = 10;
    const topGame = await Gamification.find({ gymId })
      .sort({ streak: -1, points: -1 })
      .limit(limit)
      .lean();

    const memberIds = topGame.map(g => g.memberId);
    const members = await Member.find({ _id: { $in: memberIds } }).select("name").lean();
    const memberMap = new Map(members.map(m => [String(m._id), m.name]));

    const leaderboard = topGame.map(g => ({
      memberId: g.memberId,
      name: memberMap.get(String(g.memberId)) || "Anonymous",
      streak: g.streak || 0,
      points: g.points || 0
    }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMemberProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, homeAddress, emergencyPhone, gender, email, password, profilePicture } = req.body;

    const member = await Member.findOne({ userId });
    if (!member) return res.status(404).json({ message: "Member not found" });

    // Update Member record
    member.name = name || member.name;
    member.phone = phone || member.phone;
    member.homeAddress = homeAddress || member.homeAddress;
    member.emergencyPhone = emergencyPhone || member.emergencyPhone;
    member.gender = gender || member.gender;

    // Handle Profile Picture Upload
    if (profilePicture && profilePicture.startsWith('data:image')) {
      const imageUrl = await uploadToCloudinary(profilePicture, 'gym-system/profiles');
      if (imageUrl) member.profilePicture = imageUrl;
    } else if (profilePicture) {
      member.profilePicture = profilePicture;
    }

    if (email) member.email = email.toLowerCase();
    
    await member.save();

    // Update User record
    const user = await User.findById(userId);
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email.toLowerCase();
      if (member.profilePicture) user.profilePicture = member.profilePicture;
      if (password) {
        if (!strongPasswordRegex.test(password)) {
          return res.status(400).json({ 
            message: "Password must be at least 8 characters long and include at least one number and one special character (!@#$%^&*)" 
          });
        }
        user.password = await bcrypt.hash(password, 10);
      }
      await user.save();
    }

    res.json({ message: "Profile updated successfully", member });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMemberPayments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const member = await Member.findOne({ userId }).select("_id").lean();
    if (!member) return res.status(404).json({ message: "Member record not found" });

    const payments = await Payment.find({ memberId: member._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMemberAttendance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const member = await Member.findOne({ userId }).select("_id").lean();
    if (!member) return res.status(404).json({ message: "Member record not found" });

    const attendance = await Attendance.find({ memberId: member._id })
      .sort({ checkInTime: -1 })
      .limit(50)
      .lean();
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
