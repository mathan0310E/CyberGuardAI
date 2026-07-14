import type { RiskLevel } from "@cyberguard/types";
import type { MemoryScan, MemoryReport, MemoryUser } from "../../../lib/store.js";

export interface ContextProvider {
  collect(userId: string, options?: ContextOptions): Promise<CollectedData>;
  format(data: CollectedData): string;
  shouldInject(message: string): boolean;
}

export interface ContextOptions {
  limit?: number;
  includeDetails?: boolean;
}

export interface CollectedData {
  available: boolean;
  summary: string;
  details?: Record<string, unknown>;
}

export interface DashboardData {
  user: MemoryUser | null;
  totalScans: number;
  completedScans: number;
  threatsDetected: number;
  cleanSites: number;
  averageRiskScore: number;
  highestRiskScan: MemoryScan | null;
  lastScanTime: string | null;
  todayScans: number;
  weekScans: number;
  monthScans: number;
  threatDistribution: Array<{ category: string; count: number }>;
}

export interface WebsiteScanData {
  scans: MemoryScan[];
  totalCount: number;
}

export interface FileScanData {
  files: Array<{
    scanId: string;
    url: string;
    indicators: number;
    riskScore: number;
    riskLevel: RiskLevel;
    technologies: string[];
    malwareCategories: string[];
  }>;
  totalCount: number;
}

export interface MonitoringData {
  monitoredSites: number;
  lastCheck: string | null;
  changesDetected: number;
}

export interface ThreatIntelData {
  totalThreats: number;
  byCategory: Array<{ category: string; count: number }>;
  topDomains: Array<{ domain: string; threatCount: number }>;
}

export interface ReportData {
  reports: MemoryReport[];
  totalCount: number;
}

export interface BusinessData {
  plan: string;
  totalScans: number;
  scanQuota: number;
  remainingQuota: number;
}

export interface NotificationData {
  recentAlerts: Array<{
    type: string;
    message: string;
    timestamp: string;
  }>;
}

export interface ConversationMemory {
  conversationId: string;
  userId: string;
  history: Array<{ role: "user" | "assistant"; content: string; timestamp: string }>;
  currentScanId?: string;
  currentFileUrl?: string;
  explanationLevel: "basic" | "detailed" | "technical";
  lastActivity: number;
}

export type ContextType =
  | "dashboard"
  | "website_scans"
  | "file_scans"
  | "monitoring"
  | "threat_intel"
  | "reports"
  | "business"
  | "notifications"
  | "memory";

export type AIMessageIntent =
  | "greeting"
  | "dashboard_query"
  | "scan_analysis"
  | "file_analysis"
  | "monitoring_check"
  | "threat_intel_query"
  | "report_query"
  | "business_query"
  | "notification_query"
  | "code_review"
  | "general_security";
