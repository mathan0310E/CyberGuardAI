import { store } from "../../../lib/store.js";
import type { ContextProvider, ContextOptions, CollectedData, NotificationData } from "./types.js";

export const notificationContextProvider: ContextProvider = {
  async collect(userId: string, _options?: ContextOptions): Promise<CollectedData> {
    const allLogs = await store.getAllLogs();
    const userLogs = allLogs
      .filter((l) => l.userId === userId || !l.userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    const recentAlerts = userLogs
      .filter((l) => l.level === "warn" || l.level === "error")
      .map((l) => ({
        type: l.level,
        message: l.message,
        timestamp: new Date(l.timestamp).toISOString(),
      }));

    const data: NotificationData = {
      recentAlerts,
    };

    return { available: data.recentAlerts.length > 0, summary: formatNotificationData(data), details: data as unknown as Record<string, unknown> };
  },

  format(data: CollectedData): string {
    return data.summary;
  },

  shouldInject(message: string): boolean {
    const lower = message.toLowerCase();
    return /\b(alert|notification|warning|error|event|log|incident|blocked|failed|suspicious)/i.test(lower);
  },
};

function formatNotificationData(data: NotificationData): string {
  if (data.recentAlerts.length === 0) {
    return "## Recent Alerts\nNo recent alerts.";
  }

  const lines: string[] = [];
  lines.push(`## Recent Alerts (${data.recentAlerts.length})`);
  lines.push("");

  for (const alert of data.recentAlerts.slice(0, 10)) {
    const time = new Date(alert.timestamp).toLocaleString();
    const icon = alert.type === "error" ? "!" : "!";
    lines.push(`- [${icon}] ${alert.message} (${time})`);
  }

  return lines.join("\n");
}
