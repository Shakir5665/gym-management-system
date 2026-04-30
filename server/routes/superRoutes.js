import express from "express";
import auth from "../middleware/auth.js";
import { getGyms, toggleGymStatus, getGlobalStats } from "../controllers/superController.js";

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
router.put("/gyms/:id/status", auth, superOnly, toggleGymStatus);
router.get("/stats", auth, superOnly, getGlobalStats);

export default router;
