import type { ContextProvider, ContextOptions, CollectedData, ConversationMemory } from "./types.js";

const memoryStore = new Map<string, ConversationMemory>();
const MEMORY_TTL = 30 * 60 * 1000;

export function getConversationMemory(conversationId: string, userId: string): ConversationMemory {
  const key = `${userId}:${conversationId}`;
  let mem = memoryStore.get(key);
  if (!mem) {
    mem = {
      conversationId,
      userId,
      history: [],
      explanationLevel: "detailed",
      lastActivity: Date.now(),
    };
    memoryStore.set(key, mem);
  }
  return mem;
}

export function updateConversationMemory(
  conversationId: string,
  userId: string,
  message: { role: "user" | "assistant"; content: string; timestamp: string }
): void {
  const mem = getConversationMemory(conversationId, userId);
  mem.history.push(message);
  if (mem.history.length > 20) {
    mem.history = mem.history.slice(-20);
  }
  mem.lastActivity = Date.now();

  const lower = message.content.toLowerCase();
  if (/\b(explain|simple|basic|eli5|beginner)\b/i.test(lower)) {
    mem.explanationLevel = "basic";
  } else if (/\b(technical|detailed|advanced|deep|architecture|implementation)\b/i.test(lower)) {
    mem.explanationLevel = "technical";
  }
}

export function setConversationFocus(
  conversationId: string,
  userId: string,
  focus: { scanId?: string; fileUrl?: string }
): void {
  const mem = getConversationMemory(conversationId, userId);
  if (focus.scanId !== undefined) mem.currentScanId = focus.scanId;
  if (focus.fileUrl !== undefined) mem.currentFileUrl = focus.fileUrl;
  mem.lastActivity = Date.now();
}

export function cleanupExpiredMemory(): void {
  const now = Date.now();
  for (const [key, mem] of memoryStore.entries()) {
    if (now - mem.lastActivity > MEMORY_TTL) {
      memoryStore.delete(key);
    }
  }
}

setInterval(cleanupExpiredMemory, 5 * 60 * 1000);

export const memoryContextProvider: ContextProvider = {
  async collect(userId: string, options?: ContextOptions): Promise<CollectedData> {
    const conversationId = (options as { conversationId?: string })?.conversationId ?? "default";
    const mem = getConversationMemory(conversationId, userId);

    const lines: string[] = [];
    lines.push("## Conversation Memory");
    lines.push(`- Explanation Level: ${mem.explanationLevel}`);
    if (mem.currentScanId) lines.push(`- Current Scan: ${mem.currentScanId}`);
    if (mem.currentFileUrl) lines.push(`- Current File: ${mem.currentFileUrl}`);
    if (mem.history.length > 0) {
      lines.push(`- Conversation Length: ${mem.history.length} messages`);
      const lastFew = mem.history.slice(-4);
      lines.push("- Recent Exchange:");
      for (const h of lastFew) {
        const prefix = h.role === "user" ? "User" : "AI";
        lines.push(`  - ${prefix}: ${h.content.substring(0, 100)}`);
      }
    }

    return { available: true, summary: lines.join("\n"), details: mem as unknown as Record<string, unknown> };
  },

  format(data: CollectedData): string {
    return data.summary;
  },

  shouldInject(_message: string): boolean {
    return true;
  },
};
