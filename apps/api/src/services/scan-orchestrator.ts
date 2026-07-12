import type { ScanStatus, MalwareIndicator, ThreatIntelResult, TechnologyFingerprint, AIAnalysis } from "@cyberguard/types";
import { analyzeHTML } from "./html-analyzer.js";
import { runThreatIntel } from "./threat-intel.js";
import { performAIAnalysis } from "./ai-analyzer.js";
import { store, type MemoryScan } from "../store.js";

type StatusUpdater = (status: ScanStatus) => void;

interface OrchestratorResult {
  htmlAnalysis: Record<string, unknown> | null;
  jsAnalysis: Record<string, unknown> | null;
  screenshot: Record<string, unknown> | null;
  ocrResults: Record<string, unknown> | null;
  cvAnalysis: Record<string, unknown> | null;
  threatIntel: ThreatIntelResult[];
  technologies: TechnologyFingerprint[];
  malwareIndicators: MalwareIndicator[];
  aiAnalysis: AIAnalysis | null;
}

async function fetchWebsiteHTML(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "CyberGuardAI/1.0 Security Scanner",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const text = await res.text();
    return text.length > 5_000_000 ? text.slice(0, 5_000_000) : text;
  } finally {
    clearTimeout(timer);
  }
}

export async function runScanPipeline(
  scan: MemoryScan,
  updateStatus: StatusUpdater
): Promise<OrchestratorResult> {
  const result: OrchestratorResult = {
    htmlAnalysis: null,
    jsAnalysis: null,
    screenshot: null,
    ocrResults: null,
    cvAnalysis: null,
    threatIntel: [],
    technologies: [],
    malwareIndicators: [],
    aiAnalysis: null,
  };

  try {
    updateStatus("fetching");
    const html = await fetchWebsiteHTML(scan.url);

    updateStatus("analyzing_html");
    const htmlResult = await analyzeHTML(html, scan.url);
    result.htmlAnalysis = htmlResult.htmlAnalysis as unknown as Record<string, unknown>;
    result.jsAnalysis = htmlResult.jsAnalysis as unknown as Record<string, unknown>;
    result.technologies = htmlResult.technologies;
    result.malwareIndicators = htmlResult.indicators;

    updateStatus("analyzing_js");
    await store.addLog("info", `JS analysis complete for ${scan.domain}: ${htmlResult.jsAnalysis.totalScripts} scripts, ${htmlResult.jsAnalysis.obfuscatedCount} obfuscated`);

    updateStatus("capturing_screenshot");
    result.screenshot = null;

    updateStatus("running_ocr");
    result.ocrResults = null;

    updateStatus("running_cv");
    result.cvAnalysis = null;

    updateStatus("checking_threat_intel");
    const domain = new URL(scan.url).hostname;
    const threatResults = await runThreatIntel(domain);
    result.threatIntel = threatResults;

    for (const ti of threatResults) {
      if (ti.status === "malicious") {
        result.malwareIndicators.push({
          id: `ind-ti-${ti.source}`,
          category: "malicious_resource",
          severity: "high",
          title: `Flagged by ${ti.source}`,
          description: ti.details,
          evidence: `Source: ${ti.source}, Score: ${ti.score ?? "N/A"}`,
          location: "threat_intelligence",
          recommendation: `Investigate findings from ${ti.source} and take appropriate action.`,
        });
      } else if (ti.status === "suspicious") {
        result.malwareIndicators.push({
          id: `ind-ti-${ti.source}`,
          category: "suspicious_third_party",
          severity: "medium",
          title: `Suspicious report from ${ti.source}`,
          description: ti.details,
          evidence: `Source: ${ti.source}, Score: ${ti.score ?? "N/A"}`,
          location: "threat_intelligence",
          recommendation: `Review ${ti.source} findings for potential issues.`,
        });
      }
    }

    updateStatus("ai_analysis");
    const aiResult = await performAIAnalysis({
      url: scan.url,
      domain: scan.domain,
      riskScore: 0,
      indicators: result.malwareIndicators.map((i) => ({
        category: i.category,
        severity: i.severity,
        title: i.title,
        description: i.description,
      })),
      technologies: result.technologies.map((t) => ({ name: t.name, version: t.version })),
      jsAnalysis: result.jsAnalysis ? {
        totalScripts: (result.jsAnalysis as Record<string, unknown>)["totalScripts"] as number,
        obfuscatedCount: (result.jsAnalysis as Record<string, unknown>)["obfuscatedCount"] as number,
        evalUsage: (result.jsAnalysis as Record<string, unknown>)["evalUsage"] as boolean,
      } : null,
      htmlAnalysis: result.htmlAnalysis ? {
        hiddenIframes: ((result.htmlAnalysis as Record<string, unknown>)["hiddenIframes"] as unknown[]) ?? [],
        suspiciousForms: ((result.htmlAnalysis as Record<string, unknown>)["suspiciousForms"] as unknown[]) ?? [],
        metaRedirects: ((result.htmlAnalysis as Record<string, unknown>)["metaRedirects"] as unknown[]) ?? [],
      } : null,
    });
    result.aiAnalysis = aiResult;

    await store.addLog("info", `Scan pipeline complete for ${scan.domain}: risk=${aiResult.riskScore}, level=${aiResult.riskLevel}`);

  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    await store.addLog("error", `Scan pipeline failed for ${scan.domain}: ${msg}`);

    if (result.malwareIndicators.length === 0) {
      result.aiAnalysis = {
        riskScore: 0,
        riskLevel: "low",
        executiveSummary: `Scan failed for ${scan.domain}: ${msg}. The site could not be reached or analyzed.`,
        threatExplanation: `The scan encountered an error: ${msg}`,
        recommendations: ["Verify the URL is accessible", "Check if the site is blocking automated requests", "Try again later"],
        detailedBreakdown: "",
        complianceIssues: [],
      };
    }
  }

  return result;
}
