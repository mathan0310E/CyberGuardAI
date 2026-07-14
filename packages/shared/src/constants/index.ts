import type { RiskLevel, ThreatCategory, ScanStatus } from "@cyberguard/types";

export const RISK_COLORS: Record<RiskLevel, string> = {
  safe: "#22C55E",
  low: "#38BDF8",
  medium: "#F59E0B",
  high: "#F97316",
  critical: "#EF4444",
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  safe: "Safe",
  low: "Low Risk",
  medium: "Medium Risk",
  high: "High Risk",
  critical: "Critical",
};

export const THREAT_CATEGORY_LABELS: Record<ThreatCategory, string> = {
  malware: "Malware",
  phishing: "Phishing",
  obfuscated_js: "Obfuscated JavaScript",
  hidden_iframe: "Hidden Iframe",
  credential_harvesting: "Credential Harvesting",
  malicious_redirect: "Malicious Redirect",
  suspicious_form: "Suspicious Form",
  drive_by_download: "Drive-by Download",
  crypto_miner: "Crypto Miner",
  vulnerable_tech: "Vulnerable Technology",
  malicious_resource: "Malicious Resource",
  suspicious_third_party: "Suspicious Third-Party",
  security_header_issue: "Security Header Issue",
  dangerous_permission: "Dangerous Permission",
};

export const SCAN_STATUS_LABELS: Record<ScanStatus, string> = {
  pending: "Queued",
  fetching: "Fetching website",
  analyzing_html: "Analyzing HTML structure",
  analyzing_js: "Analyzing JavaScript",
  capturing_screenshot: "Capturing screenshot",
  running_ocr: "Extracting text (OCR)",
  running_cv: "Visual analysis (CV)",
  checking_threat_intel: "Checking threat intelligence",
  ai_analysis: "AI-powered analysis",
  completed: "Scan complete",
  failed: "Scan failed",
};

export const SCAN_STATUS_ORDER: ScanStatus[] = [
  "pending",
  "fetching",
  "analyzing_html",
  "analyzing_js",
  "capturing_screenshot",
  "running_ocr",
  "running_cv",
  "checking_threat_intel",
  "ai_analysis",
  "completed",
];

export const DEFAULT_SCAN_OPTIONS = {
  deepScan: true,
  captureScreenshot: true,
  runOCR: true,
  runCV: true,
  checkThreatIntel: true,
  analyzeJS: true,
} as const;
