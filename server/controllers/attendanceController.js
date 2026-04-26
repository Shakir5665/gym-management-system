import Attendance from "../models/Attendance.js";
import Member from "../models/Member.js";
import Gamification from "../models/Gamification.js";

export const checkIn = async (req, res) => {

  try{
    const { memberId } = req.body;

    const member = await Member.findById(memberId);

    let status = "SUCCESS";
    let reason = "";
    const now = new Date();

    if (member.isBanned) {
      status = "BLOCKED";
      reason = "User is banned";
    } else if (member.hasFine) {
      status = "BLOCKED";
      reason = "Pending fine";
    } else if (!member.subscriptionEnd || member.subscriptionEnd < now) {
      status = "BLOCKED";
      reason = "Subscription expired";
    }

    const record = await Attendance.create({
      memberId,
      status,
      reason
    });

    // 🎮 GAMIFICATION
    if (status === "SUCCESS") {
      let game = await Gamification.findOne({ memberId });

      if (!game) {
        game = await Gamification.create({
          memberId,
          points: 10,
          streak: 1,
          lastCheckIn: new Date()
        });
      } else {
        const today = new Date();
        const diff = Math.floor(
          (today - new Date(game.lastCheckIn)) / (1000 * 60 * 60 * 24)
        );

        if (diff === 1) game.streak++;
        else if (diff > 1) game.streak = 1;

        game.points += 10;
        game.lastCheckIn = today;

        await game.save();
      }
    }

    res.json({ status, reason, record });
}

catch (err) {
    console.error("CheckIn error:", err);
    res.status(500).json({ message: err.message });
  }

};