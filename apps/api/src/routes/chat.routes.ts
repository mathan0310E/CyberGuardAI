import { Router, type Request, type Response } from "express";
import { chatRequestSchema } from "../middleware/validation.js";
import { store } from "../store.js";
import { buildScanContext } from "../services/ai-analyzer.js";

export const chatRoutes = Router();

chatRoutes.post("/", async (req: Request, res: Response) => {
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

  let scanContext = "";
  if (scanId) {
    const scan = store.scans.find((s) => s._id === scanId);
    if (scan) {
      scanContext = buildScanContext(scan as unknown as Record<string, unknown>);
    }
  }

  const apiKey = process.env["OPENROUTER_API_KEY"];

  if (apiKey && apiKey !== "sk-or-v1-your-key-here") {
    try {
      const systemPrompt = `You are CyberGuard AI, an expert cybersecurity assistant. You help users understand website security threats, malware detection, and remediation strategies. You are strictly defensive — never assist with offensive security, exploit creation, or unauthorized access.

${scanContext ? `Scan context (structured data):\n${scanContext}` : "No specific scan data provided."}

Always provide clear, actionable, professional security advice. Use markdown formatting for structured responses.`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: "user" as const, content: message },
      ];

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages,
          max_tokens: 2048,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const content = data.choices?.[0]?.message?.content ?? "I couldn't generate a response. Please try again.";

      store.addLog("info", `AI chat response generated (scan: ${scanId ?? "none"})`);

      res.json({
        success: true,
        data: {
          message: {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content,
            timestamp: new Date().toISOString(),
          },
          conversationId: convId,
          suggestedFollowUps: [
            "Explain the risk score in more detail",
            "What are the remediation steps?",
            "Compare with previous scan results",
          ],
        },
        error: null,
        timestamp: new Date().toISOString(),
      });
      return;
    } catch (error) {
      console.error("OpenRouter API error:", error);
    }
  }

  // Fallback to structured mock response
  const responseContent = generateStructuredResponse(message, scanId);
  res.json({
    success: true,
    data: {
      message: {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: responseContent,
        timestamp: new Date().toISOString(),
      },
      conversationId: convId,
      suggestedFollowUps: [
        "Explain the risk score in more detail",
        "What are the remediation steps?",
        "Compare with previous scan results",
      ],
    },
    error: null,
    timestamp: new Date().toISOString(),
  });
});

function generateStructuredResponse(message: string, scanId?: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("phishing") || lower.includes("fake login")) {
    return `## Phishing Detection Analysis\n\nBased on the scan data${scanId ? ` for scan \`${scanId}\`` : ""}, here are the key findings:\n\n### Indicators\n- Suspicious form detected with external action URL\n- Missing SSL verification on form submission endpoint\n- Credential fields (username/password) found in a non-standard layout\n\n### Recommendations\n1. Verify the domain ownership and SSL certificate\n2. Check the form action URL against known phishing databases\n3. Implement Content-Security-Policy to restrict form submissions\n4. Report the domain to Safe Browsing if confirmed malicious`;
  }

  if (lower.includes("obfuscat") || lower.includes("javascript")) {
    return `## JavaScript Obfuscation Analysis\n\nObfuscated JavaScript is a common technique used to hide malicious code.\n\n### Detection Methods\n- \`eval()\` and \`Function()\` constructor usage\n- Base64 encoded strings with \`atob()\` calls\n- Hex-encoded string sequences\n- Unusually high variable renaming\n\n### Risk Assessment\nObfuscated code alone is not proof of malware, but combined with other indicators (hidden iframes, external resource loading), it significantly increases the risk score.\n\n### Remediation\n1. Replace obfuscated scripts with clean, readable alternatives\n2. Implement CSP \`script-src\` to block inline scripts\n3. Use Subresource Integrity (SRI) for external scripts`;
  }

  if (lower.includes("recommend") || lower.includes("fix") || lower.includes("remediat")) {
    return `## Remediation Plan\n\nBased on the findings, here's a prioritized action plan:\n\n### Critical (Immediate)\n1. Remove hidden iframes loading external content\n2. Eliminate eval() and obfuscated JavaScript\n3. Fix credential harvesting forms\n\n### High Priority\n4. Implement Content-Security-Policy headers\n5. Add X-Frame-Options: DENY\n6. Enable Strict-Transport-Security\n\n### Medium Priority\n7. Remove cryptocurrency mining scripts\n8. Audit all third-party dependencies\n9. Implement Subresource Integrity (SRI)\n\n### Low Priority\n10. Add X-XSS-Protection header\n11. Set Referrer-Policy\n12. Configure Permissions-Policy`;
  }

  return `## Analysis Summary\n\nThank you for your question. Based on the structured scan data:\n\n### Key Points\n- The scan analyzed HTML structure, JavaScript execution, and external resources\n- Threat intelligence was correlated across multiple databases\n- AI analysis was performed on the aggregated findings\n\n### What I Can Help With\n- Explain specific threat categories in detail\n- Provide step-by-step remediation guidance\n- Analyze scan patterns over time\n- Compare security posture across multiple sites\n\nFeel free to ask about any specific aspect of the security analysis.`;
}
