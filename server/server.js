import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";
import compression from "compression";

// Set global timezone to +05:30
process.env.TZ = "Asia/Colombo";

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
import superRoutes from "./routes/superRoutes.js";
import memberPortalRoutes from "./routes/memberPortalRoutes.js";
import { initAutomation } from "./services/automationService.js";


// 🔹 Middleware
import errorHandler from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";
import { validateConfig } from "./utils/configValidator.js";

// 🔹 Load env
dotenv.config();
validateConfig();

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
app.use(compression()); // ⚡ gzip compress all responses
// NOTE: 2mb limit needed because profile pictures are sent as Base64 via API before Cloudinary upload
// Future improvement: Use Cloudinary's direct client-side upload to reduce this to 50kb
app.use(express.json({ limit: "2mb" }));

// 🛡️ RATE LIMITING (The Shield)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: { message: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 login/register attempts per minute
  message: { message: "Too many login attempts. Please wait 1 minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply global limiter to all routes
app.use("/api", globalLimiter);
// Apply strict limiter to auth routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

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
app.use("/api/super", superRoutes);
app.use("/api/portal", memberPortalRoutes);

// 🔹 Error handler
app.use(errorHandler);

// 🔹 Create HTTP server
const server = http.createServer(app);

// 🔹 Socket.io setup
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://gym-management-system-client.onrender.com", process.env.CORS_ORIGIN].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Attach io globally
app.set("io", io);

// 🔹 Socket connection
io.on("connection", (socket) => {
  // Silent connection logs to prevent terminal spam
  socket.on("disconnect", () => {});
});

// 🔹 MongoDB Connection (The Life Support)
const mongoDbName = process.env.MONGO_DB_NAME || "gymsystem";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { 
      dbName: mongoDbName,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info(`✅ MongoDB Connected (db: ${mongoDbName})`);
    
    server.listen(process.env.PORT || 5000, "0.0.0.0", () => {
      logger.info(`🚀 Server running on port ${process.env.PORT || 5000}`);
      initAutomation(io);
    });
  } catch (err) {
    logger.error("❌ DB Connection Error:", err);
    logger.info("🔄 Retrying in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// 🛡️ SAFETY NET (Prevent process death)
process.on("unhandledRejection", (err) => {
  logger.error("💥 UNHANDLED REJECTION! Shutting down...");
  logger.error(err);
  // Give server time to finish active requests before closing
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  logger.error("💥 UNCAUGHT EXCEPTION! Shutting down...");
  logger.error(err);
  process.exit(1);
});