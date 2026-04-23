import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member"
  },
  date: {
    type: Date,
    default: Date.now
  },
  checkInTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["SUCCESS", "BLOCKED"],
    default: "SUCCESS"
  },
  reason: String
});

export default mongoose.model("Attendance", attendanceSchema);