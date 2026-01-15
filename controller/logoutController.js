// logoutController.js
import { createAdmin } from "../model/signUpSchema.js";

export const logoutController = async (req, res) => {
  try {
    // 1️⃣ User ke refresh token ko DB se remove karo
    const token = req.cookies.refreshToken;
    if (!token) return res.status(400).json({ message: "No refresh token found" });

    // DB me user ka token remove
    await createAdmin.findOneAndUpdate(
      { refreshToken: token },
      { $unset: { refreshToken: "" } }
    );

    // 2️⃣ Cookies clear karo
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

