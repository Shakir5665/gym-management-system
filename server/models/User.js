// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  googleId: String,
  provider: { type: String, default: "local" },
  gymId: { type: mongoose.Schema.Types.ObjectId, ref: "Gym" }
});

export default mongoose.model("User", userSchema);