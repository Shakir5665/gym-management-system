import express from "express";
import { getUserRisk } from "../services/retentionService.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/:id", auth, async (req, res) => {
  const risk = await getUserRisk(req.params.id);
  res.json({ risk });
});

export default router;