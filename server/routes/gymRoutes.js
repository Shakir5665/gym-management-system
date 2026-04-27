import express from "express";
import { createGym } from "../controllers/gymController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/create", auth, createGym);

export default router;