"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Shield,
  AlertTriangle,
  Globe,
  Code,
  Eye,
  FileText,
  ArrowRight,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { RiskGauge } from "@/components/ui/RiskGauge";
import { ThreatCard } from "@/components/ui/ThreatCard";
import { ProgressTimeline } from "@/components/ui/ProgressTimeline";
import { SCAN_STATUS_LABELS } from "@cyberguard/shared";
import type { ScanStatus, RiskLevel, MalwareIndicator } from "@cyberguard/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SCAN_STEPS: ScanStatus[] = [
  "fetching",
  "analyzing_html",
  "analyzing_js",
  "capturing_screenshot",
  "running_ocr",
  "running_cv",
  "checking_threat_intel",
  "ai_analysis",
];

const MOCK_RESULTS: {
  riskScore: number;
  riskLevel: RiskLevel;
  indicators: MalwareIndicator[];
  jsScripts: number;
  externalScripts: number;
  obfuscated: number;
  hiddenIframes: number;
  securityHeaders: number;
  chartData: { name: string; value: number }[];
} = {
  riskScore: 72,
  riskLevel: "high",
  indicators: [
    {
      id: "1",
      category: "hidden_iframe",
      severity: "high",
      title: "Hidden iframe detected",
      description: "An invisible iframe was found loading content from a suspicious external domain.",
      evidence: '<iframe style="display:none" src="https://malicious-cdn.xyz/payload">',
      location: "index.html:142",
      recommendation: "Remove the hidden iframe and investigate the source domain.",
    },
    {
      id: "2",
      category: "obfuscated_js",
      severity: "critical",
      title: "Obfuscated JavaScript",
      description: "Heavy JavaScript obfuscation using eval() and base64 encoding detected.",
      evidence: "eval(atob('ZG9jdW1lbnQuY29va2llcw=='))",
      location: "script[src=main.js]:892",
      recommendation: "Replace obfuscated scripts with clean, readable code.",
    },
    {
      id: "3",
      category: "phishing",
      severity: "high",
      title: "Potential credential harvesting",
      description: "A form is submitting credentials to an external server with no SSL verification.",
      evidence: '<form action="http://collector.malicious.xyz/submit" method="POST">',
      location: "login.html:67",
      recommendation: "Ensure all form actions point to the same origin with HTTPS.",
    },
    {
      id: "4",
      category: "crypto_miner",
      severity: "medium",
      title: "Cryptocurrency miner script",
      description: "A known crypto mining library was detected in the page scripts.",
      evidence: "coinhive.min.js loaded from cdn.coinhive.com",
      location: "analytics.js:45",
      recommendation: "Remove the mining script and audit third-party dependencies.",
    },
    {
      id: "5",
      category: "security_header_issue",
      severity: "medium",
      title: "Missing security headers",
      description: "Content-Security-Policy, X-Frame-Options, and Strict-Transport-Security headers are missing.",
      evidence: "CSP: missing, X-Frame-Options: missing, HSTS: missing",
      location: "HTTP Response Headers",
      recommendation: "Implement proper security headers to prevent clickjacking and injection attacks.",
    },
  ],
  jsScripts: 24,
  externalScripts: 8,
  obfuscated: 3,
  hiddenIframes: 2,
  securityHeaders: 3,
  chartData: [
    { name: "HTML", value: 15 },
    { name: "JS", value: 42 },
    { name: "CSS", value: 8 },
    { name: "Fonts", value: 4 },
    { name: "Images", value: 12 },
  ],
};

