import express from "express";
import {
  createMember,
  getMemberById,
  getMembers,
  updateMember,
  banMember,
  unbanMember,
  fineMember,
  unfineMember,
} from "../controllers/memberController.js";
import auth from "../middleware/auth.js";
import { getMemberActivity } from "../controllers/memberInsightsController.js";

const router = express.Router();

router.post("/", auth, createMember);
router.get("/", auth, getMembers);
router.get("/:id", auth, getMemberById);
router.put("/:id", auth, updateMember);
router.put("/:id/ban", auth, banMember);
router.put("/:id/unban", auth, unbanMember);
router.put("/:id/fine", auth, fineMember);
router.put("/:id/unfine", auth, unfineMember);
router.get("/:id/activity", auth, getMemberActivity);

export default router;