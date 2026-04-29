import { Schema, model, InferSchemaType } from "mongoose";

export const userTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export type UserToken = InferSchemaType<typeof userTokenSchema>;

export const UserTokenModel = model("UserToken", userTokenSchema);
