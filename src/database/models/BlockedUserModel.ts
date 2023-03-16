import { model } from "mongoose";
import { BlockedUser } from "../interfaces/BlockedUserInterface";
import { BlockedUserSchema } from "../schemas/BlockedUserSchema";

export const BlockedUserModel = model<BlockedUser>("BlockedUser", BlockedUserSchema);
