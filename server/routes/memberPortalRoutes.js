import express from "express";
import { 
  memberRegister, 
  getMemberProfile, 
  updateMemberProfile, 
  getMemberPayments, 
  getMemberAttendance 
} from "../controllers/memberPortalController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// 🔐 Private (Member only)
router.get("/profile", auth, getMemberProfile);
router.put("/profile", auth, updateMemberProfile);
router.get("/payments", auth, getMemberPayments);
router.get("/attendance", auth, getMemberAttendance);

export default router;
