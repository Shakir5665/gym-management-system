import express from "express";
import { 
  memberRegister, 
  getMemberProfile, 
  getBasicProfile,
  updateMemberProfile, 
  getMemberPayments, 
  getMemberAttendance,
  getLeaderboard
} from "../controllers/memberPortalController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// 🔐 Private (Member only)
router.get("/me", auth, getBasicProfile);
router.get("/profile", auth, getMemberProfile);
router.put("/profile", auth, updateMemberProfile);
router.get("/payments", auth, getMemberPayments);
router.get("/attendance", auth, getMemberAttendance);
router.get("/leaderboard", auth, getLeaderboard);

export default router;
