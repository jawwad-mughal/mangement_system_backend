import 'dotenv/config'
import mongoose from 'mongoose'

const connectdb = async () => {
  const uri = process.env.MONGO_URL

  try {
    await mongoose.connect(uri);
    console.log("MongoDB Connected Successfully");

  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1); 
  }
}

export default connectdb;


