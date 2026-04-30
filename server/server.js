import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

// 🔹 Routes
import authRoutes from "./routes/authRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import gamificationRoutes from "./routes/gamificationRoutes.js";
import gymRoutes from "./routes/gymRoutes.js";
import retentionRoutes from "./routes/retentionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import accountingRoutes from "./routes/accountingRoutes.js";
import { initAutomation } from "./services/automationService.js";


// 🔹 Middleware
import errorHandler from "./middleware/errorHandler.js";

// 🔹 Load env
dotenv.config();

const app = express();

// 🔹 Middlewares
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://gym-management-system-client.onrender.com",
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: "5mb" }));

// 🔹 Security headers for Google OAuth (Removed as they break cross-origin popups in production)
// app.use((req, res, next) => {
//   res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
//   res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
//   next();
// });

// 🔹 Health Check
app.get("/", (req, res) => {
  res.send("SMART GYM API Running");
});

// 🔹 UptimeRobot Ping Route
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// 🔹 API Routes
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/gym", gymRoutes);
app.use("/api/churn", retentionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/accounting", accountingRoutes);

// 🔹 Error handler
app.use(errorHandler);

// 🔹 Create HTTP server
const server = http.createServer(app);

// 🔹 Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// Attach io globally
app.set("io", io);

// 🔹 Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// 🔹 MongoDB Connection
const mongoDbName = process.env.MONGO_DB_NAME || "gymsystem";

mongoose
  .connect(process.env.MONGO_URI, { dbName: mongoDbName })
  .then(() => {
    console.log(`MongoDB Connected (db: ${mongoDbName})`);

    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
      initAutomation(io);
    });
  })
  .catch((err) => {
    console.error("DB Error:", err.message);
  });