import { Document } from "mongoose";

export interface BlockedUser extends Document {
    userId: string;
    reason: string;
    createdAt: Date;
    updatedAt: Date;
}
