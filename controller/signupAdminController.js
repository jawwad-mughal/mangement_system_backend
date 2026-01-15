import { createAdmin } from "../model/signUpSchema.js";
import bcrypt from "bcryptjs"

export const signupAdminController = async (req,res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Check required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Basic validation
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password not match" });
      
    }
    // Check if user already exists
    const existingUser = await createAdmin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // hashing Password
    const passwordHashing = await bcrypt.hash(password,10)

    // Create new admin
    const createNewAdmin = await createAdmin.create({ name, email, password: passwordHashing });

    // Send success response (only once)
      return res.status(201).json({
        message: "Admin created successfully",
        url: "/login"
      });
    

  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({ message: "Internal server error" });
  }
}
