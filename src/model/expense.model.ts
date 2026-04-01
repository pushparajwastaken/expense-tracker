import mongoose, { Schema, Document } from "mongoose";

export interface Expense extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  category: string;
  note?: string;
  date: Date;
  currency: string;
}
const expenseSchema: Schema<Expense> = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
    currency: {
      enum: ["INR", "USD", "EUR"],
      type: String,
      default: "INR",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);
expenseSchema.index({ userId: 1, date: -1 });
const ExpenseModel =
  (mongoose.models.Expense as mongoose.Model<Expense>) ||
  mongoose.model<Expense>("Expense", expenseSchema);

export default ExpenseModel;
