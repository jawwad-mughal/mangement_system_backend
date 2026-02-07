import mongoose from "mongoose";

const connectdb = async () => {
  const uri = process.env.MONGO_URI; // ✅ FIXED NAME

  if (!uri) {
    throw new Error("MONGO_URI is missing in environment variables");
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    throw error; // ✅ Vercel-safe
  }
};

export default connectdb;



