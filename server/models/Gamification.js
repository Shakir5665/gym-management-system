import mongoose from "mongoose";

const schema = new mongoose.Schema({

  memberId: {
  type: mongoose.Schema.Types.ObjectId,
  unique: true,
  required: true
  },

  gymId: mongoose.Schema.Types.ObjectId,
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastCheckIn: Date

});


export default mongoose.model("Gamification", schema);