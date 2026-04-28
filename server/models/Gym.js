import mongoose from "mongoose";

const gymSchema = new mongoose.Schema({
  name: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  logo: String
});

export default mongoose.model("Gym", gymSchema);