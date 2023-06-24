import { model } from "mongoose";
import { User } from "../interfaces/UserInterface";
import { UserSchema } from "../schemas/UserSchema";

export const UserModel = model<User>("User", UserSchema);
