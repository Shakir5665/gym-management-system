import express from "express";
import { getUserRisk } from "../services/retentionService.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const risk = await getUserRisk(req.params.id);
  res.json({ risk });
});

export default router;