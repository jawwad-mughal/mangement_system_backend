import express from "express";
import { signupAdminController } from "../controller/signupAdminController.js";
import { loginController } from "../controller/loginController.js";
import { resetPasswordController } from "../controller/resetPasswordController.js";
import cors from "cors";

const router = express.Router();

const corsOptions = {
  origin: "https://mangement-system-frontend.vercel.app",
  credentials: true,
};

// ✅ Route-level CORS applied for serverless preflight
router.post("/signup", cors(corsOptions), signupAdminController);
router.post("/login", cors(corsOptions), loginController);
router.post("/reset-password", cors(corsOptions), resetPasswordController);

export default router;
