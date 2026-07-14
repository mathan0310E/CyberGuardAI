import { Router, type Request, type Response } from "express";
import { chatRequestSchema } from "../../middleware/validation.js";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/async-handler.js";
import { store } from "../../lib/store.js";
import { routeChatRequest, getAIHealthReport } from "../../services/ai/index.js";
import { detectIntent } from "../../services/ai/prompt-builder.js";
import { logger } from "../../utils/logger.js";

export const chatRoutes = Router();

chatRoutes.post("/", requireAuth, asyncHandler(async (req: Request, res: Response) => {
  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      data: null,
      error: parsed.error.issues[0]?.message ?? "Invalid request",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const { message, scanId, conversationId, history } = parsed.data;
  const convId = conversationId ?? `conv-${Date.now()}`;

  const intent = detectIntent(message);
  logger.info("Chat request received", { intent, scanId: scanId ?? "none", conversationId: convId });

  try {
    const result = await routeChatRequest({
      message,
      history,
      scanContext: undefined,
      hasScanData: false,
      userId: (req as { userId?: string }).userId,
      conversationId: convId,
      scanId,
    });

    await store.addLog("info", `AI chat: model=${result.model} intent=${intent} ${result.responseMs}ms`);

    res.json({
      success: true,
      data: {
        message: {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: result.content,
          timestamp: new Date().toISOString(),
        },
        conversationId: convId,
        suggestedFollowUps: result.suggestedFollowUps,
      },
      error: null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("AI chat failed:", error);

    const fallbackContent = generateFallbackResponse(message, !!scanId);

    res.json({
      success: true,
      data: {
        message: {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: fallbackContent,
          timestamp: new Date().toISOString(),
        },
        conversationId: convId,
        suggestedFollowUps: [
          "What is phishing?",
          "How do I prevent XSS?",
          "Explain SQL injection",
        ],
      },
      error: null,
      timestamp: new Date().toISOString(),
    });
  }
}));

chatRoutes.get("/health", requireAuth, asyncHandler(async (_req: Request, res: Response) => {
  const report = getAIHealthReport();
  res.json({
    success: true,
    data: report,
    error: null,
    timestamp: new Date().toISOString(),
  });
}));

function generateFallbackResponse(message: string, hasScanData: boolean): string {
  const intent = detectIntent(message);

  if (intent === "greeting") {
    return `Hello! I'm **CyberGuard AI Copilot**, your cybersecurity assistant.\n\nI can help you with:\n\n- **Website Security** — analyze sites for vulnerabilities and threats\n- **Malware Detection** — understand different types of malware\n- **Vulnerability Assessment** — SQL injection, XSS, CSRF, and more\n- **Threat Intelligence** — CVEs, threat actors, and attack patterns\n- **Security Best Practices** — hardening, headers, CSP, and compliance\n\nHow can I help you today?`;
  }

  if ((intent === "scan_request" || intent === "dashboard_query") && !hasScanData) {
    return `I'd be happy to help analyze scan data, but I don't see any scan results in our current conversation.\n\nTo get started:\n1. Go to the **URL Scanner** and run a scan\n2. Come back and ask me about the results\n3. Or pass a scan ID using \`?scan=<id>\` in the URL\n\nWould you like me to explain a security concept while you wait?`;
  }

  if ((intent === "scan_request" || intent === "dashboard_query") && hasScanData) {
    return `I have the scan data available, but my AI models are temporarily unreachable. Please try again in a moment.\n\nIn the meantime, you can ask me about:\n- The risk score and what it means\n- Specific threat indicators found\n- Remediation steps for identified issues`;
  }

  return `I'm experiencing temporary connectivity issues with my AI models. I'll be back online shortly.\n\nIn the meantime, I can share some general guidance:\n- **Phishing** — always verify sender addresses and hover over links before clicking\n- **XSS** — implement Content-Security-Policy headers and encode all output\n- **SQL Injection** — use parameterized queries and input validation\n- **Security Headers** — add CSP, X-Frame-Options, HSTS, and X-Content-Type-Options\n\nPlease try your question again in a moment!`;
}
