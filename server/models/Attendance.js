import mongoose from "mongoose";

const schema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
  gymId: mongoose.Schema.Types.ObjectId,
  date: { type: Date, default: Date.now },
  checkInTime: { type: Date, default: Date.now },
  status: String,
  reason: String
});

schema.index({ memberId: 1, date: -1 });

export default mongoose.model("Attendance", schema);