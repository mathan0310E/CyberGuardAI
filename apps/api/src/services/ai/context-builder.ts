import { store, type MemoryScan, type MemoryReport, type MemoryUser } from "../../lib/store.js";

export interface DashboardContext {
  user: MemoryUser | null;
  stats: {
    totalScans: number;
    completedScans: number;
    threatsDetected: number;
    cleanSites: number;
    averageRiskScore: number;
  };
  todayScans: MemoryScan[];
  recentScans: MemoryScan[];
  recentReports: MemoryReport[];
  threatDistribution: Array<{ category: string; count: number }>;
}

export async function buildDashboardContext(userId: string): Promise<DashboardContext> {
  const [user, allScans, recentScans, recentReports] = await Promise.all([
    store.getUserById(userId),
    store.getAllScans(),
    store.getRecentScans(10),
    store.getAllReports(),
  ]);

  const userScans = userId ? allScans.filter((s) => s.userId === userId) : allScans;

  const completedScans = userScans.filter((s) => s.status === "completed");
  const totalScans = userScans.length;
  const completedCount = completedScans.length;
  const threatsDetected = completedScans.filter((s) => s.riskScore >= 40).length;
  const cleanSites = completedScans.filter((s) => s.riskScore < 20).length;

  const completedScores = completedScans.map((s) => s.riskScore);
  const averageRiskScore = completedScores.length > 0
    ? Math.round((completedScores.reduce((a, b) => a + b, 0) / completedScores.length) * 10) / 10
    : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayScans = userScans.filter((s) => {
    const scanDate = new Date(s.createdAt);
    scanDate.setHours(0, 0, 0, 0);
    return scanDate.getTime() === today.getTime();
  });

  const categoryCounts: Record<string, number> = {};
  for (const scan of userScans) {
    for (const indicator of scan.malwareIndicators) {
      const cat = (indicator as Record<string, unknown>)["category"];
      if (typeof cat === "string" && cat) {
        categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
      }
    }
  }
  const threatDistribution = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const last5Reports = recentReports.slice(0, 5);

  return {
    user,
    stats: {
      totalScans,
      completedScans: completedCount,
      threatsDetected,
      cleanSites,
      averageRiskScore,
    },
    todayScans,
    recentScans: recentScans.filter((s) => s.userId === userId || !s.userId).slice(0, 5),
    recentReports: last5Reports,
    threatDistribution,
  };
}

export function formatDashboardContext(ctx: DashboardContext): string {
  const lines: string[] = [];

  lines.push("## User Dashboard Data");
  lines.push("");

  if (ctx.user) {
    lines.push(`**User:** ${ctx.user.fullName} (${ctx.user.email})`);
    lines.push(`**Company:** ${ctx.user.companyName}`);
    lines.push("");
  }

  lines.push("### Current Dashboard Statistics");
  lines.push(`- **Total Scans:** ${ctx.stats.totalScans}`);
  lines.push(`- **Completed Scans:** ${ctx.stats.completedScans}`);
  lines.push(`- **Threats Detected:** ${ctx.stats.threatsDetected}`);
  lines.push(`- **Clean Sites:** ${ctx.stats.cleanSites}`);
  lines.push(`- **Average Risk Score:** ${ctx.stats.averageRiskScore}`);
  lines.push("");

  if (ctx.todayScans.length > 0) {
    lines.push(`### Today's Scans (${ctx.todayScans.length})`);
    for (const scan of ctx.todayScans.slice(0, 10)) {
      const time = new Date(scan.createdAt).toLocaleTimeString();
      const status = scan.status === "completed" ? "Completed" : scan.status;
      const indicatorCount = scan.malwareIndicators.length;
      lines.push(`- **${scan.url}** — Risk: ${scan.riskScore}/100 (${scan.riskLevel}) | Status: ${status} | Time: ${time} | Indicators: ${indicatorCount}`);
    }
    lines.push("");
  } else {
    lines.push("### Today's Scans");
    lines.push("- No scans performed today.");
    lines.push("");
  }

  if (ctx.recentScans.length > 0) {
    lines.push("### Recent Scan History");
    for (const scan of ctx.recentScans.slice(0, 5)) {
      const date = new Date(scan.createdAt).toLocaleDateString();
      const indicatorCount = scan.malwareIndicators.length;
      lines.push(`- **${scan.url}** — Risk: ${scan.riskScore}/100 (${scan.riskLevel}) | Date: ${date} | Indicators: ${indicatorCount}`);
    }
    lines.push("");
  }

  if (ctx.recentReports.length > 0) {
    lines.push("### Recent Reports");
    for (const report of ctx.recentReports) {
      const date = new Date(report.createdAt).toLocaleDateString();
      lines.push(`- **${report.title}** (${report.domain}) — Risk: ${report.riskScore}/100 | Findings: ${report.findingsCount} | Date: ${date}`);
    }
    lines.push("");
  }

  if (ctx.threatDistribution.length > 0) {
    lines.push("### Threat Distribution");
    for (const t of ctx.threatDistribution.slice(0, 10)) {
      lines.push(`- **${t.category}**: ${t.count} occurrences`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function shouldInjectDashboardContext(message: string): boolean {
  const lower = message.toLowerCase();

  const patterns = [
    /\b(today'?s?\s*(scan|report|dashboard|summary|analysis))/i,
    /\b(my\s*(dashboard|scans?|reports?|statistics|stats))/i,
    /\b(latest\s*(scan|report|result|analysis))/i,
    /\b(recent\s*(scans?|reports?|history|activity))/i,
    /\b(how\s*many\s*scans?)/i,
    /\b(risk\s*score)/i,
    /\b(threats?\s*detect)/i,
    /\b(clean\s*sites?)/i,
    /\b(scan\s*(history|report|summary|count|total))/i,
    /\b(dashboard)/i,
    /\b(summarize\s*(today|scan|recent|my))/i,
    /\b(what\s*(did|have)\s*(i|we)\s*scan)/i,
    /\b(overview|status\s*report)/i,
    /\b(compare\s*(scan|results?|websites?))/i,
    /\b(highest\s*risk)/i,
    /\b(lowest\s*risk)/i,
    /\b(malware\s*today)/i,
    /\b(did\s*you\s*detect)/i,
  ];

  return patterns.some((p) => p.test(lower));
}
