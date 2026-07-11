import { Router, type Request, type Response } from "express";
import { asyncHandler } from "../middleware/async-handler.js";
import { store } from "../store.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/stats", asyncHandler(async (_req: Request, res: Response) => {
  const allScans = await store.getAllScans();

  const totalScans = allScans.length;
  const completedScans = allScans.filter((s) => s.status === "completed").length;
  const malwareDetected = allScans.filter((s) => s.status === "completed" && s.riskScore >= 40).length;
  const cleanSites = allScans.filter((s) => s.status === "completed" && s.riskScore < 20).length;

  const completedScores = allScans.filter((s) => s.status === "completed").map((s) => s.riskScore);
  const averageRiskScore = completedScores.length > 0
    ? Math.round((completedScores.reduce((a, b) => a + b, 0) / completedScores.length) * 10) / 10
    : 0;

  const recentScans = await store.getRecentScans(10);

  const categoryCounts: Record<string, number> = {};
  for (const scan of allScans) {
    for (const indicator of scan.malwareIndicators) {
      const cat = (indicator as Record<string, unknown>)["category"];
      if (typeof cat === "string" && cat) {
        categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
      }
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
}));
