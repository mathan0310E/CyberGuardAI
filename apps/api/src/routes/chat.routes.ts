import { Router, type Request, type Response } from "express";
import { chatRequestSchema } from "../middleware/validation.js";

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

  const { message, scanId, conversationId } = parsed.data;

  // In production, this calls OpenRouter with structured scan data + user message
  const responseContent = generateMockAIResponse(message, scanId);
  const convId = conversationId ?? `conv-${Date.now()}`;

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

function generateMockAIResponse(message: string, scanId?: string): string {
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
