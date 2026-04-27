import express from "express";
import { createMember, getMembers } from "../controllers/memberController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, createMember);
router.get("/", auth, getMembers);

export default router;