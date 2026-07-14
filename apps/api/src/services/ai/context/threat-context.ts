import { store } from "../../../lib/store.js";
import type { ContextProvider, ContextOptions, CollectedData, ThreatIntelData } from "./types.js";

export const threatContextProvider: ContextProvider = {
  async collect(userId: string, _options?: ContextOptions): Promise<CollectedData> {
    const allScans = await store.getAllScans();
    const userScans = allScans.filter((s) => s.userId === userId || !s.userId);
    const completed = userScans.filter((s) => s.status === "completed");

    const categoryCounts: Record<string, number> = {};
    const domainThreats: Record<string, number> = {};

    for (const scan of completed) {
      for (const indicator of scan.malwareIndicators) {
        const cat = (indicator as Record<string, unknown>)["category"] as string;
        if (cat) {
          categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
          domainThreats[scan.domain] = (domainThreats[scan.domain] ?? 0) + 1;
        }
      }
    }

    const byCategory = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const topDomains = Object.entries(domainThreats)
      .map(([domain, threatCount]) => ({ domain, threatCount }))
      .sort((a, b) => b.threatCount - a.threatCount)
      .slice(0, 10);

    const totalThreats = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

    const data: ThreatIntelData = {
      totalThreats,
      byCategory,
      topDomains,
    };

    return { available: totalThreats > 0, summary: formatThreatData(data), details: data as unknown as Record<string, unknown> };
  },

  format(data: CollectedData): string {
    return data.summary;
  },

  shouldInject(message: string): boolean {
    const lower = message.toLowerCase();
    return /\b(threat|intel|virustotal|urlscan|abuseipdb|cve|mitre|attack|owasp|phishing|malware|ransomware|trojan|worm|botnet|apt)/i.test(lower);
  },
};

function formatThreatData(data: ThreatIntelData): string {
  const lines: string[] = [];
  lines.push("## Threat Intelligence Summary");
  lines.push(`- Total Threat Indicators: ${data.totalThreats}`);
  lines.push("");

  if (data.byCategory.length > 0) {
    lines.push("### Threat Categories");
    for (const t of data.byCategory.slice(0, 10)) {
      lines.push(`- ${t.category}: ${t.count}`);
    }
    lines.push("");
  }

  if (data.topDomains.length > 0) {
    lines.push("### Most Threatened Domains");
    for (const d of data.topDomains.slice(0, 5)) {
      lines.push(`- ${d.domain}: ${d.threatCount} threats`);
    }
  }

  return lines.join("\n");
}
