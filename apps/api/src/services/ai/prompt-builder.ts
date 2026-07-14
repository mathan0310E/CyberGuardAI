import type { ModelTier } from "./config.js";

interface PromptContext {
  scanContext?: string;
  hasScanData: boolean;
  dashboardContext?: string;
  hasDashboardData?: boolean;
}

const IDENTITY = `You are CyberGuard AI Copilot — an expert cybersecurity assistant built to help users understand and defend against digital threats.

## Identity
- You are knowledgeable, professional, and approachable.
- You explain complex security concepts in clear, plain language.
- You answer like a helpful expert — conversational but precise.
- You use markdown formatting: headings, bullet points, code blocks, and tables when useful.

## Capabilities
- Website security analysis and hardening advice
- Malware detection and explanation
- Phishing, ransomware, and social engineering awareness
- Vulnerability assessment (SQL injection, XSS, CSRF, etc.)
- Threat intelligence interpretation
- CVE analysis and remediation
- OWASP Top 10 guidance
- MITRE ATT&CK framework mapping
- Security headers and CSP configuration
- Risk score interpretation
- Dashboard statistics analysis
- Scan history summarization
- Threat trend analysis

## Behavior Rules
- If the user greets you, respond warmly and briefly. Do NOT produce a scan analysis.
- If the user asks a general cybersecurity question, answer it directly. Do NOT produce a scan analysis.
- If scan data is provided, use it for specific, actionable insights. Reference actual values.
- If dashboard data is provided, use it to answer questions about scans, threats, risk scores, and statistics. Reference actual numbers.
- If the user asks about "this scan" but no scan data exists, ask them to run a scan first.
- If the user asks about their dashboard or scans but no dashboard data is available, inform them they have no scans yet.
- Never fabricate scan results or dashboard statistics.
- Never produce a generic "Analysis Summary" unless scan data exists AND the user asks for it.
- Always use the most recent data available when answering questions about scans or dashboard.
- When comparing scans, reference specific risk scores and indicators.
- If you don't know something, say so honestly.

## Response Style
- Be concise but thorough.
- Use structured formatting for complex answers.
- Include actionable recommendations when relevant.
- For code questions, provide code examples in fenced code blocks.
- For dashboard questions, use tables and bullet points to present data clearly.`;

const SCAN_CONTEXT_TEMPLATE = `\n\n## Active Scan Context\nThe user has a scan in context. Here is the structured data:\n\`\`\`json\n{SCAN_DATA}\n\`\`\`\nUse this data to answer the user's questions. Reference specific values (risk score, indicators, technologies) when relevant.`;

const DASHBOARD_CONTEXT_TEMPLATE = `\n\n## User's Dashboard Data\nThe user has dashboard data available. Here is the current state:\n\n{DASHBOARD_DATA}\n\nUse this data to answer the user's questions. Reference specific numbers, scan results, and threat information when relevant. If the user asks about today's scans, use the "Today's Scans" section. If they ask about history, use the "Recent Scan History" section. If they ask about statistics, use the "Current Dashboard Statistics" section.`;

export function buildSystemPrompt(context: PromptContext): string {
  let prompt = IDENTITY;
  if (context.hasScanData && context.scanContext) {
    prompt += SCAN_CONTEXT_TEMPLATE.replace("{SCAN_DATA}", context.scanContext);
  }
  if (context.hasDashboardData && context.dashboardContext) {
    prompt += DASHBOARD_CONTEXT_TEMPLATE.replace("{DASHBOARD_DATA}", context.dashboardContext);
  }
  return prompt;
}

