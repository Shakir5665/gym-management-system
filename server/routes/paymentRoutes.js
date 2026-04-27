import express from "express";
import {
  createPayment,
  getMemberPayments,
  getPaymentReport,
} from "../controllers/paymentController.js";
import auth from "../middleware/auth.js";

const router = express.Router();
router.post("/", auth, createPayment);
router.get("/", auth, getPaymentReport);
router.get("/member/:memberId", auth, getMemberPayments);

export default router;