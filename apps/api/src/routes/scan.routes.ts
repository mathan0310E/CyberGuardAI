import { Router, type Request, type Response } from "express";
import { scanRequestSchema } from "../middleware/validation.js";
import { store, type MemoryScan } from "../store.js";
import { runScanPipeline } from "../services/scan-orchestrator.js";
import { sendTelegramAlert, generateEventId } from "../services/telegram.js";

export const scanRoutes = Router();

scanRoutes.get("/", async (_req: Request, res: Response) => {
  const page = Math.max(1, Number(_req.query["page"]) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(_req.query["pageSize"]) || 20));
  const total = store.scans.length;
  const start = (page - 1) * pageSize;
  const data = store.scans.slice(start, start + pageSize);

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

scanRoutes.get("/:id", async (req: Request, res: Response) => {
  const scan = store.scans.find((s) => s._id === req.params["id"]);
  if (!scan) {
    res.status(404).json({ success: false, data: null, error: "Scan not found", timestamp: new Date().toISOString() });
    return;
  }
  res.json({ success: true, data: scan, error: null, timestamp: new Date().toISOString() });
});

scanRoutes.post("/", async (req: Request, res: Response) => {
  const parsed = scanRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, data: null, error: parsed.error.issues[0]?.message ?? "Invalid request", timestamp: new Date().toISOString() });
    return;
  }

  const { url, options } = parsed.data;
  let domain: string;
  try {
    domain = new URL(url).hostname;
  } catch {
    res.status(400).json({ success: false, data: null, error: "Invalid URL format", timestamp: new Date().toISOString() });
    return;
  }

  const now = new Date();

  const scan: MemoryScan = {
    _id: store.getNextScanId(),
    url,
    domain,
    status: "pending",
    riskScore: 0,
    riskLevel: "safe",
    scanOptions: (options as Record<string, boolean>) ?? {},
    htmlAnalysis: null,
    jsAnalysis: null,
    screenshot: null,
    ocrResults: null,
    cvAnalysis: null,
    threatIntel: [],
    technologies: [],
    malwareIndicators: [],
    aiAnalysis: null,
    reportId: null,
    userId: null,
    startedAt: now,
    completedAt: null,
    duration: null,
    createdAt: now,
    updatedAt: now,
  };

  store.scans.unshift(scan);
  store.addLog("info", `Scan started: ${url}`);

  const updateStatus = (status: MemoryScan["status"]) => {
    scan.status = status;
    scan.updatedAt = new Date();
  };

  runScanPipeline(scan, updateStatus).then((result) => {
    scan.status = "completed";
    scan.htmlAnalysis = result.htmlAnalysis;
    scan.jsAnalysis = result.jsAnalysis;
    scan.screenshot = result.screenshot;
    scan.ocrResults = result.ocrResults;
    scan.cvAnalysis = result.cvAnalysis;
    scan.threatIntel = result.threatIntel as unknown as Record<string, unknown>[];
    scan.technologies = result.technologies as unknown as Record<string, unknown>[];
    scan.malwareIndicators = result.malwareIndicators as unknown as Record<string, unknown>[];
    scan.aiAnalysis = result.aiAnalysis as unknown as Record<string, unknown>;
    scan.completedAt = new Date();
    scan.duration = Math.round((Date.now() - scan.startedAt.getTime()) / 1000);
    scan.updatedAt = new Date();

    if (result.aiAnalysis) {
      scan.riskScore = result.aiAnalysis.riskScore;
      scan.riskLevel = result.aiAnalysis.riskLevel;
    }

    store.addLog("info", `Scan completed: ${url} (risk=${scan.riskScore}, level=${scan.riskLevel})`);

    if (scan.riskScore >= 80) {
      sendTelegramAlert({
        eventType: "Critical Malware Detected",
        severity: "critical",
        url,
        riskScore: scan.riskScore,
        eventId: generateEventId(),
      });
    }
  }).catch((error) => {
    scan.status = "failed";
    scan.completedAt = new Date();
    scan.duration = Math.round((Date.now() - scan.startedAt.getTime()) / 1000);
    scan.updatedAt = new Date();
    const msg = error instanceof Error ? error.message : "Unknown error";
    store.addLog("error", `Scan failed: ${url} - ${msg}`);
    sendTelegramAlert({
      eventType: "Scan Pipeline Failed",
      severity: "warning",
      url,
      eventId: generateEventId(),
    });
  });

  res.status(201).json({
    success: true,
    data: scan,
    error: null,
    timestamp: new Date().toISOString(),
  });
});

scanRoutes.delete("/:id", async (req: Request, res: Response) => {
  const idx = store.scans.findIndex((s) => s._id === req.params["id"]);
  if (idx === -1) {
    res.status(404).json({ success: false, data: null, error: "Scan not found", timestamp: new Date().toISOString() });
    return;
  }
  store.scans.splice(idx, 1);
  res.json({ success: true, data: { deleted: true }, error: null, timestamp: new Date().toISOString() });
});
