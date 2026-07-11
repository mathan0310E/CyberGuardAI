import "dotenv/config";
import express from "express";
import cors from "cors";
import { scanRoutes } from "./routes/scan.routes.js";
import { reportRoutes } from "./routes/report.routes.js";
import { chatRoutes } from "./routes/chat.routes.js";
import { dashboardRoutes } from "./routes/dashboard.routes.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();
const PORT = process.env["PORT"] ?? 3001;

app.use(cors({ origin: process.env["FRONTEND_URL"] ?? "http://localhost:3000" }));
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), service: "cyberguard-api", mode: "in-memory" });
});

app.use("/api/scans", scanRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`CyberGuard API running on http://localhost:${PORT} (in-memory mode)`);
});

export default app;
