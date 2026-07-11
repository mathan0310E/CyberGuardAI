import type { RiskLevel, ThreatCategory, ScanStatus } from "@cyberguard/types";

export interface MemoryScan {
  _id: string;
  url: string;
  domain: string;
  status: ScanStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  scanOptions: Record<string, boolean>;
  htmlAnalysis: Record<string, unknown> | null;
  jsAnalysis: Record<string, unknown> | null;
  screenshot: Record<string, unknown> | null;
  ocrResults: Record<string, unknown> | null;
  cvAnalysis: Record<string, unknown> | null;
  threatIntel: Record<string, unknown>[];
  technologies: Record<string, unknown>[];
  malwareIndicators: Record<string, unknown>[];
  aiAnalysis: Record<string, unknown> | null;
  reportId: string | null;
  startedAt: Date;
  completedAt: Date | null;
  duration: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryReport {
  _id: string;
  scanId: string;
  title: string;
  url: string;
  domain: string;
  riskScore: number;
  riskLevel: RiskLevel;
  summary: string;
  findingsCount: number;
  generatedAt: Date;
  createdAt: Date;
}

let scanIdCounter = 1;
let reportIdCounter = 1;

function makeId(prefix: string, counter: number): string {
  return `${prefix}_${counter.toString().padStart(4, "0")}`;
}

const now = new Date();
const scans: MemoryScan[] = [
  {
    _id: makeId("scan", scanIdCounter++), url: "https://example-shop.com", domain: "example-shop.com",
    status: "completed", riskScore: 82, riskLevel: "critical",
    scanOptions: {}, htmlAnalysis: null, jsAnalysis: null, screenshot: null,
    ocrResults: null, cvAnalysis: null, threatIntel: [], technologies: [],
    malwareIndicators: [
      { id: "ind-1", category: "crypto_miner", severity: "critical", title: "Cryptocurrency miner script", description: "Known mining library detected.", evidence: "coinhive.min.js", location: "analytics.js:45", recommendation: "Remove." },
      { id: "ind-2", category: "hidden_iframe", severity: "high", title: "Hidden iframe", description: "Invisible iframe loading external content.", evidence: '<iframe style="display:none" src="https://malicious-cdn.xyz">', location: "index.html:142", recommendation: "Remove iframe." },
    ],
    aiAnalysis: { riskScore: 82, riskLevel: "critical", executiveSummary: "Critical threats found.", threatExplanation: "Crypto miner and hidden iframe detected.", recommendations: ["Remove miner", "Remove hidden iframe"], detailedBreakdown: "", complianceIssues: [] },
    reportId: null, startedAt: new Date(now.getTime() - 3600000), completedAt: now, duration: 12.4, createdAt: new Date(now.getTime() - 3600000), updatedAt: now,
  },
  {
    _id: makeId("scan", scanIdCounter++), url: "https://my-portfolio.dev", domain: "my-portfolio.dev",
    status: "completed", riskScore: 15, riskLevel: "low",
    scanOptions: {}, htmlAnalysis: null, jsAnalysis: null, screenshot: null,
    ocrResults: null, cvAnalysis: null, threatIntel: [], technologies: [],
    malwareIndicators: [
      { id: "ind-3", category: "security_header_issue", severity: "low", title: "Missing CSP header", description: "Content-Security-Policy not set.", evidence: "", location: "HTTP headers", recommendation: "Add CSP header." },
    ],
    aiAnalysis: { riskScore: 15, riskLevel: "low", executiveSummary: "Low risk site.", threatExplanation: "Minor header issues.", recommendations: ["Add CSP header"], detailedBreakdown: "", complianceIssues: [] },
    reportId: null, startedAt: new Date(now.getTime() - 7200000), completedAt: new Date(now.getTime() - 7190000), duration: 8.2, createdAt: new Date(now.getTime() - 7200000), updatedAt: new Date(now.getTime() - 7190000),
  },
  {
    _id: makeId("scan", scanIdCounter++), url: "https://news-site.org", domain: "news-site.org",
    status: "completed", riskScore: 45, riskLevel: "medium",
    scanOptions: {}, htmlAnalysis: null, jsAnalysis: null, screenshot: null,
    ocrResults: null, cvAnalysis: null, threatIntel: [], technologies: [],
    malwareIndicators: [
      { id: "ind-4", category: "obfuscated_js", severity: "medium", title: "Obfuscated JavaScript", description: "eval() usage detected.", evidence: "eval(atob(...))", location: "main.js:200", recommendation: "Replace with clean code." },
    ],
    aiAnalysis: { riskScore: 45, riskLevel: "medium", executiveSummary: "Medium risk.", threatExplanation: "Obfuscated JS found.", recommendations: ["Clean up JS"], detailedBreakdown: "", complianceIssues: [] },
    reportId: null, startedAt: new Date(now.getTime() - 10800000), completedAt: new Date(now.getTime() - 10790000), duration: 15.0, createdAt: new Date(now.getTime() - 10800000), updatedAt: new Date(now.getTime() - 10790000),
  },
];

const reports: MemoryReport[] = [
  { _id: makeId("rpt", reportIdCounter++), scanId: scans[0]._id, title: "Critical Threat Report", url: scans[0].url, domain: scans[0].domain, riskScore: 82, riskLevel: "critical", summary: "Multiple critical threats detected.", findingsCount: 2, generatedAt: scans[0].completedAt ?? now, createdAt: now },
  { _id: makeId("rpt", reportIdCounter++), scanId: scans[1]._id, title: "Clean Site Assessment", url: scans[1].url, domain: scans[1].domain, riskScore: 15, riskLevel: "low", summary: "Site appears clean.", findingsCount: 1, generatedAt: scans[1].completedAt ?? now, createdAt: now },
  { _id: makeId("rpt", reportIdCounter++), scanId: scans[2]._id, title: "Medium Risk Analysis", url: scans[2].url, domain: scans[2].domain, riskScore: 45, riskLevel: "medium", summary: "Suspicious scripts detected.", findingsCount: 1, generatedAt: scans[2].completedAt ?? now, createdAt: now },
];

export const store = {
  scans,
  reports,
  getNextScanId: () => makeId("scan", scanIdCounter++),
  getNextReportId: () => makeId("rpt", reportIdCounter++),
};
