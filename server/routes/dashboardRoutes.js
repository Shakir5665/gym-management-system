import express from "express";
import auth from "../middleware/auth.js";
import {
  getDashboardSummary,
  getCheckinTrend,
  getChurnDistribution,
  getDashboardLists,
  getActiveMembersList,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/summary", auth, getDashboardSummary);
router.get("/trend/checkins", auth, getCheckinTrend);
router.get("/churn-distribution", auth, getChurnDistribution);
router.get("/lists", auth, getDashboardLists);
router.get("/active-list", auth, getActiveMembersList);

export default router;

