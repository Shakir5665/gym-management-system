import express from "express";
import { register, login, googleLogin, googleRegister, updateProfile, forgotPassword, verifyOtp, resetPassword } from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/google-register", googleRegister);
router.put("/profile", auth, updateProfile);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;