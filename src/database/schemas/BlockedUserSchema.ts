import { Schema } from "mongoose";

export const BlockedUserSchema = new Schema(
    {
        userId: { type: String, required: true, unique: true },
        reason: { type: String, required: false },
    },
    { timestamps: true }
);
