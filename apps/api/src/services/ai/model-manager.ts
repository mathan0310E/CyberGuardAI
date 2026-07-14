import { AI_CONFIG, type ModelTier, type FreeModel } from "./config.js";
import { logger } from "../../utils/logger.js";

interface ModelHealth {
  failures: number;
  lastFailure: number;
  totalRequests: number;
  totalFailures: number;
  avgResponseMs: number;
  lastUsed: number;
  blacklisted: boolean;
  blacklistReason: string;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatResponse {
  content: string;
  model: string;
  responseMs: number;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: { prompt: string; completion: string };
  architecture?: { modality?: string; output_modalities?: string[] };
  top_provider?: { max_completion_tokens?: number };
}

const healthMap = new Map<string, ModelHealth>();
const modelCache = new Map<string, FreeModel>();
const permanentBlacklist = new Set<string>();
let refreshTimer: ReturnType<typeof setInterval> | null = null;
let initialized = false;

function getHealth(model: string): ModelHealth {
  let h = healthMap.get(model);
  if (!h) {
    h = {
      failures: 0,
      lastFailure: 0,
      totalRequests: 0,
      totalFailures: 0,
      avgResponseMs: 0,
      lastUsed: 0,
      blacklisted: false,
      blacklistReason: "",
    };
    healthMap.set(model, h);
  }
  return h;
}

function isModelBlacklisted(modelId: string): boolean {
  if (permanentBlacklist.has(modelId)) return true;
  const h = healthMap.get(modelId);
  return h?.blacklisted === true;
}

function blacklistModel(modelId: string, reason: string): void {
  permanentBlacklist.add(modelId);
  const h = getHealth(modelId);
  h.blacklisted = true;
  h.blacklistReason = reason;
  modelCache.delete(modelId);
  logger.warn(`[BLACKLIST] Model ${modelId} blacklisted: ${reason}`);
}

function isModelHealthy(modelId: string): boolean {
  if (isModelBlacklisted(modelId)) return false;
  const h = getHealth(modelId);
  if (h.failures >= AI_CONFIG.health.maxFailuresBeforeCooldown) {
    const elapsed = Date.now() - h.lastFailure;
    if (elapsed < AI_CONFIG.health.cooldownMs) return false;
    h.failures = 0;
  }
  return true;
}

function recordSuccess(modelId: string, responseMs: number): void {
  const h = getHealth(modelId);
  h.failures = 0;
  h.totalRequests++;
  h.avgResponseMs = h.avgResponseMs
    ? (h.avgResponseMs * (h.totalRequests - 1) + responseMs) / h.totalRequests
    : responseMs;
  h.lastUsed = Date.now();
}

function recordFailure(modelId: string): void {
  const h = getHealth(modelId);
  h.failures++;
  h.totalRequests++;
  h.totalFailures++;
  h.lastFailure = Date.now();
}

function matchesPatterns(text: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

function extractProvider(modelId: string): string {
  const slash = modelId.indexOf("/");
  return slash > 0 ? modelId.substring(0, slash) : "unknown";
}

function classifyTier(model: { id: string; name: string; contextLength: number }): ModelTier {
  const text = `${model.id} ${model.name}`.toLowerCase();

  if (/\b(code|coder|coding)\b/.test(text)) return "coding";
  if (/\b(reason|think)\b/.test(text)) return "reasoning";
  if (model.contextLength >= 32_000) return "reasoning";

  return "general";
}

function classifyCapability(model: { id: string; name: string }): "chat" | "reasoning" | "coding" {
  const text = `${model.id} ${model.name}`.toLowerCase();
  if (/\b(code|coder|coding)\b/.test(text)) return "coding";
  if (/\b(reason|think)\b/.test(text)) return "reasoning";
  return "chat";
}

function isConversationalModel(m: OpenRouterModel): boolean {
  const nameId = `${m.id} ${m.name}`;

  if (AI_CONFIG.filtering.bannedModelIds.has(m.id)) {
    return false;
  }

  if (matchesPatterns(nameId, AI_CONFIG.filtering.namePatterns)) {
    return false;
  }

  if (matchesPatterns(m.id, AI_CONFIG.filtering.idPatterns)) {
    return false;
  }

  const modality = m.architecture?.modality ?? "";
  const inputModality = modality.split("->")[0]?.trim() ?? "";
  if (!inputModality.includes("text")) {
    return false;
  }

  const outputModalities = m.architecture?.output_modalities ?? [];
  if (outputModalities.length > 0) {
    const hasOnlyText = outputModalities.every((om) =>
      (AI_CONFIG.filtering.allowedOutputModalities as readonly string[]).includes(om)
    );
    if (!hasOnlyText) return false;
  }

  return true;
}

export async function fetchModels(): Promise<FreeModel[]> {
  const apiKey = AI_CONFIG.openrouter.apiKey;
  if (!apiKey || apiKey === "sk-or-v1-your-key-here") {
    logger.warn("OpenRouter API key not configured, cannot fetch models");
    return [];
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_CONFIG.discovery.requestTimeoutMs);

  try {
    const response = await fetch(AI_CONFIG.openrouter.modelsUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) {
      logger.error(`OpenRouter models API returned ${response.status}`);
      return [];
    }

    const data = await response.json() as { data: OpenRouterModel[] };
    const allModels = data.data ?? [];
    let filtered = 0;
    const freeModels: FreeModel[] = [];

    for (const m of allModels) {
      if (m.pricing.prompt !== "0" || m.pricing.completion !== "0") continue;

      if (!isConversationalModel(m)) {
        filtered++;
        continue;
      }

      const tier = classifyTier({
        id: m.id,
        name: m.name,
        contextLength: m.context_length,
      });

      const capability = classifyCapability({
        id: m.id,
        name: m.name,
      });

      freeModels.push({
        id: m.id,
        name: m.name,
        provider: extractProvider(m.id),
        contextLength: m.context_length,
        maxOutputTokens: m.top_provider?.max_completion_tokens ?? 4096,
        tier,
        capability,
      });
    }

    freeModels.sort((a, b) => {
      const capOrder: Record<string, number> = { chat: 0, reasoning: 1, coding: 2 };
      const capDiff = (capOrder[a.capability] ?? 3) - (capOrder[b.capability] ?? 3);
      if (capDiff !== 0) return capDiff;
      return b.contextLength - a.contextLength;
    });

    logger.info(`Discovered ${freeModels.length} free conversational models (filtered ${filtered} non-conversational)`);
    for (const m of freeModels) {
      logger.info(`  [WHITELIST] ${m.id} | provider=${m.provider} | tier=${m.tier} | capability=${m.capability} | context=${m.contextLength}`);
    }

    return freeModels;
  } catch (error) {
    clearTimeout(timer);
    if (error instanceof DOMException && error.name === "AbortError") {
      logger.error("OpenRouter models API request timed out");
    } else {
      logger.error("Failed to fetch OpenRouter models:", error);
    }
    return [];
  }
}

async function runHealthCheck(modelId: string, apiKey: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(AI_CONFIG.openrouter.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: AI_CONFIG.healthCheck.prompt }],
        temperature: 0.3,
        max_tokens: 64,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) {
      logger.warn(`[HEALTH CHECK] ${modelId} returned HTTP ${response.status}`);
      return false;
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content ?? "";

    if (matchesPatterns(content, AI_CONFIG.healthCheck.blacklistPatterns)) {
      logger.warn(`[HEALTH CHECK] ${modelId} FAILED — output contains blacklisted patterns: "${content.substring(0, 120)}"`);
      return false;
    }

    if (content.trim().length === 0) {
      logger.warn(`[HEALTH CHECK] ${modelId} FAILED — empty response`);
      return false;
    }

    const wordCount = content.trim().split(/\s+/).length;
    if (wordCount > 50) {
      logger.warn(`[HEALTH CHECK] ${modelId} FAILED — response too long (${wordCount} words): "${content.substring(0, 120)}"`);
      return false;
    }

    logger.info(`[HEALTH CHECK] ${modelId} PASSED — "${content.trim().substring(0, 80)}"`);
    return true;
  } catch (error) {
    clearTimeout(timer);
    logger.warn(`[HEALTH CHECK] ${modelId} FAILED — ${error instanceof Error ? error.message : "unknown error"}`);
    return false;
  }
}

