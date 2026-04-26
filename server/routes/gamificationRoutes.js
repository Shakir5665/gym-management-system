import express from "express";
import Gamification from "../models/Gamification.js";

const router = express.Router();

router.get("/:memberId", async (req, res) => {
  const data = await Gamification.findOne({
    memberId: req.params.memberId
  });

  res.json(data || {});
});

export default router;