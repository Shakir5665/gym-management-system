import mongoose from "mongoose";

const gymSchema = new mongoose.Schema({
  name: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  logo: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Gym", gymSchema);