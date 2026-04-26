import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import "./cron/reminder.js";

import memberRoutes from "./routes/memberRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import gamificationRoutes from "./routes/gamificationRoutes.js";
import retentionRoutes from "./routes/retentionRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/members", memberRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/retention", retentionRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDB Connected");
  app.listen(process.env.PORT || 5000, () =>
    console.log("Server running")
  );
});