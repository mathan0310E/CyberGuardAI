import { Router, type Response } from "express";
import { requireAdmin, type AuthRequest } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/async-handler.js";
import { store } from "../../lib/store.js";

export const adminRoutes = Router();

adminRoutes.get("/users", requireAdmin, asyncHandler(async (_req: AuthRequest, res: Response) => {
  const allUsers = await store.listUsers();
  const users = allUsers.map((u) => ({
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
}));

adminRoutes.patch("/users/:id/status", requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body as { status: string };
  if (!["active", "suspended", "blocked", "pending_review"].includes(status)) {
    res.status(400).json({ success: false, data: null, error: "Invalid status", timestamp: new Date().toISOString() });
    return;
  }

  const user = await store.getUserById(req.params["id"] as string);
  if (!user) {
    res.status(404).json({ success: false, data: null, error: "User not found", timestamp: new Date().toISOString() });
    return;
  }

  await store.updateUser(user._id, {
    status: status as "active" | "suspended" | "blocked" | "pending_review",
    updatedAt: new Date(),
  });

  await store.addLog("info", `Admin updated user ${user.email} status to ${status}`);

  res.json({ success: true, data: { _id: user._id, status }, error: null, timestamp: new Date().toISOString() });
}));

adminRoutes.get("/stats", requireAdmin, asyncHandler(async (_req: AuthRequest, res: Response) => {
  const allScans = await store.getAllScans();
  const totalScans = allScans.length;
  const completedScans = allScans.filter((s) => s.status === "completed").length;
  const malwareDetected = allScans.filter((s) => s.status === "completed" && s.riskScore >= 40).length;
  const totalUsers = await store.getUserCount();
  const activeUsers = await store.getActiveUserCount();
  const { total: totalReports } = await store.listReports(1, 1);
  const logs = await store.getRecentLogs(50);

  res.json({
    success: true,
    data: { totalScans, completedScans, malwareDetected, totalUsers, activeUsers, totalReports, logs },
    error: null,
    timestamp: new Date().toISOString(),
  });
}));

adminRoutes.get("/logs", requireAdmin, asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Math.max(1, Number(req.query["page"]) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query["pageSize"]) || 50));
  const { data, total } = await store.listLogs(page, pageSize);

  res.json({
    success: true,
    data: { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    timestamp: new Date().toISOString(),
  });
}));