async function refreshCache(): Promise<void> {
  const models = await fetchModels();
  if (models.length === 0) {
    logger.warn("No free models discovered, keeping existing cache");
    return;
  }

  modelCache.clear();
  for (const m of models) {
    modelCache.set(m.id, m);
  }

  const tiers: Record<ModelTier, number> = { greeting: 0, reasoning: 0, coding: 0, general: 0 };
  for (const m of modelCache.values()) {
    tiers[m.tier]++;
  }
  logger.info("Model cache refreshed", tiers);
}

export async function initializeModelCache(): Promise<void> {
  if (initialized) return;
  initialized = true;

  await refreshCache();

  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(() => {
    refreshCache().catch((err) => logger.error("Model cache refresh failed:", err));
  }, AI_CONFIG.discovery.refreshIntervalMs);
}

export function selectModel(tier: ModelTier, usedModels: Set<string>): FreeModel | null {
  const candidates: FreeModel[] = [];
  for (const m of modelCache.values()) {
    if (m.tier === tier && !usedModels.has(m.id) && isModelHealthy(m.id)) {
      candidates.push(m);
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => {
      const capOrder: Record<string, number> = { chat: 0, reasoning: 1, coding: 2 };
      const capDiff = (capOrder[a.capability] ?? 3) - (capOrder[b.capability] ?? 3);
      if (capDiff !== 0) return capDiff;
      return b.contextLength - a.contextLength;
    });
    return candidates[0] ?? null;
  }

  for (const m of modelCache.values()) {
    if (!usedModels.has(m.id) && isModelHealthy(m.id)) {
      return m;
    }
  }

  return null;
}

