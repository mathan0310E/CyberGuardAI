export type RiskLevel = "safe" | "low" | "medium" | "high" | "critical";

export type ThreatCategory =
  | "malware"
  | "phishing"
  | "obfuscated_js"
  | "hidden_iframe"
  | "credential_harvesting"
  | "malicious_redirect"
  | "suspicious_form"
  | "drive_by_download"
  | "crypto_miner"
  | "vulnerable_tech"
  | "malicious_resource"
  | "suspicious_third_party"
  | "security_header_issue"
  | "dangerous_permission";

export type ScanStatus =
  | "pending"
  | "fetching"
  | "analyzing_html"
  | "analyzing_js"
  | "capturing_screenshot"
  | "running_ocr"
  | "running_cv"
  | "checking_threat_intel"
  | "ai_analysis"
  | "completed"
  | "failed";

export interface ScanTarget {
  url: string;
  domain: string;
  scheme: string;
  port: number | null;
  path: string;
}

export interface MalwareIndicator {
  id: string;
  category: ThreatCategory;
  severity: RiskLevel;
  title: string;
  description: string;
  evidence: string;
  location: string;
  recommendation: string;
}

export interface JSAnalysis {
  totalScripts: number;
  externalScripts: number;
  inlineScripts: number;
  obfuscatedCount: number;
  suspiciousPatterns: string[];
  obfuscatedSnippets: string[];
  externalDomains: string[];
  evalUsage: boolean;
  documentWrite: boolean;
  base64Encoded: boolean;
}

export interface HTMLAnalysis {
  hiddenIframes: HiddenIframe[];
  suspiciousForms: SuspiciousForm[];
  metaRedirects: MetaRedirect[];
  externalResources: ExternalResource[];
  securityHeaders: SecurityHeaders;
  doctype: string | null;
  title: string | null;
  formsCount: number;
  linksCount: number;
  imagesCount: number;
}

export interface HiddenIframe {
  src: string;
  width: string;
  height: string;
  style: string;
  position: string;
}

export interface SuspiciousForm {
  action: string;
  method: string;
  fields: string[];
  hasPasswordField: boolean;
  hasEmailField: boolean;
  externalAction: boolean;
}

export interface MetaRedirect {
  content: string;
  target: string;
  delay: number;
}

export interface ExternalResource {
  type: "script" | "stylesheet" | "image" | "font" | "other";
  url: string;
  domain: string;
  isKnown: boolean;
}

export interface SecurityHeaders {
  contentTypeOptions: string | null;
  xFrameOptions: string | null;
  strictTransportSecurity: string | null;
  contentSecurityPolicy: string | null;
  xXssProtection: string | null;
  referrerPolicy: string | null;
  permissionsPolicy: string | null;
}

export interface ScreenshotData {
  fullPage: string;
  viewport: string;
  timestamp: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  suspiciousKeywords: string[];
  detectedLanguages: string[];
}

export interface CVAnalysis {
  hasLoginForm: boolean;
  hasPaymentForm: boolean;
  hasCertificateBadge: boolean;
  hasTrustSeal: boolean;
  visualSimilarity: string[];
  pageLayout: string;
  confidence: number;
}

export interface ThreatIntelResult {
  source: string;
  status: "clean" | "suspicious" | "malicious" | "unknown" | "error";
  details: string;
  score: number | null;
  lastChecked: string;
}

export interface VirusTotalResult extends ThreatIntelResult {
  source: "virustotal";
  positives: number;
  total: number;
  permalink: string;
}

export interface URLScanResult extends ThreatIntelResult {
  source: "urlscan";
  scanId: string;
  screenshotUrl: string | null;
  pageUrl: string | null;
}

export interface AbuseIPDBResult extends ThreatIntelResult {
  source: "abuseipdb";
  abuseConfidence: number;
  countryCode: string;
  isp: string;
  usageType: string;
}

export interface NVDCVEResult extends ThreatIntelResult {
  source: "nvd";
  cveId: string;
  description: string;
  cvssScore: number | null;
  severity: string | null;
}

export interface TechnologyFingerprint {
  name: string;
  version: string | null;
  category: string;
  confidence: number;
  cveCount: number;
}

export interface AIAnalysis {
  riskScore: number;
  riskLevel: RiskLevel;
  executiveSummary: string;
  threatExplanation: string;
  recommendations: string[];
  detailedBreakdown: string;
  complianceIssues: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  scanId?: string;
}

export interface ScanRequest {
  url: string;
  options?: ScanOptions;
}

export interface ScanOptions {
  deepScan: boolean;
  captureScreenshot: boolean;
  runOCR: boolean;
  runCV: boolean;
  checkThreatIntel: boolean;
  analyzeJS: boolean;
}

export interface ScanResult {
  id: string;
  url: string;
  domain: string;
  status: ScanStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  scanStartedAt: string;
  scanCompletedAt: string | null;
  duration: number | null;
  htmlAnalysis: HTMLAnalysis | null;
  jsAnalysis: JSAnalysis | null;
  screenshot: ScreenshotData | null;
  ocrResults: OCRResult | null;
  cvAnalysis: CVAnalysis | null;
  threatIntel: ThreatIntelResult[];
  technologies: TechnologyFingerprint[];
  malwareIndicators: MalwareIndicator[];
  aiAnalysis: AIAnalysis | null;
  reportId: string | null;
}

export interface Report {
  id: string;
  scanId: string;
  title: string;
  url: string;
  domain: string;
  riskScore: number;
  riskLevel: RiskLevel;
  generatedAt: string;
  generatedBy: string;
  pdfUrl: string | null;
  summary: string;
  findingsCount: number;
}

export interface DashboardStats {
  totalScans: number;
  malwareDetected: number;
  cleanSites: number;
  averageRiskScore: number;
  recentScans: ScanResult[];
  threatDistribution: ThreatDistribution[];
  riskOverTime: RiskOverTimeEntry[];
}

export interface ThreatDistribution {
  category: ThreatCategory;
  count: number;
}

export interface RiskOverTimeEntry {
  date: string;
  averageScore: number;
  scanCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
  timestamp: string;
}

export interface AIChatRequest {
  message: string;
  scanId?: string;
  conversationId?: string;
  history: ChatMessage[];
}

export interface AIChatResponse {
  message: ChatMessage;
  conversationId: string;
  suggestedFollowUps: string[];
}
