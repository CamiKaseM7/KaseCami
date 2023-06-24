import { Document } from "mongoose";

export interface User extends Document {
    userId: string;
    agsToken?: string;
    blacklisted: boolean;
    reason?: string;
}
