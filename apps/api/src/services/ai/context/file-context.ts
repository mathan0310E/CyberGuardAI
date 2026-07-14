import { store } from "../../../lib/store.js";
import type { ContextProvider, ContextOptions, CollectedData, FileScanData } from "./types.js";

export const fileContextProvider: ContextProvider = {
  async collect(userId: string, options?: ContextOptions): Promise<CollectedData> {
    const limit = options?.limit ?? 10;
    const allScans = await store.getAllScans();
    const userScans = allScans.filter((s) => s.userId === userId || !s.userId);

    const fileScans = userScans
      .filter((s) => s.malwareIndicators.length > 0 || s.riskScore > 0)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    const data: FileScanData = {
      files: fileScans.map((s) => ({
        scanId: s._id,
        url: s.url,
        indicators: s.malwareIndicators.length,
        riskScore: s.riskScore,
        riskLevel: s.riskLevel,
        technologies: (s.technologies as Array<Record<string, unknown>>).map((t) => t["name"] as string).filter(Boolean),
        malwareCategories: s.malwareIndicators
          .map((i) => (i as Record<string, unknown>)["category"] as string)
          .filter(Boolean),
      })),
      totalCount: fileScans.length,
    };

    return { available: data.files.length > 0, summary: formatFileData(data), details: data as unknown as Record<string, unknown> };
  },

  format(data: CollectedData): string {
    return data.summary;
  },

  shouldInject(message: string): boolean {
    const lower = message.toLowerCase();
    return /\b(file|exe|malware|virus|hash|sha256|yara|entropy|binary|detect|flag|quarantine|indicator|ioc|mitre)/i.test(lower);
  },
};

function formatFileData(data: FileScanData): string {
  if (data.files.length === 0) {
    return "## File Analysis\nNo file scan data available.";
  }

  const lines: string[] = [];
  lines.push(`## File/Website Analysis (${data.totalCount} files with indicators)`);
  lines.push("");

  for (const file of data.files) {
    lines.push(`### ${file.url}`);
    lines.push(`- Risk: ${file.riskScore}/100 (${file.riskLevel}) | Indicators: ${file.indicators}`);
    if (file.malwareCategories.length > 0) {
      lines.push(`- Categories: ${file.malwareCategories.join(", ")}`);
    }
    if (file.technologies.length > 0) {
      lines.push(`- Technologies: ${file.technologies.join(", ")}`);
    }
  }

  return lines.join("\n");
}
