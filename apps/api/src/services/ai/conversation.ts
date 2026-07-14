import { AI_CONFIG } from "./config.js";

interface HistoryMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ConversationContext {
  systemPrompt: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  currentMessage: string;
  scanContext?: string;
}

export function buildConversationContext(params: {
  systemPrompt: string;
  history: HistoryMessage[];
  message: string;
  scanContext?: string;
}): ConversationContext {
  const trimmedHistory = params.history.slice(-AI_CONFIG.defaults.maxHistoryMessages);

  const historyMessages = trimmedHistory.map((h) => ({
    role: h.role as "user" | "assistant",
    content: h.content,
  }));

  return {
    systemPrompt: params.systemPrompt,
    history: historyMessages,
    currentMessage: params.message,
    scanContext: params.scanContext,
  };
}

export function toChatMessages(ctx: ConversationContext): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: ctx.systemPrompt },
  ];

  for (const h of ctx.history) {
    messages.push({ role: h.role, content: h.content });
  }

  messages.push({ role: "user", content: ctx.currentMessage });
  return messages;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function truncateToTokenLimit(messages: Array<{ role: string; content: string }>, maxTokens: number): Array<{ role: string; content: string }> {
  const result: Array<{ role: string; content: string }> = [];
  let totalTokens = 0;

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]!;
    const tokens = estimateTokens(msg.content);
    if (totalTokens + tokens > maxTokens) break;
    totalTokens += tokens;
    result.unshift(msg);
  }

  if (result.length > 0 && result[0]!.role !== "system") {
    const systemIdx = messages.findIndex((m) => m.role === "system");
    if (systemIdx >= 0) {
      result.unshift(messages[systemIdx]!);
    }
  }

  return result;
}
