import express from "express";
import auth from "../middleware/auth.js";
import {
  createExpense,
  getAccountingReport,
  getExpenses,
  updateExpense,
  deleteExpense,
} from "../controllers/accountingController.js";

const router = express.Router();

router.post("/expenses", auth, createExpense);
router.get("/expenses", auth, getExpenses);
router.put("/expenses/:id", auth, updateExpense);
router.delete("/expenses/:id", auth, deleteExpense);
router.get("/report", auth, getAccountingReport);

export default router;
