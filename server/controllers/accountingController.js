import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import Payment from "../models/Payment.js";
import Member from "../models/Member.js";
import Gym from "../models/Gym.js";

function parseDateRange(req) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const from = req.query.from ? new Date(String(req.query.from)) : monthStart;
  const to = req.query.to ? new Date(String(req.query.to)) : monthEnd;
  return {
    from: Number.isNaN(from.getTime()) ? monthStart : from,
    to: Number.isNaN(to.getTime()) ? monthEnd : to,
  };
}

function money(n) {
  return Number(Number(n || 0).toFixed(2));
}

export async function createExpense(req, res) {
  try {
    const gymId = req.user?.gymId;
    if (!gymId) return res.status(403).json({ message: "You must create a gym first" });

    const reason = String(req.body.reason || "").trim();
    const amount = Number(req.body.amount);
    const spentAtRaw = String(req.body.spentAt || "").trim();
    const note = String(req.body.note || "").trim();

    if (!reason) return res.status(400).json({ message: "Expense reason is required" });
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Valid expense amount is required" });
    }

    const spentAt = spentAtRaw ? new Date(spentAtRaw) : new Date();
    if (Number.isNaN(spentAt.getTime())) {
      return res.status(400).json({ message: "Invalid expense date" });
    }

    const row = await Expense.create({
      gymId,
      reason,
      amount,
      spentAt,
      note,
    });

    res.json(row);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getExpenses(req, res) {
  try {
    const gymId = req.user?.gymId;
    if (!gymId) return res.status(403).json({ message: "You must create a gym first" });
    const { from, to } = parseDateRange(req);
    const limit = Math.max(1, Math.min(Number(req.query.limit || 300), 1000));

    const rows = await Expense.find({
      gymId,
      spentAt: { $gte: from, $lte: to },
    })
      .sort({ spentAt: -1, _id: -1 })
      .limit(limit)
      .lean();

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateExpense(req, res) {
  try {
    const gymId = req.user?.gymId;
    if (!gymId) return res.status(403).json({ message: "You must create a gym first" });

    const { id } = req.params;
    const reason = String(req.body.reason || "").trim();
    const amount = Number(req.body.amount);
    const spentAtRaw = String(req.body.spentAt || "").trim();
    const note = String(req.body.note || "").trim();

    if (!reason) return res.status(400).json({ message: "Expense reason is required" });
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Valid expense amount is required" });
    }

    const spentAt = spentAtRaw ? new Date(spentAtRaw) : new Date();
    if (Number.isNaN(spentAt.getTime())) {
      return res.status(400).json({ message: "Invalid expense date" });
    }

    const row = await Expense.findOneAndUpdate(
      { _id: id, gymId },
      { reason, amount, spentAt, note },
      { new: true }
    );

    if (!row) return res.status(404).json({ message: "Expense not found" });

    res.json(row);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteExpense(req, res) {
  try {
    const gymId = req.user?.gymId;
    if (!gymId) return res.status(403).json({ message: "You must create a gym first" });

    const { id } = req.params;
    const row = await Expense.findOneAndDelete({ _id: id, gymId });

    if (!row) return res.status(404).json({ message: "Expense not found" });

    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getAccountingReport(req, res) {
  try {
    const gymIdRaw = req.user?.gymId;
    if (!gymIdRaw) return res.status(403).json({ message: "You must create a gym first" });
    const gymId = mongoose.Types.ObjectId.isValid(gymIdRaw)
      ? new mongoose.Types.ObjectId(gymIdRaw)
      : gymIdRaw;

    const { from, to } = parseDateRange(req);

    const [gym, newMembers, revenueAgg, expensesAgg, expenseBreakdownAgg, avgPaymentAgg] =
      await Promise.all([
        Gym.findById(gymIdRaw).select("name").lean(),
        Member.countDocuments({ gymId: gymIdRaw, createdAt: { $gte: from, $lte: to } }),
        Payment.aggregate([
          { $match: { gymId, createdAt: { $gte: from, $lte: to } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Expense.aggregate([
          { $match: { gymId, spentAt: { $gte: from, $lte: to } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Expense.aggregate([
          { $match: { gymId, spentAt: { $gte: from, $lte: to } } },
          { $group: { _id: "$reason", amount: { $sum: "$amount" } } },
          { $sort: { amount: -1, _id: 1 } },
        ]),
        Payment.aggregate([
          { $match: { gymId } },
          { $group: { _id: null, avgAmount: { $avg: "$amount" } } },
        ]),
      ]);

    const totalRevenue = money(revenueAgg?.[0]?.total || 0);
    const totalExpenses = money(expensesAgg?.[0]?.total || 0);
    const netProfit = money(totalRevenue - totalExpenses);

    const avgMonthlyFee = Number(avgPaymentAgg?.[0]?.avgAmount || 0);
    
    // Calculate Monthly fees (month end) based on total active (non-banned) members
    const activeMembersCount = await Member.countDocuments({
      gymId: gymIdRaw,
      isBanned: { $ne: true },
    });
    const monthlyFeesMonthEnd = money(activeMembersCount * avgMonthlyFee);

    const expenseBreakdown = expenseBreakdownAgg.map((r) => ({
      category: r._id || "Miscellaneous",
      amount: money(r.amount),
      pct: totalExpenses ? money((r.amount / totalExpenses) * 100) : 0,
    }));

    res.json({
      gymName: gym?.name || "Gym",
      period: {
        from,
        to,
      },
      metrics: {
        newMembers,
        monthlyFeesMonthEnd,
        totalExpenses,
        totalCollectedRevenue: totalRevenue,
        netProfit,
      },
      expenseBreakdown,
      generatedAt: new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" }),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
