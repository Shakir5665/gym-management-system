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

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

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

    // Check if already checked in today
    let record = null;
    if (status === "SUCCESS") {
      const alreadyCheckedIn = await Attendance.findOne({
        memberId,
        gymId,
        status: "SUCCESS",
        checkInTime: { $gte: todayStart }
      });

      if (alreadyCheckedIn) {
        // Return success so they can enter, but do NOT add points or duplicate attendance logs
        return res.json({ 
          status: "SUCCESS", 
          reason: "Already checked in today", 
          record: alreadyCheckedIn 
        });
      }
    }

    // ✅ Save attendance if not already checked in
    record = await Attendance.create({
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
        const lastDate = new Date(game.lastCheckIn).toDateString();
        const todayDate = now.toDateString();

        if (lastDate !== todayDate) {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastDate === yesterday.toDateString()) {
            game.streak++;
          } else {
            game.streak = 1;
          }

          game.points += 10;
          game.lastCheckIn = now;
          await game.save();
        }
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