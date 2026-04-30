import express from "express";
import auth from "../middleware/auth.js";
import { getGyms, toggleGymStatus, getGlobalStats, registerGym, scheduleGymDeletion, revokeGymDeletion } from "../controllers/superController.js";

const router = express.Router();

// 🔒 Middleware to restrict to Super Admins only
const superOnly = (req, res, next) => {
  if (req.user && req.user.role === "SUPER_ADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Super Admin only." });
  }
};

router.get("/gyms", auth, superOnly, getGyms);
router.post("/register-gym", auth, superOnly, registerGym);
router.put("/gyms/:id/status", auth, superOnly, toggleGymStatus);
router.post("/gyms/:id/schedule-deletion", auth, superOnly, scheduleGymDeletion);
router.post("/gyms/:id/revoke-deletion", auth, superOnly, revokeGymDeletion);
router.get("/stats", auth, superOnly, getGlobalStats);

export default router;
