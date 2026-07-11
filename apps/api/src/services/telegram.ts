interface TelegramAlert {
  eventType: string;
  severity: "info" | "warning" | "critical";
  userId?: string;
  username?: string;
  email?: string;
  companyName?: string;
  url?: string;
  riskScore?: number;
  eventId: string;
}

function getSeverityEmoji(severity: string): string {
  switch (severity) {
    case "critical": return "🔴";
    case "warning": return "🟡";
    default: return "🔵";
  }
}

function formatAlert(alert: TelegramAlert): string {
  const lines = [
    `${getSeverityEmoji(alert.severity)} *CyberGuard AI Alert*`,
    "",
    `*Event:* ${alert.eventType}`,
    `*Severity:* ${alert.severity.toUpperCase()}`,
    `*Event ID:* \`${alert.eventId}\``,
    `*Time:* ${new Date().toISOString()}`,
  ];

  if (alert.userId) lines.push(`*User ID:* \`${alert.userId}\``);
  if (alert.username) lines.push(`*Username:* ${alert.username}`);
  if (alert.email) lines.push(`*Email:* ${alert.email}`);
  if (alert.companyName) lines.push(`*Company:* ${alert.companyName}`);
  if (alert.url) lines.push(`*URL:* ${alert.url}`);
  if (alert.riskScore !== undefined) lines.push(`*Risk Score:* ${alert.riskScore}/100`);

  return lines.join("\n");
}

export async function sendTelegramAlert(alert: TelegramAlert): Promise<boolean> {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  const chatId = process.env["TELEGRAM_CHAT_ID"];

  if (!token || !chatId) {
    console.log(`[TELEGRAM] Alert suppressed (no config): ${alert.eventType}`);
    return false;
  }

  try {
    const message = formatAlert(alert);
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    if (!res.ok) {
      console.error(`[TELEGRAM] Failed to send alert: HTTP ${res.status}`);
      return false;
    }

    console.log(`[TELEGRAM] Alert sent: ${alert.eventType} (${alert.severity})`);
    return true;
  } catch (error) {
    console.error(`[TELEGRAM] Error sending alert:`, error);
    return false;
  }
}

export function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
