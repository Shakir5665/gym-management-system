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
      reason = `Banned: ${member.banReason || "No reason provided"}`;
    } else if (member.hasFine) {
      status = "BLOCKED";
      reason = `Fined: ${member.fineAmount || ""} LKR - ${member.fineReason || "No reason provided"}`;
    } else if (!member.subscriptionEnd || member.subscriptionEnd < now) {
      status = "BLOCKED";
      reason = "Expired payment";
    }

    if (status === "BLOCKED") {
      return res.status(403).json({ 
        status: "BLOCKED", 
        reason: reason 
      });
    }

    // Handle checkin/checkout flow
    let record = null;
    let action = "CHECKIN";

    if (status === "SUCCESS") {
      record = await Attendance.findOne({
        memberId,
        gymId,
        status: "SUCCESS",
        checkInTime: { $gte: todayStart }
      }).sort({ checkInTime: -1 });

      if (record) {
        if (!record.checkOutTime) {
          // 2nd scan or 4th scan: marks them as Checked-out
          record.checkOutTime = now;
          await record.save();
          
          const io = req.app.get("io");
          io.emit("attendance:new", { memberId, gymId, status: "CHECKOUT" });
          
          return res.json({ 
            status: "SUCCESS", 
            reason: "Checked out successfully", 
            record 
          });
        } else {
          // 3rd scan: Record exists and checked out -> check in again without points
          record.checkOutTime = null;
          await record.save();
          reason = "Checked in again";
          action = "CHECKIN_AGAIN";
        }
      } else {
        // 1st scan: No record exists yet -> Creates a Check-in
        record = await Attendance.create({
          memberId,
          gymId,
          status,
          reason: "Checked in",
          checkInTime: now
        });
        action = "FIRST_CHECKIN";
      }

      // 🎮 GAMIFICATION
      if (action === "FIRST_CHECKIN") {
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
            
            const dayBeforeYesterday = new Date(now);
            dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
            
            const lastDateStr = new Date(game.lastCheckIn).toDateString();

            if (lastDateStr === yesterday.toDateString() || lastDateStr === dayBeforeYesterday.toDateString()) {
              // 1-day grace period: if they missed yesterday but came day before, streak continues
              game.streak++;
            } else {
              // Missed 2+ days: reset
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
      if (action === "FIRST_CHECKIN") {
        io.emit("gamification:update", { memberId, gymId });
      }

      res.json({ status, reason: reason || "Checked in", record });
    }
  } catch (err) {
    console.error("CheckIn error:", err);
    res.status(500).json({ message: err.message });
  }
};