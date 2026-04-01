import mongoose, { Schema, Document } from "mongoose";

export interface RecurringPayment extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  dueDate: Date;
  category: string;
  note?: string;
  currency: string;
  frequency: string;
}
const RecurringPaymentSchema: Schema<RecurringPayment> = new Schema(
  {
    userId: {
      types: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount should not be below 0"],
    },
    dueDate: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    currency: {
      enum: ["INR", "USD", "EUR"],
      type: String,
      default: "INR",
    },
    frequency: {
      enum: ["weekly", "monthly", "half-yearly", "yearly"],
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
  },
  { timestamps: true },
);

const RecurringPaymentModel =
  (mongoose.models.RecurringPayment as mongoose.Model<RecurringPayment>) ||
  mongoose.model<RecurringPayment>("RecurringPayment", RecurringPaymentSchema);

export default RecurringPaymentModel;
