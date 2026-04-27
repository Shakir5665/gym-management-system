import express from "express";
import { createPayment} from "../controllers/paymentController.js";
import auth from "../middleware/auth.js";

const router = express.Router();
router.post("/", auth, createPayment);

export default router;