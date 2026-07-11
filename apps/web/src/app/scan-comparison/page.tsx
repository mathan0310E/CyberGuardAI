"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUp,
  ArrowDown,
  Minus,
  Shield,
  AlertTriangle,
  Bug,
  FileCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { AnimatedCounter } from "@/components/premium/AnimatedCounter";
import { cn } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

interface ScanData {
  id: string;
  label: string;
  date: string;
  riskScore: number;
  malwareCount: number;
  threatCount: number;
  securityHeaders: number;
  securityHeadersTotal: number;
  issues: string[];
}

const scans: ScanData[] = [
  {
    id: "scan-a",
    label: "example.com",
    date: "Jul 11, 2026 — 14:32",
    riskScore: 72,
    malwareCount: 5,
    threatCount: 12,
    securityHeaders: 4,
    securityHeadersTotal: 9,
    issues: [
      "XSS in search input",
      "Missing CSP header",
      "Outdated jQuery v2.1.4",
      "TLS 1.0 enabled",
      "Open redirect in auth flow",
      "Server header disclosure",
      "Weak cipher suites",
      "Missing HSTS header",
      "CSRF token missing on form",
    ],
  },
  {
    id: "scan-b",
    label: "example.com",
    date: "Jul 8, 2026 — 09:15",
    riskScore: 81,
    malwareCount: 7,
    threatCount: 15,
    securityHeaders: 2,
    securityHeadersTotal: 9,
    issues: [
      "XSS in search input",
      "Missing CSP header",
      "Outdated jQuery v2.1.4",
      "Outdated Bootstrap v4.2.1",
      "TLS 1.0 enabled",
      "Open redirect in auth flow",
      "Server header disclosure",
      "Weak cipher suites",
      "Missing HSTS header",
      "CSRF token missing on form",
      "CORS misconfiguration",
    ],
  },
];

const comparisonMetrics = [
  {
    label: "Risk Score",
    key: "riskScore" as const,
    icon: Shield,
    lowerIsBetter: true,
  },
  {
    label: "Malware Count",
    key: "malwareCount" as const,
    icon: Bug,
    lowerIsBetter: true,
  },
  {
    label: "Threat Count",
    key: "threatCount" as const,
    icon: AlertTriangle,
    lowerIsBetter: true,
  },
  {
    label: "Security Headers",
    key: "securityHeaders" as const,
    icon: FileCheck,
    lowerIsBetter: false,
  },
];

const newIssues = [
  { issue: "CORS misconfiguration detected", severity: "high" as const, category: "Configuration" },
  { issue: "Exposed admin panel at /wp-admin", severity: "critical" as const, category: "Access Control" },
  { issue: "Missing rate limiting on API endpoints", severity: "medium" as const, category: "API Security" },
];

const resolvedIssues = [
  { issue: "Outdated Bootstrap v4.2.1", resolvedBy: "Updated to v5.3.3", severity: "high" as const },
  { issue: "CORS wildcard origin policy", resolvedBy: "Restricted to allowed origins", severity: "medium" as const },
];

const improvedSecurity = [
  { item: "Content-Security-Policy", before: "Missing", after: "Implemented with nonce-based loading" },
  { item: "X-Frame-Options", before: "Missing", after: "Set to DENY" },
  { item: "X-Content-Type-Options", before: "Missing", after: "Set to nosniff" },
];

function getScoreColor(score: number): string {
  if (score >= 70) return "text-danger";
  if (score >= 40) return "text-warning";
  return "text-success";
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical": return "bg-danger/15 text-danger border-danger/30";
    case "high": return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    case "medium": return "bg-warning/15 text-warning border-warning/30";
    case "low": return "bg-success/15 text-success border-success/30";
    default: return "bg-muted/15 text-muted border-muted/30";
  }
}

