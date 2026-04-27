import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  name: String,
  fullLegalName: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"] },
  email: String,
  phone: String,
  emergencyPhone: String,
  homeAddress: String,
  plan: String,
  isBanned: { type: Boolean, default: false },
  hasFine: { type: Boolean, default: false },
  subscriptionEnd: Date,
  qrCode: String,
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: "Gym" },
  createdAt: { type: Date, default: Date.now }

});

export default mongoose.model("Member", memberSchema);