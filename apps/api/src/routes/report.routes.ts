import { Router, type Request, type Response } from "express";
import { store, type MemoryScan } from "../store.js";
import { generatePDFReport } from "../services/pdf-generator.js";

export const reportRoutes = Router();

reportRoutes.get("/", async (_req: Request, res: Response) => {
  const page = Math.max(1, Number(_req.query["page"]) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(_req.query["pageSize"]) || 20));
  const total = store.reports.length;
  const start = (page - 1) * pageSize;
  const data = store.reports.slice(start, start + pageSize).map((r) => ({
    _id: r._id,
    scanId: r.scanId,
    title: r.title,
    url: r.url,
    domain: r.domain,
    riskScore: r.riskScore,
    riskLevel: r.riskLevel,
    summary: r.summary,
    findingsCount: r.findingsCount,
    generatedAt: r.generatedAt,
    createdAt: r.createdAt,
  }));

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

reportRoutes.get("/:id/download", async (req: Request, res: Response) => {
  const report = store.reports.find((r) => r._id === req.params["id"]);
  if (!report) {
    res.status(404).json({ success: false, data: null, error: "Report not found", timestamp: new Date().toISOString() });
    return;
  }

  const scan = store.scans.find((s) => s._id === report.scanId) as MemoryScan | undefined;
  if (!scan) {
    res.status(404).json({ success: false, data: null, error: "Associated scan not found", timestamp: new Date().toISOString() });
    return;
  }

  try {
    const pdfBuffer = await generatePDFReport(scan);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="CyberGuard-Report-${report.domain}-${report._id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "PDF generation failed";
    res.status(500).json({ success: false, data: null, error: msg, timestamp: new Date().toISOString() });
  }
});

reportRoutes.post("/", async (req: Request, res: Response) => {
  const { scanId } = req.body as { scanId?: string };
  if (!scanId) {
    res.status(400).json({ success: false, data: null, error: "scanId is required", timestamp: new Date().toISOString() });
    return;
  }

  const scan = store.scans.find((s) => s._id === scanId);
  if (!scan) {
    res.status(404).json({ success: false, data: null, error: "Scan not found", timestamp: new Date().toISOString() });
    return;
  }

  const existingReport = store.reports.find((r) => r.scanId === scanId);
  if (existingReport) {
    res.json({ success: true, data: existingReport, error: null, timestamp: new Date().toISOString() });
    return;
  }

  const aiAnalysis = scan.aiAnalysis as Record<string, unknown> | null;
  const indicators = scan.malwareIndicators as Record<string, unknown>[];

  const report = {
    _id: store.getNextReportId(),
    scanId,
    title: `${scan.riskLevel.charAt(0).toUpperCase() + scan.riskLevel.slice(1)} Risk Report — ${scan.domain}`,
    url: scan.url,
    domain: scan.domain,
    riskScore: scan.riskScore,
    riskLevel: scan.riskLevel,
    summary: aiAnalysis?.["executiveSummary"] as string ?? "Analysis completed.",
    findingsCount: indicators.length,
    pdfData: null as Buffer | null,
    generatedAt: new Date(),
    createdAt: new Date(),
  };

  try {
    const pdfBuffer = await generatePDFReport(scan);
    report.pdfData = pdfBuffer;
  } catch (error) {
    console.error("PDF generation failed:", error);
  }

  store.reports.unshift(report);
  scan.reportId = report._id;

  store.addLog("info", `Report generated: ${report._id} for ${scan.domain}`);

  res.status(201).json({
    success: true,
    data: { _id: report._id, scanId: report.scanId, title: report.title, url: report.url, domain: report.domain, riskScore: report.riskScore, riskLevel: report.riskLevel, summary: report.summary, findingsCount: report.findingsCount, generatedAt: report.generatedAt },
    error: null,
    timestamp: new Date().toISOString(),
  });
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
