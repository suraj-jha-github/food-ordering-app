import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URL) {
      console.error("MONGO_URL environment variable is not set");
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB Connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};
