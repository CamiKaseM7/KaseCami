import { connect } from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/mydatabase"; // Replace with your own database URI

export const connectToDatabase = async () => {
    console.log("Connecting to MongoDB...");
    try {
        await connect(MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};
