// controllers/attendanceController.js
import Attendance from "../models/Attendance.js";
import Member from "../models/Member.js";
import Gamification from "../models/Gamification.js";

export const checkIn = async (req, res) => {
  try {
    const { memberId } = req.body;
    const gymId = req.user.gymId;

    const member = await Member.findOne({ _id: memberId, gymId });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    let status = "SUCCESS";
    let reason = "";
    const now = new Date();

    // 🚫 Rules
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

    // ✅ Save attendance
    const record = await Attendance.create({
      memberId,
      gymId,
      status,
      reason
    });

    // 🎮 GAMIFICATION
    if (status === "SUCCESS") {
      let game = await Gamification.findOne({ memberId, gymId });

      if (!game) {
        game = await Gamification.create({
          memberId,
          gymId,
          points: 10,
          streak: 1,
          lastCheckIn: now
        });
      } else {
        const diff = Math.floor(
          (now - new Date(game.lastCheckIn)) / (1000 * 60 * 60 * 24)
        );

        if (diff === 1) game.streak++;
        else if (diff > 1) game.streak = 1;

        game.points += 10;
        game.lastCheckIn = now;

        await game.save();
      }
    }

    // 🔔 SOCKET
    const io = req.app.get("io");

    io.emit("attendance:new", { memberId, gymId, status });

    if (status === "SUCCESS") {
      io.emit("gamification:update", { memberId, gymId });
    }

    res.json({ status, reason, record });

  } catch (err) {
    console.error("CheckIn error:", err);
    res.status(500).json({ message: err.message });
  }
};