import express from "express";
import auth from "../middleware/auth.js";
import {
  getDashboardSummary,
  getCheckinTrend,
  getRiskDistribution,
  getDashboardLists,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/summary", auth, getDashboardSummary);
router.get("/trend/checkins", auth, getCheckinTrend);
router.get("/risk-distribution", auth, getRiskDistribution);
router.get("/lists", auth, getDashboardLists);

export default router;

