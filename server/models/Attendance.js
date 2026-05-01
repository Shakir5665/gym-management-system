// models/Attendance.js
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: "Gym", required: true },
  status: String,
  reason: String,
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date, default: null }
});

schema.index({ memberId: 1, gymId: 1, checkInTime: -1 });
schema.index({ gymId: 1, checkInTime: -1 });

export default mongoose.model("Attendance", schema);