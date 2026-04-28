import Attendance from "../models/Attendance.js";
import Member from "../models/Member.js";
import Payment from "../models/Payment.js";
import Gamification from "../models/Gamification.js";
import { getUserRisk } from "../services/retentionService.js";
import mongoose from "mongoose";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d, days) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function startOfMonth(d) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function percentChange(today, yesterday) {
  if (!yesterday) return today ? 100 : 0;
  return Math.round(((today - yesterday) / yesterday) * 100);
}

async function getLastCheckinByMember(gymId) {
  const rows = await Attendance.aggregate([
    { $match: { gymId } },
    { $sort: { checkInTime: -1 } },
    { $group: { _id: "$memberId", lastCheckIn: { $first: "$checkInTime" } } },
  ]);
  return rows;
}

function resolveGymIds(gymIdRaw) {
  const gymId = gymIdRaw ? String(gymIdRaw) : "";
  const gymObjectId =
    gymId && mongoose.Types.ObjectId.isValid(gymId) ? new mongoose.Types.ObjectId(gymId) : null;
  return { gymId, gymObjectId };
}

export async function getDashboardSummary(req, res) {
  try {
    const { gymId, gymObjectId } = resolveGymIds(req.user?.gymId);
    if (!gymId) return res.status(403).json({ message: "You must create a gym first" });

    const now = new Date();
    const todayStart = startOfDay(now);
    const tomorrowStart = addDays(todayStart, 1);
    const yesterdayStart = addDays(todayStart, -1);
    const monthStart = startOfMonth(now);
    const soonDue = addDays(todayStart, 3);

    const [totalMembers, todayCheckins, yesterdayCheckins, monthRevenueAgg, newMembersCount] =
      await Promise.all([
        Member.countDocuments({ gymId }),
        Attendance.countDocuments({
          gymId,
          status: "SUCCESS",
          checkInTime: { $gte: todayStart, $lt: tomorrowStart },
        }),
        Attendance.countDocuments({
          gymId,
          status: "SUCCESS",
          checkInTime: { $gte: yesterdayStart, $lt: todayStart },
        }),
        Payment.aggregate([
          {
            $match: {
              gymId: gymObjectId || gymId,
              $or: [
                { createdAt: { $gte: monthStart } },
                { createdAt: { $exists: false } },
              ],
            },
          },
          {
            $addFields: {
              createdAtSafe: {
                $ifNull: ["$createdAt", { $toDate: "$_id" }],
              },
            },
          },
          { $match: { createdAtSafe: { $gte: monthStart } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Member.countDocuments({ gymId, createdAt: { $gte: addDays(todayStart, -7) } }),
      ]);

    const activeNow = await Attendance.countDocuments({
      gymId,
      status: "SUCCESS",
      checkInTime: { $gte: todayStart, $lt: tomorrowStart },
      checkOutTime: null
    });
    const activeNowChangePct = percentChange(todayCheckins, yesterdayCheckins);

    const monthRevenue = monthRevenueAgg?.[0]?.total || 0;

    // Alerts
    const [paymentsDueCount, lastCheckins] = await Promise.all([
      Member.countDocuments({
        gymId,
        subscriptionEnd: { $exists: true, $lte: soonDue },
      }),
      getLastCheckinByMember(gymObjectId || gymId),
    ]);

    const riskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    for (const r of lastCheckins) {
      const diffDays = Math.floor((now - new Date(r.lastCheckIn)) / (1000 * 60 * 60 * 24));
      const risk = diffDays > 10 ? "HIGH" : diffDays >= 5 ? "MEDIUM" : "LOW";
      riskCounts[risk] += 1;
    }
    const atRiskCount = riskCounts.HIGH + Math.max(0, totalMembers - lastCheckins.length);

    res.json({
      activeNow,
      activeNowChangePct,
      totalMembers,
      todayCheckins,
      revenueThisMonth: monthRevenue,
      alerts: {
        atRiskCount,
        paymentsDueCount,
        newMembersCount,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getCheckinTrend(req, res) {
  try {
    const { gymId, gymObjectId } = resolveGymIds(req.user?.gymId);
    if (!gymId) return res.status(403).json({ message: "You must create a gym first" });

    const days = Math.max(1, Math.min(Number(req.query.days || 7), 30));
    const now = new Date();
    const start = startOfDay(addDays(now, -(days - 1)));

    const rows = await Attendance.aggregate([
      {
        $match: {
          gymId: gymObjectId || gymId,
          status: "SUCCESS",
          checkInTime: { $gte: start },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$checkInTime" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const map = new Map(rows.map((r) => [r._id, r.count]));
    const series = [];
    for (let i = 0; i < days; i++) {
      const d = addDays(start, i);
      const key = d.toISOString().slice(0, 10);
      series.push({ date: key, count: map.get(key) || 0 });
    }

    res.json({ days, series });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getRiskDistribution(req, res) {
  try {
    const { gymId, gymObjectId } = resolveGymIds(req.user?.gymId);
    if (!gymId) return res.status(403).json({ message: "You must create a gym first" });

    const now = new Date();
    const last = await getLastCheckinByMember(gymObjectId || gymId);
    const totalMembersCount = await Member.countDocuments({ gymId: gymObjectId || gymId });

    const counts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    for (const r of last) {
      const diffDays = Math.floor((now - new Date(r.lastCheckIn)) / (1000 * 60 * 60 * 24));
      const risk = diffDays > 10 ? "HIGH" : diffDays >= 5 ? "MEDIUM" : "LOW";
      counts[risk] += 1;
    }
    counts.HIGH += Math.max(0, totalMembersCount - last.length);
    const total = Math.max(1, counts.LOW + counts.MEDIUM + counts.HIGH);

    res.json({
      counts,
      percentages: {
        LOW: Math.round((counts.LOW / total) * 100),
        MEDIUM: Math.round((counts.MEDIUM / total) * 100),
        HIGH: Math.round((counts.HIGH / total) * 100),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getDashboardLists(req, res) {
  try {
    const { gymId, gymObjectId } = resolveGymIds(req.user?.gymId);
    if (!gymId) return res.status(403).json({ message: "You must create a gym first" });

    const limit = Math.max(1, Math.min(Number(req.query.limit || 3), 100));
    const now = new Date();
    const todayStart = startOfDay(now);
    const soonDue = addDays(todayStart, 3);

    const [topGame, members, lastByMember, dueMembers, newMembers] = await Promise.all([
      Gamification.find({ gymId }).sort({ streak: -1, points: -1 }).limit(limit).lean(),
      Member.find({ gymId }).select("_id name phone subscriptionEnd createdAt").lean(),
      getLastCheckinByMember(gymObjectId || gymId),
      Member.find({ gymId, subscriptionEnd: { $exists: true, $lte: soonDue } })
        .sort({ subscriptionEnd: 1 })
        .limit(limit)
        .select("_id name phone subscriptionEnd")
        .lean(),
      Member.find({ gymId, createdAt: { $gte: addDays(todayStart, -7) } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("_id name phone createdAt")
        .lean(),
    ]);

    const memberById = new Map(members.map((m) => [String(m._id), m]));
    const lastMap = new Map(lastByMember.map((r) => [String(r._id), r.lastCheckIn]));

    const topMembers = topGame
      .map((g) => {
        const m = memberById.get(String(g.memberId));
        if (!m) return null;
        return { memberId: String(m._id), name: m.name, streak: g.streak || 0, points: g.points || 0 };
      })
      .filter(Boolean)
      .slice(0, limit);

    // At-risk: highest days-since-checkin (fallback to HIGH via retentionService if no attendance)
    const withRisk = await Promise.all(
      members.map(async (m) => {
        const last = lastMap.get(String(m._id));
        const diffDays = last ? Math.floor((now - new Date(last)) / (1000 * 60 * 60 * 24)) : null;
        const risk = diffDays == null ? await getUserRisk(m._id, gymId) : diffDays > 10 ? "HIGH" : diffDays >= 5 ? "MEDIUM" : "LOW";
        return { memberId: String(m._id), name: m.name, phone: m.phone, risk, diffDays: diffDays ?? 9999 };
      }),
    );

    const atRiskMembers = withRisk
      .filter((x) => x.risk === "HIGH")
      .sort((a, b) => b.diffDays - a.diffDays)
      .slice(0, limit);

    res.json({
      topMembers,
      atRiskMembers,
      paymentsDueMembers: dueMembers.map((m) => ({
        memberId: String(m._id),
        name: m.name,
        phone: m.phone,
        subscriptionEnd: m.subscriptionEnd,
      })),
      newMembers: newMembers.map((m) => ({
        memberId: String(m._id),
        name: m.name,
        phone: m.phone,
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

