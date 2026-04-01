import mongoose, { Schema, Document } from "mongoose";
export interface Insight extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  summary: string[];
  categoryBreakdown: Record<string, number>;
  budget: number;
  createdAt: Date;
}
const insightSchema: Schema<Insight> = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["weekly", "monthly"],
      required: true,
    },
    summary: {
      type: [String],
    },
    categoryBreakdown: {
      type: Map,
      of: Number,
    },
    budget: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);
insightSchema.index(
  { userId: 1, createdAt: 1 },
  { expireAfterSeconds: 86400 }, // 24 hours
);

const InsightModel =
  (mongoose.models.Insight as mongoose.Model<Insight>) ||
  mongoose.model<Insight>("Insight", insightSchema);

export default InsightModel;
