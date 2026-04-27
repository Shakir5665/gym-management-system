import express from "express";
import { createGym, getMyGym } from "../controllers/gymController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/create", auth, createGym);
router.get("/me", auth, getMyGym);

export default router;