import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import "./cron/reminder.js";
import http from "http";

import memberRoutes from "./routes/memberRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import gamificationRoutes from "./routes/gamificationRoutes.js";
import retentionRoutes from "./routes/retentionRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { Server } from "socket.io";


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


// create HTTP server
const server = http.createServer(app);

// create socket server
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// make io accessible everywhere
app.set("io", io);

// connection handler
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// start server
server.listen(process.env.PORT || 5000, () => {
  console.log("Server running with Socket.io");
});



mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDB Connected");
});