export default function ScannerPage() {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showResults, setShowResults] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const startScan = useCallback(() => {
    if (!url.trim()) return;
    setIsScanning(true);
    setShowResults(false);
    setCurrentStep(0);
    setScanProgress(0);
  }, [url]);

  useEffect(() => {
    if (!isScanning || currentStep < 0) return;

    if (currentStep >= SCAN_STEPS.length) {
      setTimeout(() => {
        setIsScanning(false);
        setShowResults(true);
      }, 500);
      return;
    }

    setScanProgress(Math.round(((currentStep + 1) / SCAN_STEPS.length) * 100));

    const timer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 800);

    return () => clearTimeout(timer);
  }, [isScanning, currentStep]);

  const steps = SCAN_STEPS.map((s, i) => ({
    label: SCAN_STATUS_LABELS[s],
    status: i < currentStep ? ("completed" as const) : i === currentStep ? ("active" as const) : ("pending" as const),
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-text">Website Scanner</h1>
        <p className="mt-1 text-muted">Enter a URL to analyze for malware and security threats</p>
      </motion.div>

      {/* URL Input */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <GlassCard glow className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && startScan()}
                placeholder="https://example.com"
                disabled={isScanning}
                className="w-full rounded-xl bg-background border border-border pl-11 pr-4 py-3 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50"
              />
            </div>
            <GlowButton
              onClick={startScan}
              disabled={isScanning || !url.trim()}
              size="lg"
              className="shrink-0"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Scan Website
                </>
              )}
            </GlowButton>
          </div>
        </GlassCard>
      </motion.div>

      {/* Scan Progress */}
      <AnimatePresence mode="wait">
        {isScanning && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <GlassCard>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-muted mb-2">Scan Progress</p>
                  <div className="mb-4 h-2 w-full rounded-full bg-border overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      animate={{ width: `${scanProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-muted mb-6">
                    Step {Math.min(currentStep + 1, SCAN_STEPS.length)} of {SCAN_STEPS.length}
                    {currentStep < SCAN_STEPS.length && SCAN_STEPS[currentStep] && ` — ${SCAN_STATUS_LABELS[SCAN_STEPS[currentStep]]}`}
                  </p>
                  <ProgressTimeline steps={steps} />
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <Shield className="h-20 w-20 text-primary/30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence mode="wait">
        {showResults && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Risk Score + Summary */}
            <div className="grid gap-6 lg:grid-cols-3">
              <GlassCard glow className="flex flex-col items-center justify-center">
                <p className="text-sm font-medium text-muted mb-3">Risk Score</p>
                <RiskGauge score={MOCK_RESULTS.riskScore} level={MOCK_RESULTS.riskLevel} />
              </GlassCard>

              <GlassCard className="lg:col-span-2">
                <h3 className="text-sm font-semibold text-muted mb-4">Scan Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Scripts", value: MOCK_RESULTS.jsScripts, icon: <Code className="h-4 w-4" /> },
                    { label: "External Scripts", value: MOCK_RESULTS.externalScripts, icon: <ExternalLink className="h-4 w-4" /> },
                    { label: "Obfuscated", value: MOCK_RESULTS.obfuscated, icon: <AlertTriangle className="h-4 w-4" /> },
                    { label: "Hidden Iframes", value: MOCK_RESULTS.hiddenIframes, icon: <Eye className="h-4 w-4" /> },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-background/50 p-3 text-center">
                      <div className="flex items-center justify-center text-primary mb-1">{item.icon}</div>
                      <p className="text-xl font-bold text-text">{item.value}</p>
                      <p className="text-xs text-muted">{item.label}</p>
                    </div>
                  ))}
                </div>

                {/* Resources Chart */}
                <div className="mt-6">
                  <p className="text-xs font-medium text-muted mb-3">Resource Distribution</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={MOCK_RESULTS.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={{ stroke: "#1E293B" }} />
                      <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={{ stroke: "#1E293B" }} />
                      <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #1E293B", borderRadius: "0.75rem", color: "#F8FAFC" }} />
                      <Bar dataKey="value" fill="#7C3AED" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>

            {/* Threats Found */}
            <div>
              <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Threats Detected ({MOCK_RESULTS.indicators.length})
              </h3>
              <div className="space-y-3">
                {MOCK_RESULTS.indicators.map((indicator) => (
                  <ThreatCard
                    key={indicator.id}
                    category={indicator.category}
                    severity={indicator.severity}
                    title={indicator.title}
                    description={indicator.description}
                    evidence={indicator.evidence}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <GlowButton>
                <FileText className="h-4 w-4" />
                Generate Report
              </GlowButton>
              <GlowButton variant="secondary">
                <ArrowRight className="h-4 w-4" />
                Ask AI About Results
              </GlowButton>
              <GlowButton variant="ghost" onClick={() => { setShowResults(false); setUrl(""); }}>
                <RefreshCw className="h-4 w-4" />
                Scan Another URL
              </GlowButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
