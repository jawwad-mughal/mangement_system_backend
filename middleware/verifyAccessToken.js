import jwt from "jsonwebtoken";
import { createAdmin } from "../model/signUpSchema.js"; 
import { addEmployees } from "../model/addEmployeeSchema.js";
import { generateAccessToken } from "../services/authService.js";

export const verifyAccessToken = async (req, res, next) => {
  
  try {
    const accessToken = req.cookies.accessToken || req.headers["authorization"]?.split(" ")[1];

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        req.user = decoded;
        return next();
      } catch (err) {
        if (err.name !== "TokenExpiredError") {
          return res.status(403).json({ message: "Invalid token", valid: false });
        }
        // expired → continue to refresh token
      }
    }

    // 2️⃣ Check refresh token
    const refreshToken = req.cookies.refreshToken || req.headers["authorization"]?.split(" ")[1];
    if (!refreshToken) return res.status(401).json({ message: "Refresh token missing", valid: false });

    // Try finding user in both collections
    let user = await createAdmin.findOne({ refreshToken });
    if (!user) user = await addEmployees.findOne({ refreshToken });

    if (!user) return res.status(401).json({ message: "Invalid refresh token", valid: false });

    try {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ message: "Refresh token expired", valid: false });
    }

    // 3️⃣ Generate new access token
    const newAccessToken = await generateAccessToken({ id: user._id, role: user.email});

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 2 * 60 * 1000, // 15 minutes
    });

    req.user = { id: user._id, role: user.email};
    next();

  } catch (error) {
    console.error("verifyAccessToken Error:", error);
    return res.status(500).json({ message: "Server error", valid: false });
  }
};




