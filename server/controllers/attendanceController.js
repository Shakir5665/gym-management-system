import Attendance from "../models/Attendance.js";
import Member from "../models/Member.js";

export const checkIn = async (req, res) => {
  try {
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({ message: "Member ID is required" });
    }

    const member = await Member.findById(memberId);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    let status = "SUCCESS";
    let reason = "";

    // 🚫 Rule Enforcement
    if (member.isBanned) {
      status = "BLOCKED";
      reason = "User is banned";
    }

    if (member.hasFine) {
      status = "BLOCKED";
      reason = "Pending fine";
    }

    // Save attendance
    const record = await Attendance.create({
      memberId,
      status,
      reason
    });

    console.log("Attendance record created:", record);

    res.json({
      status,
      reason,
      record
    });

  } catch (err) {
    console.error("CheckIn error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("memberId", "name phone")
      .sort({ checkInTime: -1 });
    res.json(records);
  } catch (err) {
    console.error("Get attendance error:", err);
    res.status(500).json({ message: err.message });
  }
};