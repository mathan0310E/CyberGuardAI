import { store } from "../../../lib/store.js";
import type { ContextProvider, ContextOptions, CollectedData, DashboardData } from "./types.js";
import { getCached, setCache, CACHE_TTL } from "./cache.js";

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}

export const dashboardContextProvider: ContextProvider = {
  async collect(userId: string, _options?: ContextOptions): Promise<CollectedData> {
    const cacheKey = `dashboard:${userId}`;
    const cached = getCached<DashboardData>(cacheKey);
    if (cached) {
      return { available: true, summary: formatDashboardData(cached), details: cached as unknown as Record<string, unknown> };
    }

    const [user, allScans] = await Promise.all([
      store.getUserById(userId),
      store.getAllScans(),
    ]);

    const userScans = allScans.filter((s) => s.userId === userId || !s.userId);
    const completed = userScans.filter((s) => s.status === "completed");

    const today = startOfDay(new Date());
    const weekStart = daysAgo(7);
    const monthStart = daysAgo(30);

    const todayScans = userScans.filter((s) => startOfDay(new Date(s.createdAt)).getTime() === today.getTime()).length;
    const weekScans = userScans.filter((s) => new Date(s.createdAt) >= weekStart).length;
    const monthScans = userScans.filter((s) => new Date(s.createdAt) >= monthStart).length;

    const threatsDetected = completed.filter((s) => s.riskScore >= 40).length;
    const cleanSites = completed.filter((s) => s.riskScore < 20).length;
    const scores = completed.map((s) => s.riskScore);
    const averageRiskScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
    const highestRiskScan = completed.length > 0 ? completed.reduce((a, b) => a.riskScore > b.riskScore ? a : b) : null;
    const lastScanTime = userScans.length > 0 ? new Date(userScans[0]!.createdAt).toISOString() : null;

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

    const data: DashboardData = {
      user,
      totalScans: userScans.length,
      completedScans: completed.length,
      threatsDetected,
      cleanSites,
      averageRiskScore,
      highestRiskScan,
      lastScanTime,
      todayScans,
      weekScans,
      monthScans,
      threatDistribution,
    };

    setCache(cacheKey, data, CACHE_TTL.dashboardStats);
    return { available: true, summary: formatDashboardData(data), details: data as unknown as Record<string, unknown> };
  },

  format(data: CollectedData): string {
    return data.summary;
  },

  shouldInject(message: string): boolean {
    const lower = message.toLowerCase();
    return /\b(dashboard|today|scan|report|stats|statistics|overview|threat|risk|malware|clean|week|month|quota|how many)/i.test(lower);
  },
};

function formatDashboardData(data: DashboardData): string {
  const lines: string[] = [];

  lines.push("## Dashboard Statistics");
  if (data.user) {
    lines.push(`**User:** ${data.user.fullName} | **Company:** ${data.user.companyName}`);
  }
  lines.push(`- Total Scans: ${data.totalScans} | Completed: ${data.completedScans}`);
  lines.push(`- Threats Detected: ${data.threatsDetected} | Clean Sites: ${data.cleanSites}`);
  lines.push(`- Average Risk Score: ${data.averageRiskScore}/100`);
  lines.push(`- Today: ${data.todayScans} | This Week: ${data.weekScans} | This Month: ${data.monthScans}`);
  if (data.lastScanTime) {
    lines.push(`- Last Scan: ${new Date(data.lastScanTime).toLocaleString()}`);
  }
  if (data.highestRiskScan) {
    lines.push(`- Highest Risk: ${data.highestRiskScan.url} (Score: ${data.highestRiskScan.riskScore}/100, Level: ${data.highestRiskScan.riskLevel})`);
  }
  if (data.threatDistribution.length > 0) {
    lines.push("- Threat Distribution:");
    for (const t of data.threatDistribution.slice(0, 8)) {
      lines.push(`  - ${t.category}: ${t.count}`);
    }
  }

  return lines.join("\n");
}
