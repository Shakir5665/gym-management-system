// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: "Gym" },
  role: { type: String, enum: ["ADMIN", "SUPER_ADMIN", "MEMBER"], default: "ADMIN" },
  profilePicture: String,
  resetPasswordOtp: String,
  resetPasswordExpires: Date
});

export default mongoose.model("User", userSchema);