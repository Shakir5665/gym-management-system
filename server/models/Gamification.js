// models/Gamification.js
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, required: true },
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastCheckIn: Date
});

schema.index({ memberId: 1, gymId: 1 }, { unique: true });

export default mongoose.model("Gamification", schema);