export default function ScanComparisonPage() {
  const [currentScanId, setCurrentScanId] = useState(scans[0]?.id ?? "");
  const [previousScanId, setPreviousScanId] = useState(scans[1]?.id ?? "");
  const [showCurrentDropdown, setShowCurrentDropdown] = useState(false);
  const [showPreviousDropdown, setShowPreviousDropdown] = useState(false);

  const currentScan = scans.find((s) => s.id === currentScanId) ?? scans[0] as ScanData;
  const previousScan = scans.find((s) => s.id === previousScanId) ?? scans[1] as ScanData;

  const scoreDiff = currentScan.riskScore - previousScan.riskScore;
  const scoreImproved = scoreDiff < 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <SectionTitle
          title="Scan Comparison"
          subtitle="Compare scans side by side to track security improvements"
          align="left"
        />
      </motion.div>

      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeInUp}>
        <GlassCard glow className="mb-8">
          <div className="grid gap-6 sm:grid-cols-2 items-end">
            <div className="relative">
              <label className="block text-xs text-muted mb-2 font-medium uppercase tracking-wider">Current Scan</label>
              <button
                onClick={() => { setShowCurrentDropdown(!showCurrentDropdown); setShowPreviousDropdown(false); }}
                className="flex items-center justify-between w-full rounded-xl border border-border/50 bg-surface px-4 py-3 text-sm text-text hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary shrink-0" />
                  <span>{currentScan.label} — {currentScan.date}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted shrink-0" />
              </button>
              {showCurrentDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 right-0 top-full mt-1 rounded-xl glass-strong border border-border/50 shadow-xl z-50 overflow-hidden"
                >
                  {scans.map((scan) => (
                    <button
                      key={scan.id}
                      onClick={() => { setCurrentScanId(scan.id); setShowCurrentDropdown(false); }}
                      className={cn(
                        "flex items-center justify-between w-full px-4 py-3 text-sm text-left transition-colors hover:bg-surface/80",
                        currentScanId === scan.id && "bg-primary/5"
                      )}
                    >
                      <span className="text-text">{scan.label} — {scan.date}</span>
                      <span className={cn("text-xs font-bold", getScoreColor(scan.riskScore))}>{scan.riskScore}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <div className="relative">
              <label className="block text-xs text-muted mb-2 font-medium uppercase tracking-wider">Previous Scan</label>
              <button
                onClick={() => { setShowPreviousDropdown(!showPreviousDropdown); setShowCurrentDropdown(false); }}
                className="flex items-center justify-between w-full rounded-xl border border-border/50 bg-surface px-4 py-3 text-sm text-text hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted shrink-0" />
                  <span>{previousScan.label} — {previousScan.date}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted shrink-0" />
              </button>
              {showPreviousDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 right-0 top-full mt-1 rounded-xl glass-strong border border-border/50 shadow-xl z-50 overflow-hidden"
                >
                  {scans.map((scan) => (
                    <button
                      key={scan.id}
                      onClick={() => { setPreviousScanId(scan.id); setShowPreviousDropdown(false); }}
                      className={cn(
                        "flex items-center justify-between w-full px-4 py-3 text-sm text-left transition-colors hover:bg-surface/80",
                        previousScanId === scan.id && "bg-primary/5"
                      )}
                    >
                      <span className="text-text">{scan.label} — {scan.date}</span>
                      <span className={cn("text-xs font-bold", getScoreColor(scan.riskScore))}>{scan.riskScore}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeInUp} className="mb-8">
        <GlassCard className="flex flex-col items-center py-8">
          <p className="text-sm text-muted mb-2 font-medium uppercase tracking-wider">Score Change</p>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Previous</p>
              <p className={cn("text-5xl font-bold", getScoreColor(previousScan.riskScore))}>
                <AnimatedCounter value={previousScan.riskScore} />
              </p>
            </div>

            <div className="flex flex-col items-center px-6">
              <div className={cn(
                "flex items-center gap-2 rounded-2xl px-5 py-3",
                scoreImproved
                  ? "bg-success/10 border border-success/30"
                  : scoreDiff > 0
                  ? "bg-danger/10 border border-danger/30"
                  : "bg-muted/10 border border-muted/30"
              )}>
                {scoreImproved ? (
                  <ArrowDown className="h-6 w-6 text-success" />
                ) : scoreDiff > 0 ? (
                  <ArrowUp className="h-6 w-6 text-danger" />
                ) : (
                  <Minus className="h-6 w-6 text-muted" />
                )}
                <span className={cn(
                  "text-2xl font-bold",
                  scoreImproved ? "text-success" : scoreDiff > 0 ? "text-danger" : "text-muted"
                )}>
                  {scoreDiff > 0 ? "+" : ""}{scoreDiff}
                </span>
              </div>
              <p className="text-[10px] text-muted mt-2">
                {scoreImproved ? "Improved" : scoreDiff > 0 ? "Regressed" : "No change"}
              </p>
            </div>

            <div className="text-center">
              <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Current</p>
              <p className={cn("text-5xl font-bold", getScoreColor(currentScan.riskScore))}>
                <AnimatedCounter value={currentScan.riskScore} />
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {comparisonMetrics.map((metric, i) => {
          const currentVal = currentScan[metric.key];
          const prevVal = previousScan[metric.key];
          const diff = currentVal - prevVal;
          const improved = metric.lowerIsBetter ? diff < 0 : diff > 0;

          return (
            <motion.div key={metric.label} custom={i + 2} initial="hidden" animate="visible" variants={fadeInUp}>
              <GlassCard>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <metric.icon className="h-4 w-4" />
                  </div>
                  <p className="text-xs text-muted font-medium">{metric.label}</p>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-text">{currentVal}</p>
                    <p className="text-[10px] text-muted mt-0.5">
                      {metric.key === "securityHeaders"
                        ? `out of ${currentScan.securityHeadersTotal}`
                        : "current scan"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {diff !== 0 ? (
                      <>
                        {improved ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-danger" />
                        )}
                        <span className={cn("text-xs font-bold", improved ? "text-success" : "text-danger")}>
                          {diff > 0 ? "+" : ""}{diff}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted font-bold">—</span>
                    )}
                  </div>
                </div>

                {metric.key === "securityHeaders" && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-muted mb-1">
                      <span>{currentVal}/{currentScan.securityHeadersTotal}</span>
                      <span>{Math.round((currentVal / currentScan.securityHeadersTotal) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentVal / currentScan.securityHeadersTotal) * 100}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeInUp}>
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="h-4 w-4 text-danger" />
              <h3 className="text-sm font-semibold text-muted">New Issues Detected</h3>
              <span className="ml-auto rounded-full bg-danger/15 text-danger text-[10px] font-bold px-2 py-0.5">
                {newIssues.length}
              </span>
            </div>
            <div className="space-y-2">
              {newIssues.map((issue, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/5 p-3"
                >
                  <AlertTriangle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text font-medium">{issue.issue}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase border", getSeverityColor(issue.severity))}>
                        {issue.severity}
                      </span>
                      <span className="text-[10px] text-muted">{issue.category}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div custom={7} initial="hidden" animate="visible" variants={fadeInUp}>
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <h3 className="text-sm font-semibold text-muted">Resolved Issues</h3>
              <span className="ml-auto rounded-full bg-success/15 text-success text-[10px] font-bold px-2 py-0.5">
                {resolvedIssues.length}
              </span>
            </div>
            <div className="space-y-2">
              {resolvedIssues.map((issue, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/5 p-3"
                >
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text font-medium line-through decoration-success/40">{issue.issue}</p>
                    <p className="text-xs text-success mt-1">{issue.resolvedBy}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div custom={8} initial="hidden" animate="visible" variants={fadeInUp}>
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-success" />
            <h3 className="text-sm font-semibold text-muted">Improved Security Headers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="pb-2 text-left text-muted font-medium">Header</th>
                  <th className="pb-2 text-left text-muted font-medium">Before</th>
                  <th className="pb-2 text-left text-muted font-medium" />
                  <th className="pb-2 text-left text-muted font-medium">After</th>
                </tr>
              </thead>
              <tbody>
                {improvedSecurity.map((item, idx) => (
                  <tr key={idx} className="border-b border-border/20">
                    <td className="py-3 text-text font-medium">{item.item}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-danger/15 text-danger px-2 py-0.5 text-[10px] font-bold">
                        <XCircle className="h-3 w-3" />
                        {item.before}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <ArrowUp className="h-3.5 w-3.5 text-success mx-auto" />
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 text-success px-2 py-0.5 text-[10px] font-bold">
                        <CheckCircle2 className="h-3 w-3" />
                        {item.after}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