export function removeModel(modelId: string): void {
  modelCache.delete(modelId);
  logger.warn(`Removed model ${modelId} from cache`);
}

export async function chatCompletion(
  messages: ChatMessage[],
  tier: ModelTier,
  options?: { temperature?: number; maxTokens?: number }
): Promise<ChatResponse> {
  const apiKey = AI_CONFIG.openrouter.apiKey;
  if (!apiKey || apiKey === "sk-or-v1-your-key-here") {
    throw new Error("OpenRouter API key not configured");
  }

  if (!initialized || modelCache.size === 0) {
    await initializeModelCache();
  }

  const temperature = options?.temperature ?? AI_CONFIG.defaults.temperature;
  const maxTokens = options?.maxTokens ?? AI_CONFIG.defaults.maxTokens;
  const usedModels = new Set<string>();
  const maxAttempts = AI_CONFIG.defaults.maxRetries + 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const model = selectModel(tier, usedModels);
    if (!model) {
      logger.warn("No available free models for tier", { tier, usedModels: [...usedModels] });
      break;
    }
    usedModels.add(model.id);

    if (attempt === 1) {
      const healthPassed = await runHealthCheck(model.id, apiKey);
      if (!healthPassed) {
        blacklistModel(model.id, "Failed health check — non-conversational output");
        continue;
      }
    }

    const startMs = Date.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), AI_CONFIG.defaults.timeoutMs);

      const response = await fetch(AI_CONFIG.openrouter.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model: model.id, messages, temperature, max_tokens: maxTokens }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        const status = response.status;
        if (status === 404) {
          removeModel(model.id);
          logger.warn(`[SELECT] ${model.id} | tier=${tier} | capability=${model.capability} | provider=${model.provider} | healthCheck=PASSED | result=404_REMOVED`);
          if (attempt < maxAttempts) continue;
        }
        if (status === 429 || status === 503 || status === 500) {
          recordFailure(model.id);
          logger.warn(`[SELECT] ${model.id} | tier=${tier} | capability=${model.capability} | provider=${model.provider} | result=HTTP_${status}`);
          if (attempt < maxAttempts) {
            const delay = AI_CONFIG.defaults.retryDelayMs * Math.pow(2, attempt - 1);
            await sleep(delay);
            continue;
          }
        }
        throw new Error(`OpenRouter API error: ${status}`);
      }

      const data = await response.json() as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
      };

      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from model");

      if (matchesPatterns(content, AI_CONFIG.healthCheck.blacklistPatterns)) {
        blacklistModel(model.id, "Runtime output contains blacklisted patterns");
        if (attempt < maxAttempts) continue;
        throw new Error("Model produced invalid output");
      }

      const responseMs = Date.now() - startMs;
      recordSuccess(model.id, responseMs);

      logger.info(`[SELECT] ${model.id} | tier=${tier} | capability=${model.capability} | provider=${model.provider} | healthCheck=PASSED | result=SUCCESS | ${responseMs}ms`);

      return {
        content,
        model: model.id,
        responseMs,
        usage: data.usage
          ? { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens }
          : undefined,
      };
    } catch (error) {
      recordFailure(model.id);
      const isAbort = error instanceof DOMException && error.name === "AbortError";
      logger.warn(`[SELECT] ${model.id} | tier=${tier} | capability=${model.capability} | provider=${model.provider} | result=ERROR | ${isAbort ? "timeout" : (error instanceof Error ? error.message : "unknown")}`);
      if (attempt < maxAttempts) {
        const delay = AI_CONFIG.defaults.retryDelayMs * Math.pow(2, attempt - 1);
        await sleep(delay);
        continue;
      }
    }
  }

  throw new Error("All free AI models are temporarily unavailable. Please try again in a moment.");
}

export function getModelHealthReport(): Record<string, ModelHealth> {
  const report: Record<string, ModelHealth> = {};
  for (const [model, health] of healthMap) {
    report[model] = { ...health };
  }
  return report;
}

export function getCachedModels(): FreeModel[] {
  return [...modelCache.values()];
}

export function getBlacklistedModels(): string[] {
  return [...permanentBlacklist];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
