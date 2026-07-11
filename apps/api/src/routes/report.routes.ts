import { Router, type Request, type Response } from "express";
import { store } from "../store.js";

export const reportRoutes = Router();

reportRoutes.get("/", async (_req: Request, res: Response) => {
  const page = Math.max(1, Number(_req.query["page"]) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(_req.query["pageSize"]) || 20));
  const total = store.reports.length;
  const start = (page - 1) * pageSize;
  const data = store.reports.slice(start, start + pageSize);

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

reportRoutes.get("/:id", async (req: Request, res: Response) => {
  const report = store.reports.find((r) => r._id === req.params["id"]);
  if (!report) {
    res.status(404).json({ success: false, data: null, error: "Report not found", timestamp: new Date().toISOString() });
    return;
  }
  res.json({ success: true, data: report, error: null, timestamp: new Date().toISOString() });
});

reportRoutes.delete("/:id", async (req: Request, res: Response) => {
  const idx = store.reports.findIndex((r) => r._id === req.params["id"]);
  if (idx === -1) {
    res.status(404).json({ success: false, data: null, error: "Report not found", timestamp: new Date().toISOString() });
    return;
  }
  store.reports.splice(idx, 1);
  res.json({ success: true, data: { deleted: true }, error: null, timestamp: new Date().toISOString() });
});
