import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { scanRoutes } from "./routes/scan.routes.js";
import { reportRoutes } from "./routes/report.routes.js";
import { chatRoutes } from "./routes/chat.routes.js";
import { dashboardRoutes } from "./routes/dashboard.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();
const PORT = process.env["PORT"] ?? 3001;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env["FRONTEND_URL"] ?? "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

const scanLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, error: "Scan rate limit exceeded. Maximum 5 scans per minute." },
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "cyberguard-api",
    mode: process.env["MONGODB_URI"] ? "database" : "in-memory",
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/scans", scanLimiter, scanRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`CyberGuard API running on http://localhost:${PORT}`);
  console.log(`Mode: ${process.env["MONGODB_URI"] ? "database" : "in-memory"}`);
  console.log(`Environment: ${process.env["NODE_ENV"] ?? "development"}`);
});

export default app;
