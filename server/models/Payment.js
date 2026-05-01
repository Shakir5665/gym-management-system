// models/Payment.js
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, required: true },
  amount: Number,
  nextDueDate: Date
}, { timestamps: true });

schema.index({ memberId: 1, gymId: 1 });
schema.index({ memberId: 1, createdAt: -1 });
schema.index({ gymId: 1, createdAt: -1 });
export default mongoose.model("Payment", schema);