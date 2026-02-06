import { createAdmin } from "../model/signUpSchema.js";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/authService.js";
import { addEmployees } from "../model/addEmployeeSchema.js";

export const loginController = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    //   check input require field
    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // condition base using database

    const user =
      role === "admin"
        ? await createAdmin.findOne({ email })
        : await addEmployees.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match =
      role === "admin"
        ? await bcrypt.compare(password, user.password)
        : password === user.password;

    if (!match) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate accessToken Token
    const accessToken = await generateAccessToken({
      id: user._id,
      role: user.email,
    });
    // Generate refreshToken Token
    const refreshToken = await generateRefreshToken({
      id: user._id,
      role: user.email,
      name: user.name,
    });

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true, // 🔥 MUST (HTTPS)
      sameSite: "none", // 🔥 MUST (cross-domain)
      maxAge: 2 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // 🔥 MUST
      sameSite: "none", // 🔥 MUST
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user,
      role,
      url: "/",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log(error);
  }
};
