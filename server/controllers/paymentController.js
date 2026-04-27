// controllers/paymentController.js
import Payment from "../models/Payment.js";
import Member from "../models/Member.js";
import mongoose from "mongoose";

export const createPayment = async (req, res) => {
  try {
    const { memberId, amount } = req.body;
    const gymId = req.user.gymId;

    const member = await Member.findOne({ _id: memberId, gymId });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const now = new Date();

    // 📅 Extend subscription
    const newDate =
      member.subscriptionEnd && member.subscriptionEnd > now
        ? new Date(member.subscriptionEnd)
        : now;

    newDate.setMonth(newDate.getMonth() + 1);

    member.subscriptionEnd = newDate;
    await member.save();

    // 💳 Save payment
    await Payment.create({
      memberId,
      gymId,
      amount,
      nextDueDate: newDate
    });

    // 🔔 SOCKET
    const io = req.app.get("io");

    io.emit("payment:update", {
      memberId,
      gymId,
      nextDueDate: newDate
    });

    res.json({ message: "Payment successful", nextDueDate: newDate });

  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getMemberPayments = async (req, res) => {
  try {
    const gymId = req.user.gymId;
    const { memberId } = req.params;

    const member = await Member.findOne({ _id: memberId, gymId }).select("_id");
    if (!member) return res.status(404).json({ message: "Member not found" });

    const rows = await Payment.find({ gymId, memberId }).sort({ createdAt: -1 }).limit(100);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPaymentReport = async (req, res) => {
  try {
    const gymIdRaw = req.user.gymId;
    if (!gymIdRaw || !mongoose.Types.ObjectId.isValid(gymIdRaw)) {
      return res.status(400).json({ message: "Invalid gym id" });
    }
    const gymId = new mongoose.Types.ObjectId(gymIdRaw);
    const limit = Math.max(1, Math.min(Number(req.query.limit || 100), 300));

    const rows = await Payment.aggregate([
      { $match: { gymId } },
      { $sort: { createdAt: -1, _id: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "members",
          localField: "memberId",
          foreignField: "_id",
          as: "member",
        },
      },
      {
        $project: {
          _id: 1,
          memberId: 1,
          amount: 1,
          nextDueDate: 1,
          createdAt: 1,
          memberName: { $ifNull: [{ $arrayElemAt: ["$member.name", 0] }, "Unknown member"] },
          memberPhone: { $ifNull: [{ $arrayElemAt: ["$member.phone", 0] }, ""] },
        },
      },
    ]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};