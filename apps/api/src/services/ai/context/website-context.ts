import { store } from "../../../lib/store.js";
import type { ContextProvider, ContextOptions, CollectedData, WebsiteScanData } from "./types.js";
import { getCached, setCache, CACHE_TTL } from "./cache.js";

export const websiteContextProvider: ContextProvider = {
  async collect(userId: string, options?: ContextOptions): Promise<CollectedData> {
    const limit = options?.limit ?? 20;
    const cacheKey = `website_scans:${userId}:${limit}`;
    const cached = getCached<WebsiteScanData>(cacheKey);
    if (cached) {
      return { available: cached.scans.length > 0, summary: formatWebsiteData(cached), details: cached as unknown as Record<string, unknown> };
    }

    const allScans = await store.getAllScans();
    const userScans = allScans.filter((s) => s.userId === userId || !s.userId);
    const recentScans = userScans
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    const data: WebsiteScanData = {
      scans: recentScans,
      totalCount: userScans.length,
    };

    setCache(cacheKey, data, CACHE_TTL.recentScans);
    return { available: data.scans.length > 0, summary: formatWebsiteData(data), details: data as unknown as Record<string, unknown> };
  },

  format(data: CollectedData): string {
    return data.summary;
  },

  shouldInject(message: string): boolean {
    const lower = message.toLowerCase();
    return /\b(scan|website|url|site|domain|vulnerab|threat|malware|risk|iframe|redirect|script|header|ssl|compare|highest|lowest|latest|recent)/i.test(lower);
  },
};

function formatWebsiteData(data: WebsiteScanData): string {
  if (data.scans.length === 0) {
    return "## Website Scans\nNo scans available.";
  }

  const lines: string[] = [];
  lines.push(`## Website Scans (showing ${data.scans.length} of ${data.totalCount})`);
  lines.push("");

  for (const scan of data.scans.slice(0, 15)) {
    const date = new Date(scan.createdAt).toLocaleDateString();
    const indicatorCount = scan.malwareIndicators.length;
    const techList = (scan.technologies as Array<Record<string, unknown>>)
      .slice(0, 5)
      .map((t) => t["name"] as string)
      .filter(Boolean)
      .join(", ");

    lines.push(`### ${scan.url}`);
    lines.push(`- Risk: ${scan.riskScore}/100 (${scan.riskLevel}) | Date: ${date} | Status: ${scan.status}`);
    lines.push(`- Indicators: ${indicatorCount} | Domain: ${scan.domain}`);

    if (scan.htmlAnalysis) {
      const html = scan.htmlAnalysis as Record<string, unknown>;
      const hiddenIframes = (html["hiddenIframes"] as unknown[])?.length ?? 0;
      const suspiciousForms = (html["suspiciousForms"] as unknown[])?.length ?? 0;
      const metaRedirects = (html["metaRedirects"] as unknown[])?.length ?? 0;
      const externalScripts = (html["externalScripts"] as unknown[])?.length ?? 0;
      if (hiddenIframes > 0 || suspiciousForms > 0 || metaRedirects > 0 || externalScripts > 0) {
        lines.push(`- HTML Analysis: iframes=${hiddenIframes}, forms=${suspiciousForms}, redirects=${metaRedirects}, extScripts=${externalScripts}`);
      }
    }

    if (scan.jsAnalysis) {
      const js = scan.jsAnalysis as Record<string, unknown>;
      const evalCount = (js["evalUsage"] as number) ?? 0;
      const obfuscated = (js["obfuscatedScripts"] as number) ?? 0;
      if (evalCount > 0 || obfuscated > 0) {
        lines.push(`- JS Analysis: eval=${evalCount}, obfuscated=${obfuscated}`);
      }
    }

    if (scan.aiAnalysis) {
      const ai = scan.aiAnalysis as Record<string, unknown>;
      const summary = ai["executiveSummary"] as string;
      if (summary) {
        lines.push(`- AI Summary: ${summary.substring(0, 200)}`);
      }
    }

    if (techList) {
      lines.push(`- Technologies: ${techList}`);
    }

    if (indicatorCount > 0) {
      const categories = new Map<string, number>();
      for (const ind of scan.malwareIndicators) {
        const cat = (ind as Record<string, unknown>)["category"] as string;
        if (cat) categories.set(cat, (categories.get(cat) ?? 0) + 1);
      }
      const cats = [...categories.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([c, n]) => `${c}(${n})`)
        .join(", ");
      lines.push(`- Threat Categories: ${cats}`);
    }

    lines.push("");
  }

  return lines.join("\n");
}
