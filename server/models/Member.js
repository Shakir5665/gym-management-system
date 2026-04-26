import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  name: String,
  phone: String,
  plan: String,
  isBanned: { type: Boolean, default: false },
  hasFine: { type: Boolean, default: false },
  subscriptionEnd: Date,
  qrCode: String,
  gymId: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Member", memberSchema);