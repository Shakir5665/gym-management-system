import express from "express";
import { createGym, getMyGym, updateLogo, updateGymProfile } from "../controllers/gymController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/create", auth, createGym);
router.get("/me", auth, getMyGym);
router.put("/logo", auth, updateLogo);
router.put("/profile", auth, updateGymProfile);

export default router;