import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { scanRequestSchema } from "../../middleware/validation.js";
import { requireAuth, type AuthRequest } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/async-handler.js";
import { store, type MemoryScan } from "../../lib/store.js";
import { runScanPipeline } from "./scanner.service.js";
import { sendTelegramAlert, generateEventId } from "../telegram/telegram.service.js";
import { logger } from "../../utils/logger.js";

export const scanRoutes = Router();

const scanLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, error: "Scan rate limit exceeded. Maximum 5 scans per minute." },
});

scanRoutes.get("/", asyncHandler(async (_req: Request, res: Response) => {
  const page = Math.max(1, Number(_req.query["page"]) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(_req.query["pageSize"]) || 20));
  const { data, total } = await store.listScans(page, pageSize);

  res.json({
    success: true,
    data: { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    timestamp: new Date().toISOString(),
  });
}));

scanRoutes.get("/:id", asyncHandler(async (req: Request, res: Response) => {
  const scan = await store.getScanById(req.params["id"] as string);
  if (!scan) {
    res.status(404).json({ success: false, data: null, error: "Scan not found", timestamp: new Date().toISOString() });
    return;
  }
  res.json({ success: true, data: scan, error: null, timestamp: new Date().toISOString() });
}));

scanRoutes.post("/", scanLimiter, requireAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
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
  const _id = await store.getNextId("scan");

  const scan: MemoryScan = {
    _id,
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
    userId: req.userId ?? null,
    startedAt: now,
    completedAt: null,
    duration: null,
    createdAt: now,
    updatedAt: now,
  };

  await store.addScan(scan);
  await store.addLog("info", `Scan started: ${url}`);

  // Fire-and-forget pipeline — catch all errors to prevent server crash
  runScanPipeline(scan, (status) => {
    store.updateScan(scan._id, { status, updatedAt: new Date() }).catch((e) => {
      logger.error(`Failed to update scan status for ${scan._id}:`, e);
    });
  }).then(async (result) => {
    const completedAt = new Date();
    const duration = Math.round((Date.now() - scan.startedAt.getTime()) / 1000);

    const updateData: Partial<MemoryScan> = {
      status: "completed",
      htmlAnalysis: result.htmlAnalysis,
      jsAnalysis: result.jsAnalysis,
      screenshot: result.screenshot,
      ocrResults: result.ocrResults,
      cvAnalysis: result.cvAnalysis,
      threatIntel: result.threatIntel as unknown as Record<string, unknown>[],
      technologies: result.technologies as unknown as Record<string, unknown>[],
      malwareIndicators: result.malwareIndicators as unknown as Record<string, unknown>[],
      aiAnalysis: result.aiAnalysis as unknown as Record<string, unknown>,
      completedAt,
      duration,
      updatedAt: completedAt,
    };

    if (result.aiAnalysis) {
      updateData.riskScore = result.aiAnalysis.riskScore;
      updateData.riskLevel = result.aiAnalysis.riskLevel;
    }

    await store.updateScan(scan._id, updateData);

    const finalRiskScore = updateData.riskScore ?? 0;
    const finalRiskLevel = updateData.riskLevel ?? "safe";

    await store.addLog("info", `Scan completed: ${url} (risk=${finalRiskScore}, level=${finalRiskLevel})`);

    if (finalRiskScore >= 80) {
      sendTelegramAlert({
        eventType: "Critical Malware Detected",
        severity: "critical",
        url,
        riskScore: finalRiskScore,
        eventId: generateEventId(),
      });
    }
  }).catch(async (error) => {
    const completedAt = new Date();
    const duration = Math.round((Date.now() - scan.startedAt.getTime()) / 1000);
    await store.updateScan(scan._id, {
      status: "failed",
      completedAt,
      duration,
      updatedAt: completedAt,
    });
    const msg = error instanceof Error ? error.message : "Unknown error";
    await store.addLog("error", `Scan failed: ${url} - ${msg}`);
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
}));

scanRoutes.delete("/:id", requireAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await store.getScanById(req.params["id"] as string);
  if (!existing) {
    res.status(404).json({ success: false, data: null, error: "Scan not found", timestamp: new Date().toISOString() });
    return;
  }
  await store.deleteScan(req.params["id"] as string);
  res.json({ success: true, data: { deleted: true }, error: null, timestamp: new Date().toISOString() });
}));
