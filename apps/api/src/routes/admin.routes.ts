import { Router, type Request, type Response } from "express";
import { store } from "../store.js";

export const adminRoutes = Router();

adminRoutes.get("/users", async (_req: Request, res: Response) => {
  const users = store.users.map((u) => ({
    _id: u._id,
    fullName: u.fullName,
    username: u.username,
    email: u.email,
    companyName: u.companyName,
    role: u.role,
    status: u.status,
    scanCount: u.scanCount,
    createdAt: u.createdAt,
  }));

  res.json({ success: true, data: users, error: null, timestamp: new Date().toISOString() });
});

adminRoutes.patch("/users/:id/status", async (req: Request, res: Response) => {
  const { status } = req.body as { status: string };
  if (!["active", "suspended", "blocked", "pending_review"].includes(status)) {
    res.status(400).json({ success: false, data: null, error: "Invalid status", timestamp: new Date().toISOString() });
    return;
  }

  const user = store.users.find((u) => u._id === req.params["id"]);
  if (!user) {
    res.status(404).json({ success: false, data: null, error: "User not found", timestamp: new Date().toISOString() });
    return;
  }

  user.status = status as "active" | "suspended" | "blocked" | "pending_review";
  user.updatedAt = new Date();

  store.addLog("info", `Admin updated user ${user.email} status to ${status}`);

  res.json({ success: true, data: { _id: user._id, status: user.status }, error: null, timestamp: new Date().toISOString() });
});

adminRoutes.get("/stats", async (_req: Request, res: Response) => {
  const totalScans = store.scans.length;
  const completedScans = store.scans.filter((s) => s.status === "completed").length;
  const malwareDetected = store.scans.filter((s) => s.status === "completed" && s.riskScore >= 40).length;
  const totalUsers = store.users.length;
  const activeUsers = store.users.filter((u) => u.status === "active").length;
  const totalReports = store.reports.length;
  const logs = store.logs.slice(-50);

  res.json({
    success: true,
    data: { totalScans, completedScans, malwareDetected, totalUsers, activeUsers, totalReports, logs },
    error: null,
    timestamp: new Date().toISOString(),
  });
});

adminRoutes.get("/logs", async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query["page"]) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query["pageSize"]) || 50));
  const total = store.logs.length;
  const start = (page - 1) * pageSize;
  const data = store.logs.slice(start, start + pageSize).reverse();

  res.json({
    success: true,
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    timestamp: new Date().toISOString(),
  });
});
