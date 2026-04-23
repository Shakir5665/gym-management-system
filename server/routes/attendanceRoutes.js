import express from "express";
import { checkIn, getAttendance } from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/checkin", checkIn);
router.get("/", getAttendance);

export default router;