import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { scanRoutes } from "./modules/scanner/scanner.routes.js";
import { reportRoutes } from "./modules/reports/reports.routes.js";
import { chatRoutes } from "./modules/chat/chat.routes.js";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { adminRoutes } from "./modules/admin/admin.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import { initFirebase, getDb, getAdminAuth } from "./config/firebase.js";
import { logger } from "./utils/logger.js";

initFirebase();

const app = express();
const PORT = process.env["PORT"] ?? 3001;
const NODE_ENV = process.env["NODE_ENV"] ?? "development";
const isProduction = NODE_ENV === "production";

// ── Security Headers (Helmet) ──
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://openrouter.ai", "https://firestore.googleapis.com", "https://identitytoolkit.googleapis.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  noSniff: true,
  xssFilter: true,
  frameguard: { action: "deny" },
  dnsPrefetchControl: { allow: false },
}));

// ── Compression ──
app.use(compression({
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024,
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://cyber-guard-ai-web.vercel.app",
  "https://cyber-guard-ai-web-mathan0310e.vercel.app",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server requests and tools like Postman
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("❌ Blocked by CORS:", origin);

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "Content-Type",
      "Accept",
      "Authorization",
      "X-Requested-With",
    ],
    exposedHeaders: ["X-Request-Id"],
    maxAge: 86400,
  })
);

// Handle preflight requests
app.options("*", cors());
// ── Body Parsing ──
app.use(express.json({ limit: "1mb" }));

// ── Request ID ──
app.use((_req, res, next) => {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  res.setHeader("X-Request-Id", requestId);
  next();
});

// ── Rate Limiting ──
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 200 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, data: null, error: "Too many requests. Please try again later.", timestamp: new Date().toISOString() },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, data: null, error: "Too many authentication attempts. Please try again later.", timestamp: new Date().toISOString() },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, data: null, error: "Chat rate limit exceeded. Maximum 20 messages per minute.", timestamp: new Date().toISOString() },
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { success: false, data: null, error: "Admin rate limit exceeded. Please try again later.", timestamp: new Date().toISOString() },
});

app.use("/api/", globalLimiter);

// ── Health Check (no rate limit) ──
app.get("/api/health", (_req, res) => {
  const hasFirestore = !!getDb();
  const hasAuth = !!getAdminAuth();
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "cyberguard-api",
    mode: hasFirestore ? "firebase" : hasAuth ? "firebase-auth-only" : "in-memory",
    version: "1.0.0",
  });
});

// ── Routes ──
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/scans", scanRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/chat", chatLimiter, chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminLimiter, adminRoutes);

// ── 404 Handler ──
app.use((_req, res) => {
  res.status(404).json({ success: false, data: null, error: "Endpoint not found", timestamp: new Date().toISOString() });
});

// ── Error Handler ──
app.use(errorHandler);

// ── Start Server ──
const server = app.listen(PORT, () => {
  const hasFirestore = !!getDb();
  const hasAuth = !!getAdminAuth();
  const mode = hasFirestore ? "firebase" : hasAuth ? "firebase-auth-only" : "in-memory";
  logger.info(`CyberGuard API running on http://localhost:${PORT}`);
  logger.info(`Mode: ${mode} | Environment: ${NODE_ENV}`);
});

// ── Graceful Shutdown ──
function shutdown(signal: string) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
  setTimeout(() => {
    logger.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", reason);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", err);
  process.exit(1);
});

export default app;
