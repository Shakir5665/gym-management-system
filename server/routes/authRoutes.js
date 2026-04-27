import express from "express";
import { register, login, googleLogin, googleRegister } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/google-register", googleRegister);

export default router;