export function detectIntent(message: string): "greeting" | "scan_request" | "dashboard_query" | "code_review" | "general_security" {
  const lower = message.toLowerCase().trim();

  if (/^(hi|hello|hey|howdy|good\s*(morning|afternoon|evening)|what'?s\s*up|sup|yo|hola|greetings|how\s*are\s*you|what's\s*new)\b/i.test(lower)) {
    return "greeting";
  }

  if (/\b(today'?s?\s*(scan|report|dashboard|summary|analysis))/i.test(lower)) return "dashboard_query";
  if (/\b(my\s*(dashboard|scans?|reports?|statistics|stats))/i.test(lower)) return "dashboard_query";
  if (/\b(latest\s*(scan|report|result|analysis))/i.test(lower)) return "dashboard_query";
  if (/\b(recent\s*(scans?|reports?|history|activity))/i.test(lower)) return "dashboard_query";
  if (/\b(how\s*many\s*scans?)/i.test(lower)) return "dashboard_query";
  if (/\b(risk\s*score)/i.test(lower)) return "dashboard_query";
  if (/\b(threats?\s*detect)/i.test(lower)) return "dashboard_query";
  if (/\b(clean\s*sites?)/i.test(lower)) return "dashboard_query";
  if (/\b(scan\s*(history|report|summary|count|total))/i.test(lower)) return "dashboard_query";
  if (/\b(dashboard)/i.test(lower)) return "dashboard_query";
  if (/\b(summarize\s*(today|scan|recent|my))/i.test(lower)) return "dashboard_query";
  if (/\b(what\s*(did|have)\s*(i|we)\s*scan)/i.test(lower)) return "dashboard_query";
  if (/\b(overview|status\s*report)/i.test(lower)) return "dashboard_query";
  if (/\b(compare\s*(scan|results?|websites?))/i.test(lower)) return "dashboard_query";
  if (/\b(highest\s*risk)/i.test(lower)) return "dashboard_query";
  if (/\b(lowest\s*risk)/i.test(lower)) return "dashboard_query";
  if (/\b(malware\s*today)/i.test(lower)) return "dashboard_query";
  if (/\b(did\s*you\s*detect)/i.test(lower)) return "dashboard_query";

  if (/\b(explain|analyze|show|what|tell\s*me\s*about|review|interpret|break\s*down)\b.*\b(this|my|the|that|latest|last|recent)\b.*\b(scan|report|result|analysis|finding)/i.test(lower)) {
    return "scan_request";
  }

  if (/\b(code|function|class|implement|refactor|debug|fix\s*bug|review\s*code|code\s*review|programming|syntax|api|endpoint|algorithm)\b/i.test(lower)) {
    return "code_review";
  }

  return "general_security";
}

export function getModelTierForIntent(intent: string): ModelTier {
  switch (intent) {
    case "greeting": return "greeting";
    case "scan_request": return "reasoning";
    case "dashboard_query": return "reasoning";
    case "code_review": return "coding";
    case "general_security": return "reasoning";
    default: return "general";
  }
}

export function getSuggestedFollowUps(lastMessage: string, hasScanContext: boolean, hasDashboardData: boolean): string[] {
  const lower = lastMessage.toLowerCase();

  if (hasDashboardData) {
    if (/\b(today|recent|history)/i.test(lower)) {
      return [
        "Which website has the highest risk?",
        "What threats were detected today?",
        "Show me the threat distribution",
      ];
    }
    if (/\b(risk|threat|malware)/i.test(lower)) {
      return [
        "How can I reduce my risk score?",
        "What are the remediation steps?",
        "Compare with yesterday's scans",
      ];
    }
    return [
      "Show me today's scan report",
      "Which website has the highest risk?",
      "What threats were detected today?",
    ];
  }

  if (hasScanContext) {
    return [
      "Explain the risk score in more detail",
      "What are the remediation steps?",
      "Compare with previous scan results",
    ];
  }

  if (lower.includes("phishing") || lower.includes("social engineering")) {
    return ["How do I report a phishing email?", "What tools detect phishing?", "Explain spear phishing vs. phishing"];
  }
  if (lower.includes("xss") || lower.includes("cross-site scripting")) {
    return ["How do I implement a CSP?", "What's stored vs reflected XSS?", "Show me XSS prevention code"];
  }
  if (lower.includes("sql injection") || lower.includes("sqli")) {
    return ["How do I use parameterized queries?", "What ORM do you recommend?", "Explain blind SQL injection"];
  }
  if (lower.includes("malware")) {
    return ["How do I detect malware on a website?", "What is a rootkit?", "Explain ransomware prevention"];
  }
  if (lower.includes("secure") || lower.includes("hardening") || lower.includes("protect")) {
    return ["What security headers should I add?", "How do I set up CSP?", "Explain OWASP Top 10"];
  }

  return [
    "What is phishing?",
    "How do I prevent XSS?",
    "Explain SQL injection",
    "What is OWASP Top 10?",
  ];
}
