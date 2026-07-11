import type { RiskLevel, ThreatCategory } from "@cyberguard/types";

export interface MockScan {
  id: string;
  url: string;
  domain: string;
  riskScore: number;
  riskLevel: RiskLevel;
  scannedAt: string;
  threatsFound: number;
  status: "completed" | "running" | "failed";
}

export const MOCK_RECENT_SCANS: MockScan[] = [
  { id: "1", url: "https://example-shop.com", domain: "example-shop.com", riskScore: 82, riskLevel: "critical", scannedAt: "2025-07-11T10:30:00Z", threatsFound: 7, status: "completed" },
  { id: "2", url: "https://my-portfolio.dev", domain: "my-portfolio.dev", riskScore: 15, riskLevel: "low", scannedAt: "2025-07-11T09:15:00Z", threatsFound: 1, status: "completed" },
  { id: "3", url: "https://news-site.org", domain: "news-site.org", riskScore: 45, riskLevel: "medium", scannedAt: "2025-07-11T08:00:00Z", threatsFound: 3, status: "completed" },
  { id: "4", url: "https://bank-secure.net", domain: "bank-secure.net", riskScore: 91, riskLevel: "critical", scannedAt: "2025-07-10T22:45:00Z", threatsFound: 9, status: "completed" },
  { id: "5", url: "https://tech-blog.io", domain: "tech-blog.io", riskScore: 8, riskLevel: "safe", scannedAt: "2025-07-10T18:30:00Z", threatsFound: 0, status: "completed" },
  { id: "6", url: "https://cdn-assets.com", domain: "cdn-assets.com", riskScore: 62, riskLevel: "high", scannedAt: "2025-07-10T14:20:00Z", threatsFound: 5, status: "completed" },
];

export const MOCK_THREAT_FEED: { id: string; category: ThreatCategory; domain: string; time: string; severity: RiskLevel }[] = [
  { id: "t1", category: "crypto_miner", domain: "example-shop.com", time: "2 min ago", severity: "critical" },
  { id: "t2", category: "obfuscated_js", domain: "bank-secure.net", time: "18 min ago", severity: "critical" },
  { id: "t3", category: "phishing", domain: "cdn-assets.com", time: "1 hour ago", severity: "high" },
  { id: "t4", category: "hidden_iframe", domain: "news-site.org", time: "3 hours ago", severity: "medium" },
  { id: "t5", category: "malicious_redirect", domain: "example-shop.com", time: "5 hours ago", severity: "high" },
];

export const MOCK_RISK_CHART_DATA = [
  { name: "Mon", value: 42 },
  { name: "Tue", value: 28 },
  { name: "Wed", value: 65 },
  { name: "Thu", value: 38 },
  { name: "Fri", value: 71 },
  { name: "Sat", value: 55 },
  { name: "Sun", value: 33 },
];

export const MOCK_THREAT_DISTRIBUTION = [
  { name: "Malware", value: 12 },
  { name: "Phishing", value: 8 },
  { name: "Obfuscated JS", value: 15 },
  { name: "Hidden Iframes", value: 6 },
  { name: "Crypto Miners", value: 4 },
  { name: "Other", value: 9 },
];
