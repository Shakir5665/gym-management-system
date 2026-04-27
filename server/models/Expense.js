import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    reason: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    spentAt: { type: Date, default: Date.now, index: true },
    note: { type: String, trim: true },
  },
  { timestamps: true },
);

expenseSchema.index({ gymId: 1, spentAt: -1 });

export default mongoose.model("Expense", expenseSchema);
