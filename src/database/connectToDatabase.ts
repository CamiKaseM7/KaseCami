import { connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectToDatabase = async () => {
    console.log("Connecting to MongoDB...");
    try {
        await connect(process.env.MONGODB_URI!);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};
