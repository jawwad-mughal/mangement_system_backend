import express from "express";
import { signupAdminController } from "../controller/signupAdminController.js";
import { loginController } from "../controller/loginController.js";
import { resetPasswordController } from "../controller/resetPasswordController.js";

const router = express.Router();


// ✅ Routes with CORS
router.post("/signup", signupAdminController);
router.post("/login", loginController);
router.post("/reset-password", resetPasswordController);

export default router;

