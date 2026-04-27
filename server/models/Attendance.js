// models/Attendance.js
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: String,
  reason: String,
  checkInTime: { type: Date, default: Date.now }
});

schema.index({ memberId: 1, gymId: 1, checkInTime: -1 });

export default mongoose.model("Attendance", schema);