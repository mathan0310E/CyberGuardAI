import { store } from "../../../lib/store.js";
import type { ContextProvider, ContextOptions, CollectedData, MonitoringData } from "./types.js";

export const monitoringContextProvider: ContextProvider = {
  async collect(userId: string, _options?: ContextOptions): Promise<CollectedData> {
    const allScans = await store.getAllScans();
    const userScans = allScans.filter((s) => s.userId === userId || !s.userId);
    const completed = userScans.filter((s) => s.status === "completed");

    const monitoredSites = new Set(completed.map((s) => s.domain)).size;
    const lastScan = completed.length > 0 ? completed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] : null;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const todayScans = completed.filter((s) => new Date(s.createdAt) >= yesterday);

    let changesDetected = 0;
    for (const scan of todayScans) {
      if (scan.malwareIndicators.length > 0) changesDetected++;
    }

    const data: MonitoringData = {
      monitoredSites,
      lastCheck: lastScan ? new Date(lastScan.createdAt).toISOString() : null,
      changesDetected,
    };

    return { available: monitoredSites > 0, summary: formatMonitoringData(data), details: data as unknown as Record<string, unknown> };
  },

  format(data: CollectedData): string {
    return data.summary;
  },

  shouldInject(message: string): boolean {
    const lower = message.toLowerCase();
    return /\b(monitor|change|update|new|since|yesterday|today|expir|certificate|ssl|dns|reputation|cve|vulnerab)/i.test(lower);
  },
};

function formatMonitoringData(data: MonitoringData): string {
  const lines: string[] = [];
  lines.push("## Monitoring Status");
  lines.push(`- Monitored Domains: ${data.monitoredSites}`);
  if (data.lastCheck) {
    lines.push(`- Last Check: ${new Date(data.lastCheck).toLocaleString()}`);
  }
  lines.push(`- Changes Detected (24h): ${data.changesDetected}`);
  lines.push("");
  lines.push("*Note: Real-time monitoring requires Premium. Current data is based on scan history.*");
  return lines.join("\n");
}
