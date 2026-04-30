import Attendance from "../models/Attendance.js";
import Member from "../models/Member.js";
import Payment from "../models/Payment.js";
import mongoose from "mongoose";

function startOfNoonDay(d) {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
}

function addDays(d, days) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export async function getMemberAttendanceTrend(req, res) {
  try {
    const gymId = req.user?.gymId;
    if (!gymId) return res.status(403).json({ message: "You must create a gym first" });

    const memberId = req.params.memberId;
    const member = await Member.findOne({ _id: memberId, gymId }).select("_id");
    if (!member) return res.status(404).json({ message: "Member not found" });

    const days = Math.max(1, Math.min(Number(req.query.days || 14), 60));
    const now = new Date();
    
    // Query start: start of day (local)
    const startForQuery = new Date(now);
    startForQuery.setDate(startForQuery.getDate() - (days - 1));
    startForQuery.setHours(0, 0, 0, 0);

    // Loop start: noon alignment for ISO safety
    const startForLoop = startOfNoonDay(startForQuery);

    const gymObjectId = mongoose.Types.ObjectId.isValid(gymId) ? new mongoose.Types.ObjectId(gymId) : null;

    const rows = await Attendance.aggregate([
      {
        $match: {
          gymId: gymObjectId || gymId,
          memberId: member._id,
          status: "SUCCESS",
          checkInTime: { $gte: startForQuery },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: "$checkInTime",
              timezone: "+05:30"
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const map = new Map(rows.map((r) => [r._id, r.count]));
    const series = [];
    for (let i = 0; i < days; i++) {
      const d = addDays(startForLoop, i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      series.push({ date: key, count: map.get(key) || 0 });
    }

    res.json({ memberId, days, series });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getMemberRecentAttendance(req, res) {
  try {
    const gymId = req.user?.gymId;
    if (!gymId) return res.status(403).json({ message: "You must create a gym first" });

    const memberId = req.params.memberId;
    const member = await Member.findOne({ _id: memberId, gymId }).select("_id");
    if (!member) return res.status(404).json({ message: "Member not found" });

    const limit = Math.max(1, Math.min(Number(req.query.limit || 20), 100));
    const rows = await Attendance.find({ gymId, memberId: member._id })
      .sort({ checkInTime: -1 })
      .limit(limit)
      .lean();

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getMemberActivity(req, res) {
  try {
    const gymId = req.user?.gymId;
    if (!gymId) return res.status(403).json({ message: "You must create a gym first" });

    const memberId = req.params.memberId || req.params.id;
    if (!memberId) {
      return res.status(400).json({ message: "Member id is required" });
    }
    const member = await Member.findOne({ _id: memberId, gymId }).select("_id");
    if (!member) return res.status(404).json({ message: "Member not found" });

    const limit = Math.max(1, Math.min(Number(req.query.limit || 20), 100));

    const [att, pays] = await Promise.all([
      Attendance.find({ gymId, memberId: member._id })
        .sort({ checkInTime: -1 })
        .limit(limit)
        .lean(),
      Payment.find({ gymId, memberId: member._id })
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit)
        .lean(),
    ]);

    const merged = [
      ...att.map((a) => ({
        type: "CHECKIN",
        at: a.checkInTime,
        status: a.status,
        reason: a.reason,
      })),
      ...pays.map((p) => ({
        type: "PAYMENT",
        at: p.createdAt || p._id.getTimestamp(),
        amount: p.amount,
        nextDueDate: p.nextDueDate,
      })),
    ]
      .filter((x) => x.at)
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, limit);

    res.json({ memberId, items: merged });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

