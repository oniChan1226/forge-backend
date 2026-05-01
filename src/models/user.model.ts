import { Schema, model, InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, lowercase: true, maxLength: 100 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female", "other"] },
    avatar: { type: String },
    role: { type: String, default: "user" },
    about: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = model("User", userSchema);
