import express from "express";
import { checkIn } from "../controllers/attendanceController.js";
import auth from "../middleware/auth.js";
import { getMemberAttendanceTrend, getMemberRecentAttendance } from "../controllers/memberInsightsController.js";

const router = express.Router();
router.post("/checkin", auth, checkIn);
router.get("/trend/:memberId", auth, getMemberAttendanceTrend);
router.get("/recent/:memberId", auth, getMemberRecentAttendance);

export default router;