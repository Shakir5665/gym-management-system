import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  name: String,
  qrCode:
  {
    type: String,
    default: null 
  },
  phone: String,
  plan: String,
  subscriptionEnd: Date,
  isBanned: { type: Boolean, default: false },
  hasFine: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Member", memberSchema);