import mongoose from "mongoose";

interface IUser {
  _id: string | mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  age?: number;
  gender?: string;
  avatar?: string;
  role: string;
  isVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
    avatar: { type: String },
    role: { type: String, default: "user" },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
