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


// 🔹 Middleware
import errorHandler from "./middleware/errorHandler.js";

// 🔹 Load env
dotenv.config();

const app = express();

// 🔹 Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
}));
app.use(express.json());

// 🔹 Security headers for Google OAuth
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// 🔹 Health Check
app.get("/", (req, res) => {
  res.send("🚀 Gym SaaS API Running");
});

// 🔹 API Routes
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/gym", gymRoutes);

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

// 🔥 Attach io globally
app.set("io", io);

// 🔹 Socket connection
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// 🔹 MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB Error:", err.message);
  });