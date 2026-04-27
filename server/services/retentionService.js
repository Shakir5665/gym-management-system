import Attendance from "../models/Attendance.js";

export const getUserRisk = async (memberId, gymId) => {
  const query = gymId ? { memberId, gymId } : { memberId };
  const last = await Attendance.findOne(query).sort({ checkInTime: -1 });

  if (!last) return "HIGH";

  const diff = Math.floor(
    (new Date() - new Date(last.checkInTime)) / (1000 * 60 * 60 * 24)
  );

  if (diff > 10) return "HIGH";
  if (diff >= 5) return "MEDIUM";
  return "LOW";
};