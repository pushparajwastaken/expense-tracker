import mongoose, { Schema, Document, mongo } from "mongoose";

export interface User extends Document {
  username: string;
  email: string;
  telegramId?: string;
  isOnBoarded: boolean;
  budget?: number;
}

const userSchema: Schema<User> = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    telegramId: {
      type: String,
    },
    isOnBoarded: {
      default: false,
      type: Boolean,
    },
    budget: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", userSchema);

export default UserModel;
