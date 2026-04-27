// controllers/paymentController.js
import Payment from "../models/Payment.js";
import Member from "../models/Member.js";

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