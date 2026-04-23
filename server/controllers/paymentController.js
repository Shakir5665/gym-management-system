import Payment from "../models/Payment.js";
import Member from "../models/Member.js";

export const makePayment = async (req, res) => {
  try {
    const { memberId, amount, type } = req.body;

    const member = await Member.findById(memberId);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    let nextDueDate = new Date();

    if (type === "MONTHLY") {
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      member.subscriptionEnd = nextDueDate;
    }

    const payment = await Payment.create({
      memberId,
      amount,
      type,
      nextDueDate
    });

    await member.save();

    res.json({ payment, member });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};