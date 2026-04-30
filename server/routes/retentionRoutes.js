import express from "express";
import { getChurnProbability } from "../services/retentionService.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/:id", auth, async (req, res) => {
  const probability = await getChurnProbability(req.params.id, req.user?.gymId);
  res.json({ probability });
});

export default router;