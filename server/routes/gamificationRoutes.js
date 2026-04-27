// routes/gamificationRoutes.js
import express from "express";
import Gamification from "../models/Gamification.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/:memberId", auth, async (req, res) => {
  const { memberId } = req.params;
  const gymId = req.user.gymId;

  const data = await Gamification.findOne({ memberId, gymId });

  res.json(data || {});
});

export default router;