import { chatCompletion, getModelHealthReport, getBlacklistedModels, getCachedModels } from "./model-manager.js";
import { buildSystemPrompt, getSuggestedFollowUps } from "./prompt-builder.js";
import { buildConversationContext, toChatMessages } from "./conversation.js";
import { fitMessagesToLimit } from "./token-counter.js";
import { buildAIContext, recordAIResponse } from "./context/context-engine.js";
import type { ConversationMemory } from "./context/types.js";

interface ChatRequest {
  message: string;
  history: Array<{ id: string; role: "user" | "assistant"; content: string; timestamp: string }>;
  scanContext?: string;
  hasScanData: boolean;
  userId?: string;
  conversationId?: string;
  scanId?: string;
}

interface ChatResult {
  content: string;
  model: string;
  responseMs: number;
  suggestedFollowUps: string[];
  memory: ConversationMemory;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export async function routeChatRequest(request: ChatRequest): Promise<ChatResult> {
  const conversationId = request.conversationId ?? `conv-${Date.now()}`;
  const userId = request.userId ?? "anonymous";

  let systemContext = request.scanContext ?? "";
  let intent: string = "general_security";

  if (request.userId) {
    try {
      const ctx = await buildAIContext(
        request.userId,
        conversationId,
        request.message,
        request.scanId,
      );
      systemContext = ctx.systemContext || systemContext;
      intent = ctx.intent;
    } catch {
      // Fall back to basic context
    }
  }

  const hasContext = systemContext.length > 0;

  const systemPrompt = buildSystemPrompt({
    scanContext: hasContext ? systemContext : undefined,
    hasScanData: hasContext,
    hasDashboardData: hasContext,
  });

  const ctx = buildConversationContext({
    systemPrompt,
    history: request.history,
    message: request.message,
    scanContext: hasContext ? systemContext : undefined,
  });

  let messages = toChatMessages(ctx);
  messages = fitMessagesToLimit(messages, 4000) as Array<{ role: "system" | "user" | "assistant"; content: string }>;

  const response = await chatCompletion(messages, intent === "code_review" ? "coding" : "reasoning");

  if (request.userId) {
    recordAIResponse(conversationId, request.userId, response.content);
  }

  const memory: ConversationMemory = {
    conversationId,
    userId,
    history: request.history.slice(-5).map((h) => ({
      role: h.role,
      content: h.content,
      timestamp: h.timestamp,
    })),
    currentScanId: request.scanId,
    explanationLevel: "detailed",
    lastActivity: Date.now(),
  };

  return {
    content: response.content,
    model: response.model,
    responseMs: response.responseMs,
    suggestedFollowUps: getSuggestedFollowUps(request.message, request.hasScanData, hasContext),
    memory,
    usage: response.usage,
  };
}

export function getAIHealthReport(): {
  models: Record<string, unknown>;
  activeModels: string[];
  cachedModels: Array<{ id: string; provider: string; tier: string; capability: string }>;
  blacklistedModels: string[];
} {
  const health = getModelHealthReport();
  const activeModels = Object.entries(health)
    .filter(([_, h]) => (h as { totalRequests: number }).totalRequests > 0)
    .map(([model]) => model);

  const cachedModels = getCachedModels().map((m) => ({
    id: m.id,
    provider: m.provider,
    tier: m.tier,
    capability: m.capability,
  }));

  return {
    models: health,
    activeModels,
    cachedModels,
    blacklistedModels: getBlacklistedModels(),
  };
}
