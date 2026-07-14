import { store } from "../../../lib/store.js";
import type { ContextProvider, ContextOptions, CollectedData, BusinessData } from "./types.js";

export const businessContextProvider: ContextProvider = {
  async collect(userId: string, _options?: ContextOptions): Promise<CollectedData> {
    const allScans = await store.getAllScans();
    const userScans = allScans.filter((s) => s.userId === userId);
    const scanCount = userScans.length;

    const data: BusinessData = {
      plan: "Free",
      totalScans: scanCount,
      scanQuota: 50,
      remainingQuota: Math.max(0, 50 - scanCount),
    };

    return { available: true, summary: formatBusinessData(data), details: data as unknown as Record<string, unknown> };
  },

  format(data: CollectedData): string {
    return data.summary;
  },

  shouldInject(message: string): boolean {
    const lower = message.toLowerCase();
    return /\b(subscription|plan|quota|limit|remaining|billing|payment|api\s*key|team|organization|enterprise|premium|upgrade)/i.test(lower);
  },
};

function formatBusinessData(data: BusinessData): string {
  const lines: string[] = [];
  lines.push("## Account & Subscription");
  lines.push(`- Plan: ${data.plan}`);
  lines.push(`- Scans Used: ${data.totalScans} / ${data.scanQuota}`);
  lines.push(`- Remaining: ${data.remainingQuota}`);
  if (data.remainingQuota <= 5) {
    lines.push("*Warning: You are running low on scan quota. Consider upgrading your plan.*");
  }
  return lines.join("\n");
}
