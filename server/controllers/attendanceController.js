import Attendance from "../models/Attendance.js";
import Member from "../models/Member.js";
import Gamification from "../models/Gamification.js";

export const checkIn = async (req, res) => {
  try {
    const { memberId } = req.body;

    const member = await Member.findById(memberId);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    let status = "SUCCESS";
    let reason = "";
    const now = new Date();

    // RULE ENGINE
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

    // SAVE ATTENDANCE
    const record = await Attendance.create({
      memberId,
      status,
      reason
    });

    const io = req.app.get("io"); // 🔥 get socket instance

    // GAMIFICATION
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
        const last = new Date(game.lastCheckIn);

        const diff = Math.floor(
          (today - last) / (1000 * 60 * 60 * 24)
        );

        if (diff === 1) game.streak++;
        else if (diff > 1) game.streak = 1;

        game.points += 10;
        game.lastCheckIn = today;

        await game.save();
      }

      // EMIT GAMIFICATION EVENT
      io.emit("gamification:update", { memberId });
    }

    // EMIT ATTENDANCE EVENT
    io.emit("attendance:new", {
      memberId,
      status,
      time: new Date()
    });

    // RESPONSE LAST
    res.json({ status, reason, record });

  } catch (err) {
    console.error("CheckIn error:", err);
    res.status(500).json({ message: err.message });
  }
};