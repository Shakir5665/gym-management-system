// models/Payment.js
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, required: true },
  gymId: { type: mongoose.Schema.Types.ObjectId, required: true },
  amount: Number,
  nextDueDate: Date
}, { timestamps: true });

export default mongoose.model("Payment", schema);