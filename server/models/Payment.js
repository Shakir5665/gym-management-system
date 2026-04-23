import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member"
  },
  amount: Number,
  type: {
    type: String,
    enum: ["ADMISSION", "MONTHLY"]
  },
  date: {
    type: Date,
    default: Date.now
  },
  nextDueDate: Date
});

export default mongoose.model("Payment", paymentSchema);