import mongoose from "mongoose";

const gymSchema = new mongoose.Schema({
  name: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  logo: String,
  isActive: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Gym", gymSchema);