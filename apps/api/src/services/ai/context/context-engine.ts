import { dashboardContextProvider } from "./dashboard-context.js";
import { websiteContextProvider } from "./website-context.js";
import { fileContextProvider } from "./file-context.js";
import { monitoringContextProvider } from "./monitoring-context.js";
import { threatContextProvider } from "./threat-context.js";
import { reportContextProvider } from "./report-context.js";
import { businessContextProvider } from "./business-context.js";
import { notificationContextProvider } from "./notification-context.js";
import { memoryContextProvider, updateConversationMemory, setConversationFocus } from "./memory-context.js";
import type { ContextType, AIMessageIntent } from "./types.js";

const CONTEXT_PRIORITY: Record<AIMessageIntent, ContextType[]> = {
  greeting: [],
  dashboard_query: ["dashboard", "website_scans", "reports"],
  scan_analysis: ["website_scans", "threat_intel", "dashboard"],
  file_analysis: ["file_scans", "threat_intel"],
  monitoring_check: ["monitoring", "dashboard"],
  threat_intel_query: ["threat_intel", "website_scans"],
  report_query: ["reports", "dashboard"],
  business_query: ["business"],
  notification_query: ["notifications", "dashboard"],
  code_review: [],
  general_security: [],
};

const PROVIDERS: Record<ContextType, { collect: (userId: string, options?: Record<string, unknown>) => Promise<{ available: boolean; summary: string }>; shouldInject: (msg: string) => boolean }> = {
  dashboard: dashboardContextProvider,
  website_scans: websiteContextProvider,
  file_scans: fileContextProvider,
  monitoring: monitoringContextProvider,
  threat_intel: threatContextProvider,
  reports: reportContextProvider,
  business: businessContextProvider,
  notifications: notificationContextProvider,
  memory: memoryContextProvider,
};

export function detectIntent(message: string): AIMessageIntent {
  const lower = message.toLowerCase().trim();

  if (/^(hi|hello|hey|howdy|good\s*(morning|afternoon|evening)|what'?s\s*up|sup|yo|hola|greetings|how\s*are\s*you|what's\s*new)\b/i.test(lower)) {
    return "greeting";
  }

  if (/\b(today'?s?\s*(scan|report|dashboard|summary|analysis))/i.test(lower)) return "dashboard_query";
  if (/\b(my\s*(dashboard|scans?|reports?|statistics|stats))/i.test(lower)) return "dashboard_query";
  if (/\b(how\s*many\s*scans?)/i.test(lower)) return "dashboard_query";
  if (/\b(risk\s*score)/i.test(lower)) return "dashboard_query";
  if (/\b(dashboard)/i.test(lower)) return "dashboard_query";
  if (/\b(summarize\s*(today|scan|recent|my))/i.test(lower)) return "dashboard_query";
  if (/\b(overview|status\s*report)/i.test(lower)) return "dashboard_query";

  if (/\b(scan|website|url|site|domain)\b.*\b(result|report|analysis|finding|detail)/i.test(lower)) return "scan_analysis";
  if (/\b(explain|analyze|show|what|tell\s*me|review|interpret|break\s*down)\b.*\b(this|my|the|that|latest|last|recent)\b.*\b(scan|result|analysis|finding)/i.test(lower)) return "scan_analysis";
  if (/\b(compare\s*(scan|results?|websites?))/i.test(lower)) return "scan_analysis";
  if (/\b(highest\s*risk|lowest\s*risk|most\s*vulnerable)/i.test(lower)) return "scan_analysis";
  if (/\b(latest\s*(scan|result))/i.test(lower)) return "scan_analysis";

  if (/\b(file|exe|malware|virus|hash|sha256|yara|entropy|binary|detect|flag|quarantine|ioc|mitre)/i.test(lower)) return "file_analysis";

  if (/\b(monitor|change|update|since|yesterday|expir|certificate|dns|reputation|cve)/i.test(lower)) return "monitoring_check";

  if (/\b(threat|intel|virustotal|urlscan|abuseipdb|owasp|phishing|ransomware|trojan|worm|botnet|apt)/i.test(lower)) return "threat_intel_query";

  if (/\b(report|pdf|executive|recommendation|compliance|trend|export)/i.test(lower)) return "report_query";

  if (/\b(subscription|plan|quota|limit|remaining|billing|payment|api\s*key|team|organization|enterprise|premium|upgrade)/i.test(lower)) return "business_query";

  if (/\b(alert|notification|warning|error|event|log|incident|blocked|failed|suspicious)/i.test(lower)) return "notification_query";

  if (/\b(code|function|class|implement|refactor|debug|fix\s*bug|review\s*code|code\s*review|programming|syntax|api|endpoint|algorithm)\b/i.test(lower)) {
    return "code_review";
  }

  return "general_security";
}

export async function buildAIContext(
  userId: string,
  conversationId: string,
  currentMessage: string,
  scanId?: string
): Promise<{ systemContext: string; intent: AIMessageIntent }> {
  const intent = detectIntent(currentMessage);
  const priorities = CONTEXT_PRIORITY[intent];

  const contextParts: string[] = [];

  if (scanId) {
    const { store } = await import("../../../lib/store.js");
    const scan = await store.getScanById(scanId);
    if (scan) {
      const { buildScanContext } = await import("../../../engines/heuristic/risk-scorer.js");
      contextParts.push("## Specific Scan Context\n" + buildScanContext(scan as unknown as Record<string, unknown>));
      setConversationFocus(conversationId, userId, { scanId });
    }
  }

  for (const contextType of priorities) {
    if (contextType === "memory") continue;
    const provider = PROVIDERS[contextType];
    if (!provider) continue;
    if (!provider.shouldInject(currentMessage)) continue;

    try {
      const result = await provider.collect(userId, { conversationId } as Record<string, unknown>);
      if (result.available) {
        contextParts.push(result.summary);
      }
    } catch {
      // Skip failed context providers silently
    }
  }

  try {
    const memResult = await memoryContextProvider.collect(userId, { conversationId } as Record<string, unknown>);
    if (memResult.available) {
      contextParts.push(memResult.summary);
    }
  } catch {
    // Skip memory errors
  }

  updateConversationMemory(conversationId, userId, {
    role: "user",
    content: currentMessage,
    timestamp: new Date().toISOString(),
  });

  const systemContext = contextParts.length > 0
    ? contextParts.join("\n\n---\n\n")
    : "";

  return { systemContext, intent };
}

export function recordAIResponse(conversationId: string, userId: string, response: string): void {
  updateConversationMemory(conversationId, userId, {
    role: "assistant",
    content: response,
    timestamp: new Date().toISOString(),
  });
}
