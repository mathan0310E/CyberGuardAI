import { Router, type Request, type Response } from "express";
import { store } from "../store.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/stats", async (_req: Request, res: Response) => {
  const totalScans = store.scans.length;
  const completedScans = store.scans.filter((s) => s.status === "completed").length;
  const malwareDetected = store.scans.filter((s) => s.status === "completed" && s.riskScore >= 40).length;
  const cleanSites = store.scans.filter((s) => s.status === "completed" && s.riskScore < 20).length;

  const completedScores = store.scans.filter((s) => s.status === "completed").map((s) => s.riskScore);
  const averageRiskScore = completedScores.length > 0
    ? Math.round((completedScores.reduce((a, b) => a + b, 0) / completedScores.length) * 10) / 10
    : 0;

  const recentScans = store.scans.slice(0, 10);

  // Aggregate threat categories from all scans
  const categoryCounts: Record<string, number> = {};
  for (const scan of store.scans) {
    for (const indicator of scan.malwareIndicators) {
      const cat = (indicator as Record<string, unknown>)["category"] as string;
      categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
    }
  }
  const threatDistribution = Object.entries(categoryCounts).map(([category, count]) => ({ category, count }));

  res.json({
    success: true,
    data: {
      totalScans,
      completedScans,
      malwareDetected,
      cleanSites,
      averageRiskScore,
      recentScans,
      threatDistribution,
      riskOverTime: [],
    },
    error: null,
    timestamp: new Date().toISOString(),
  });
});
