import type { AIAnalysis, RiskLevel } from "@cyberguard/types";

interface AIAnalysisInput {
  url: string;
  domain: string;
  riskScore: number;
  indicators: { category: string; severity: string; title: string; description: string }[];
  technologies: { name: string; version: string | null }[];
  jsAnalysis: { totalScripts: number; obfuscatedCount: number; evalUsage: boolean } | null;
  htmlAnalysis: { hiddenIframes: unknown[]; suspiciousForms: unknown[]; metaRedirects: unknown[] } | null;
}

function calculateRiskScore(input: AIAnalysisInput): { score: number; level: RiskLevel } {
  let score = 0;

  for (const indicator of input.indicators) {
    switch (indicator.severity) {
      case "critical": score += 25; break;
      case "high": score += 15; break;
      case "medium": score += 8; break;
      case "low": score += 3; break;
      default: break;
    }
  }

  if (input.jsAnalysis?.evalUsage) score += 10;
  if (input.jsAnalysis?.obfuscatedCount && input.jsAnalysis.obfuscatedCount > 2) score += 15;
  if (input.htmlAnalysis?.hiddenIframes.length) score += input.htmlAnalysis.hiddenIframes.length * 12;
  if (input.htmlAnalysis?.suspiciousForms.length) score += input.htmlAnalysis.suspiciousForms.length * 15;
  if (input.htmlAnalysis?.metaRedirects.length) score += 8;

  score = Math.min(100, Math.max(0, score));

  let level: RiskLevel = "safe";
  if (score >= 80) level = "critical";
  else if (score >= 60) level = "high";
  else if (score >= 40) level = "medium";
  else if (score >= 20) level = "low";

  return { score, level };
}

export async function performAIAnalysis(input: AIAnalysisInput): Promise<AIAnalysis> {
  const { score, level } = calculateRiskScore(input);

  const criticalCount = input.indicators.filter((i) => i.severity === "critical").length;
  const highCount = input.indicators.filter((i) => i.severity === "high").length;

  const executiveSummary = `Analysis of ${input.domain} identified ${input.indicators.length} security issue(s) with a risk score of ${score}/100 (${level} risk).${criticalCount > 0 ? ` ${criticalCount} critical issue(s) require immediate attention.` : ""}${highCount > 0 ? ` ${highCount} high-severity issues were also detected.` : ""}`;

  const recommendations: string[] = [];
  if (input.jsAnalysis?.evalUsage) {
    recommendations.push("Remove eval() usage from JavaScript code — it's a common obfuscation vector");
  }
  if (input.htmlAnalysis?.hiddenIframes.length) {
    recommendations.push(`Remove ${input.htmlAnalysis.hiddenIframes.length} hidden iframe(s) loading external content`);
  }
  if (input.htmlAnalysis?.suspiciousForms.length) {
    recommendations.push("Fix credential harvesting forms — ensure all form actions point to same-origin HTTPS endpoints");
  }
  if (input.jsAnalysis?.obfuscatedCount) {
    recommendations.push("Replace obfuscated JavaScript with readable code");
  }
  recommendations.push("Implement Content-Security-Policy headers");
  recommendations.push("Add X-Frame-Options: DENY header");
  recommendations.push("Enable Strict-Transport-Security");

  return {
    riskScore: score,
    riskLevel: level,
    executiveSummary,
    threatExplanation: `The website exhibits ${input.indicators.length} threat indicators across ${new Set(input.indicators.map((i) => i.category)).size} categories. The most concerning findings include ${input.indicators.slice(0, 3).map((i) => i.title.toLowerCase()).join(", ")}.`,
    recommendations,
    detailedBreakdown: `JavaScript Analysis: ${input.jsAnalysis?.totalScripts ?? 0} scripts analyzed, ${input.jsAnalysis?.obfuscatedCount ?? 0} obfuscated. HTML Analysis: ${input.htmlAnalysis?.hiddenIframes.length ?? 0} hidden iframes, ${input.htmlAnalysis?.suspiciousForms.length ?? 0} suspicious forms, ${input.htmlAnalysis?.metaRedirects.length ?? 0} suspicious redirects.`,
    complianceIssues: [],
  };
}

export function buildScanContext(scanData: Record<string, unknown>): string {
  return JSON.stringify(
    {
      url: scanData["url"],
      domain: scanData["domain"],
      riskScore: scanData["riskScore"],
      indicators: scanData["malwareIndicators"],
      technologies: scanData["technologies"],
      jsAnalysis: scanData["jsAnalysis"],
      htmlAnalysis: scanData["htmlAnalysis"],
    },
    null,
    2
  );
}
