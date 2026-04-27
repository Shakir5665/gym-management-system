import mongoose from "mongoose";

const gymSchema = new mongoose.Schema({
  name: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

export default mongoose.model("Gym", gymSchema);