import Payment from "../models/Payment.js";
import Member from "../models/Member.js";

export const makePayment = async (req, res) => {
  const { memberId, amount } = req.body;

  const next = new Date();
  next.setMonth(next.getMonth() + 1);

  await Payment.create({
    memberId,
    amount,
    type: "MONTHLY",
    nextDueDate: next
  });

  const member = await Member.findById(memberId);
  member.subscriptionEnd = next;
  await member.save();

  res.json({ message: "Payment success" });

  const io = req.app.get("io");

  io.emit("payment:update", {
    memberId
  });
};