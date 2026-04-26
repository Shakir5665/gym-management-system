import mongoose from "mongoose";

const schema = new mongoose.Schema({
  memberId: mongoose.Schema.Types.ObjectId,
  gymId: mongoose.Schema.Types.ObjectId,
  amount: Number,
  type: String,
  date: { type: Date, default: Date.now },
  nextDueDate: Date
});

export default mongoose.model("Payment", schema);