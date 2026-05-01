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
  getExpiringMembers,
  sendMemberReminder,
  setMemberCredentials,
  getFullMemberProfile,
} from "../controllers/memberController.js";
import auth from "../middleware/auth.js";
import { getMemberActivity } from "../controllers/memberInsightsController.js";

const router = express.Router();

router.post("/", auth, createMember);
router.get("/", auth, getMembers);
router.get("/expiring-tomorrow", auth, getExpiringMembers);
router.post("/:id/send-reminder", auth, sendMemberReminder);
router.get("/:id", auth, getMemberById);
router.put("/:id", auth, updateMember);
router.put("/:id/ban", auth, banMember);
router.put("/:id/unban", auth, unbanMember);
router.put("/:id/fine", auth, fineMember);
router.put("/:id/unfine", auth, unfineMember);
router.post("/:id/credentials", auth, setMemberCredentials);
router.get("/:id/activity", auth, getMemberActivity);
router.get("/:id/full-profile", auth, getFullMemberProfile);

export default router;