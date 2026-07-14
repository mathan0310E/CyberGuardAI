import { store } from "../../../lib/store.js";
import type { ContextProvider, ContextOptions, CollectedData, ReportData } from "./types.js";

export const reportContextProvider: ContextProvider = {
  async collect(userId: string, options?: ContextOptions): Promise<CollectedData> {
    const limit = options?.limit ?? 5;
    const allReports = await store.getAllReports();
    const allScans = await store.getAllScans();
    const userScanIds = new Set(
      allScans.filter((s) => s.userId === userId || !s.userId).map((s) => s._id)
    );
    const userReports = allReports
      .filter((r) => userScanIds.has(r.scanId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const data: ReportData = {
      reports: userReports.slice(0, limit),
      totalCount: userReports.length,
    };

    return { available: data.reports.length > 0, summary: formatReportData(data), details: data as unknown as Record<string, unknown> };
  },

  format(data: CollectedData): string {
    return data.summary;
  },

  shouldInject(message: string): boolean {
    const lower = message.toLowerCase();
    return /\b(report|pdf|executive|summary|summary|recommendation|compliance|trend|export)/i.test(lower);
  },
};

function formatReportData(data: ReportData): string {
  if (data.reports.length === 0) {
    return "## Reports\nNo reports available.";
  }

  const lines: string[] = [];
  lines.push(`## Recent Reports (${data.reports.length} of ${data.totalCount})`);
  lines.push("");

  for (const report of data.reports) {
    const date = new Date(report.createdAt).toLocaleDateString();
    lines.push(`### ${report.title}`);
    lines.push(`- URL: ${report.url} | Domain: ${report.domain}`);
    lines.push(`- Risk: ${report.riskScore}/100 (${report.riskLevel}) | Findings: ${report.findingsCount}`);
    lines.push(`- Date: ${date}`);
    if (report.summary) {
      lines.push(`- Summary: ${report.summary.substring(0, 200)}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
