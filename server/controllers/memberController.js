import Member from "../models/Member.js";
import Payment from "../models/Payment.js";
import Gym from "../models/Gym.js";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Gamification from "../models/Gamification.js";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import mongoose from "mongoose";
import { sendPaymentReminder } from "../services/mailService.js";

function normalizeMemberPayload(payload = {}) {
  const fullLegalName = String(payload.fullLegalName ?? payload.name ?? "").trim();
  const primaryPhone = String(payload.phone ?? "").trim();
  const emergencyPhone = String(payload.emergencyPhone ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const homeAddress = String(payload.homeAddress ?? "").trim();
  const gender = String(payload.gender ?? "").trim().toUpperCase();
  const dobRaw = String(payload.dateOfBirth ?? "").trim();
  const dateOfBirth = dobRaw ? new Date(dobRaw) : null;

  return {
    name: fullLegalName,
    fullLegalName,
    phone: primaryPhone,
    emergencyPhone,
    email,
    homeAddress,
    gender: gender || undefined,
    dateOfBirth:
      dateOfBirth && !Number.isNaN(dateOfBirth.getTime()) ? dateOfBirth : undefined,
  };
}

export const createMember = async (req, res) => {
  try {
    const data = normalizeMemberPayload(req.body);
    const { fullLegalName, phone } = data;

    if (!fullLegalName || !phone) {
      return res.status(400).json({ message: "Full legal name and primary phone are required" });
    }

    // ❌ CHECK IF USER HAS GYM
    if (!req.user.gymId) {
      return res.status(403).json({ message: "You must create a gym first" });
    }

    const member = await Member.create({
      ...data,
      gymId: req.user.gymId
    });

    const qr = await QRCode.toDataURL(member._id.toString());
    member.qrCode = qr;
    await member.save();

    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMembers = async (req, res) => {
  try {
    // ❌ CHECK IF USER HAS GYM
    if (!req.user.gymId) {
      return res.status(403).json({ message: "You must create a gym first" });
    }

    const q = String(req.query.query || "").trim();
    const hasLimit = req.query.limit !== undefined && req.query.limit !== null && req.query.limit !== "";
    const parsedLimit = Number(req.query.limit);
    const limit = hasLimit && Number.isFinite(parsedLimit)
      ? Math.max(1, Math.min(parsedLimit, 50))
      : 0;

    const filter = { gymId: req.user.gymId };
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { fullLegalName: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { emergencyPhone: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    let query = Member.find(filter)
      .select("-qrCode -profilePicture")
      .lean();
    
    if (limit) query = query.limit(limit);
    const data = await query;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMemberById = async (req, res) => {
  try {
    if (!req.user.gymId) {
      return res.status(403).json({ message: "You must create a gym first" });
    }
    const member = await Member.findOne({ _id: req.params.id, gymId: req.user.gymId });
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    if (!req.user.gymId) {
      return res.status(403).json({ message: "You must create a gym first" });
    }

    const existing = await Member.findOne({ _id: req.params.id, gymId: req.user.gymId });
    if (!existing) return res.status(404).json({ message: "Member not found" });

    const data = normalizeMemberPayload(req.body);
    if (!data.fullLegalName || !data.phone) {
      return res.status(400).json({ message: "Full legal name and primary phone are required" });
    }

    existing.name = data.name;
    existing.fullLegalName = data.fullLegalName;
    existing.phone = data.phone;
    existing.emergencyPhone = data.emergencyPhone;
    existing.email = data.email;
    existing.homeAddress = data.homeAddress;
    existing.gender = data.gender;
    existing.dateOfBirth = data.dateOfBirth || null;

    await existing.save();
    res.json(existing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const banMember = async (req, res) => {
  try {
    if (!req.user.gymId) return res.status(403).json({ message: "You must create a gym first" });
    const { banReason, banFrom, banTo } = req.body;
    const member = await Member.findOne({ _id: req.params.id, gymId: req.user.gymId });
    if (!member) return res.status(404).json({ message: "Member not found" });

    member.isBanned = true;
    member.banReason = banReason;
    member.banFrom = banFrom ? new Date(banFrom) : null;
    member.banTo = banTo ? new Date(banTo) : null;
    await member.save();
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const unbanMember = async (req, res) => {
  try {
    if (!req.user.gymId) return res.status(403).json({ message: "You must create a gym first" });
    const member = await Member.findOne({ _id: req.params.id, gymId: req.user.gymId });
    if (!member) return res.status(404).json({ message: "Member not found" });

    member.isBanned = false;
    member.banReason = null;
    member.banFrom = null;
    member.banTo = null;
    await member.save();
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const fineMember = async (req, res) => {
  try {
    if (!req.user.gymId) return res.status(403).json({ message: "You must create a gym first" });
    const { fineAmount, fineReason } = req.body;
    const member = await Member.findOne({ _id: req.params.id, gymId: req.user.gymId });
    if (!member) return res.status(404).json({ message: "Member not found" });

    member.hasFine = true;
    member.fineAmount = fineAmount;
    member.fineReason = fineReason;
    await member.save();
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const unfineMember = async (req, res) => {
  try {
    if (!req.user.gymId) return res.status(403).json({ message: "You must create a gym first" });
    const member = await Member.findOne({ _id: req.params.id, gymId: req.user.gymId });
    if (!member) return res.status(404).json({ message: "Member not found" });

    member.hasFine = false;
    member.fineAmount = null;
    member.fineReason = null;
    await member.save();
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getExpiringMembers = async (req, res) => {
  try {
    if (!req.user.gymId) {
      return res.status(403).json({ message: "You must create a gym first" });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const members = await Member.find({
      gymId: req.user.gymId,
      subscriptionEnd: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow,
      },
    });

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendMemberReminder = async (req, res) => {
  try {
    if (!req.user.gymId) {
      return res.status(403).json({ message: "You must create a gym first" });
    }

    const member = await Member.findOne({ _id: req.params.id, gymId: req.user.gymId });
    if (!member) return res.status(404).json({ message: "Member not found" });

    if (!member.email) {
      return res.status(400).json({ message: "Member does not have an email address" });
    }

    // Get last payment
    const lastPayment = await Payment.findOne({ memberId: member._id, gymId: req.user.gymId }).sort({ createdAt: -1 });

    if (!lastPayment) {
      return res.status(400).json({ message: "No payment history found for this member" });
    }

    // Get Gym Name
    const gym = await Gym.findById(req.user.gymId);
    const gymName = gym?.name || "Our Gym";

    await sendPaymentReminder(member.email, {
      memberName: member.fullLegalName || member.name,
      lastPaidAt: lastPayment.createdAt,
      endAt: member.subscriptionEnd,
      amount: lastPayment.amount,
      gymName,
    });

    res.json({ message: "Reminder sent successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const setMemberCredentials = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password } = req.body;
    const gymId = req.user.gymId;

    if (!gymId) return res.status(403).json({ message: "Gym not identified" });
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const member = await Member.findOne({ _id: id, gymId });
    if (!member) return res.status(404).json({ message: "Member not found" });

    // 1. Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user && user.role !== "MEMBER") {
      return res.status(400).json({ message: "This email is already associated with an Admin account" });
    }

    const hashed = await bcrypt.hash(password, 10);

    if (user) {
      // Update existing user
      user.password = hashed;
      user.name = member.fullLegalName || member.name;
      user.gymId = gymId;
      await user.save();
    } else {
      // Create new member user
      user = await User.create({
        name: member.fullLegalName || member.name,
        email: email.toLowerCase(),
        password: hashed,
        role: "MEMBER",
        gymId: gymId
      });
    }

    // Link member record if not already linked
    member.userId = user._id;
    member.email = email.toLowerCase(); // Ensure member record has the same email
    await member.save();

    res.json({ message: "Member portal credentials set successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFullMemberProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const gymId = req.user.gymId;

    if (!gymId) return res.status(403).json({ message: "Gym not identified" });
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Member ID" });
    }

    const days = 14;
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const [member, game, attendanceRows, activity, payments] = await Promise.all([
      Member.findOne({ _id: id, gymId }).lean(),
      Gamification.findOne({ memberId: id, gymId }).lean(),
      Attendance.aggregate([
        { 
          $match: { 
            memberId: new mongoose.Types.ObjectId(id), 
            status: "SUCCESS", 
            checkInTime: { $exists: true, $ne: null, $gte: start } 
          } 
        },
        { 
          $group: { 
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$checkInTime", timezone: "+05:30" } }, 
            count: { $sum: 1 } 
          } 
        }
      ]).exec(),
      Attendance.find({ memberId: id, gymId }).sort({ checkInTime: -1 }).limit(20).lean(),
      Payment.find({ memberId: id, gymId }).sort({ createdAt: -1 }).limit(20).lean()
    ]);

    if (!member) return res.status(404).json({ message: "Member not found" });

    // Calculate Churn Probability
    const lastCheckin = activity?.[0]?.checkInTime;
    let probability = "LOW";
    if (!lastCheckin) {
      probability = "HIGH";
    } else {
      const diffDays = Math.floor((new Date() - new Date(lastCheckin)) / (1000 * 60 * 60 * 24));
      probability = diffDays > 10 ? "HIGH" : diffDays >= 5 ? "MEDIUM" : "LOW";
    }

    res.json({
      member,
      game: game || { points: 0, streak: 0 },
      churn: { probability },
      trend: { series: (attendanceRows || []).map(r => ({ date: r._id, count: r.count })) },
      activity: { 
        items: [
          ...(activity || []).map(a => ({ type: "CHECKIN", at: a.checkInTime, status: a.status })),
          ...(payments || []).map(p => ({ type: "PAYMENT", at: p.createdAt, amount: p.amount }))
        ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 20)
      },
      payments: payments || []
    });
  } catch (err) {
    console.error("FULL_PROFILE_ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
