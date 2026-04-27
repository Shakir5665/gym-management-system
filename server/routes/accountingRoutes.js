import express from "express";
import auth from "../middleware/auth.js";
import {
  createExpense,
  getAccountingReport,
  getExpenses,
} from "../controllers/accountingController.js";

const router = express.Router();

router.post("/expenses", auth, createExpense);
router.get("/expenses", auth, getExpenses);
router.get("/report", auth, getAccountingReport);

export default router;
