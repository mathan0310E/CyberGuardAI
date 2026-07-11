"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
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
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
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

interface ScanResult {
  _id: string;
  url: string;
  domain: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: ScanStatus;
  malwareIndicators: MalwareIndicator[];
  jsAnalysis: Record<string, unknown> | null;
  htmlAnalysis: Record<string, unknown> | null;
  threatIntel: Record<string, unknown>[];
  technologies: Record<string, unknown>[];
  aiAnalysis: Record<string, unknown> | null;
}

export default function ScannerPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Sign in required", { description: "Please sign in or register to use the scanner." });
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showResults, setShowResults] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const startScan = useCallback(async () => {
    if (!url.trim()) return;

    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
      setUrl(targetUrl);
    }

    setIsScanning(true);
    setShowResults(false);
    setCurrentStep(0);
    setScanProgress(0);
    setScanResult(null);

    try {
      const scan = await api.createScan(targetUrl) as unknown as ScanResult;
      setScanResult(scan);
      toast.success("Scan started", { description: `Analyzing ${targetUrl}` });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to start scan";
      toast.error("Scan failed", { description: msg });
      setIsScanning(false);
    }
  }, [url]);

  useEffect(() => {
    if (!isScanning || !scanResult?._id) return;

    if (currentStep >= SCAN_STEPS.length) {
      const pollInterval = setInterval(async () => {
        try {
          const updated = await api.getScan(scanResult._id) as unknown as ScanResult;
          if (updated.status === "completed" || updated.status === "failed") {
            setScanResult(updated);
            setIsScanning(false);
            setShowResults(true);
            setScanProgress(100);
            clearInterval(pollInterval);
            if (updated.status === "completed") {
              toast.success("Scan complete", {
                description: `Risk score: ${updated.riskScore}/100 (${updated.riskLevel})`,
              });
            } else {
              toast.error("Scan failed", { description: "The scan encountered an error." });
            }
          }
        } catch {
          // Keep polling
        }
      }, 2000);

      return () => clearInterval(pollInterval);
    }

    setScanProgress(Math.round(((currentStep + 1) / SCAN_STEPS.length) * 100));

    const timer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 800);

    return () => clearTimeout(timer);
  }, [isScanning, currentStep, scanResult?._id]);

  const handleGenerateReport = useCallback(async () => {
    if (!scanResult?._id) return;
    setIsGeneratingReport(true);
    try {
      const report = await api.createReport(scanResult._id);
      toast.success("Report generated", { description: "Your PDF report is ready." });
      const downloadUrl = api.getReportDownloadUrl((report as unknown as { _id: string })._id);
      window.open(downloadUrl, "_blank");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to generate report";
      toast.error("Report generation failed", { description: msg });
    } finally {
      setIsGeneratingReport(false);
    }
  }, [scanResult?._id]);

  const steps = SCAN_STEPS.map((s, i) => ({
    label: SCAN_STATUS_LABELS[s],
    status: i < currentStep ? ("completed" as const) : i === currentStep ? ("active" as const) : ("pending" as const),
  }));

  const jsAnalysis = scanResult?.jsAnalysis as Record<string, unknown> | null;
  const htmlAnalysis = scanResult?.htmlAnalysis as Record<string, unknown> | null;

  const chartData = [
    { name: "HTML", value: (htmlAnalysis?.["formsCount"] as number ?? 0) + (htmlAnalysis?.["linksCount"] as number ?? 0) + (htmlAnalysis?.["imagesCount"] as number ?? 0) },
    { name: "JS", value: (jsAnalysis?.["totalScripts"] as number ?? 0) },
    { name: "External", value: (jsAnalysis?.["externalScripts"] as number ?? 0) },
    { name: "Obfuscated", value: (jsAnalysis?.["obfuscatedCount"] as number ?? 0) },
  ];

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
                onKeyDown={(e) => e.key === "Enter" && !isScanning && startScan()}
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
                    {currentStep < SCAN_STEPS.length && SCAN_STEPS[currentStep] ? ` — ${SCAN_STATUS_LABELS[SCAN_STEPS[currentStep]]}` : ""}
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
        {showResults && scanResult && (
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
                <RiskGauge score={scanResult.riskScore} level={scanResult.riskLevel} />
              </GlassCard>

              <GlassCard className="lg:col-span-2">
                <h3 className="text-sm font-semibold text-muted mb-4">Scan Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Scripts", value: (jsAnalysis?.["totalScripts"] as number) ?? 0, icon: <Code className="h-4 w-4" /> },
                    { label: "External Scripts", value: (jsAnalysis?.["externalScripts"] as number) ?? 0, icon: <ExternalLink className="h-4 w-4" /> },
                    { label: "Obfuscated", value: (jsAnalysis?.["obfuscatedCount"] as number) ?? 0, icon: <AlertTriangle className="h-4 w-4" /> },
                    { label: "Hidden Iframes", value: ((htmlAnalysis?.["hiddenIframes"] as unknown[])?.length) ?? 0, icon: <Eye className="h-4 w-4" /> },
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
                    <BarChart data={chartData}>
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

            {/* AI Summary */}
            {scanResult.aiAnalysis && (
              <GlassCard>
                <h3 className="text-sm font-semibold text-muted mb-3">AI Analysis</h3>
                <p className="text-sm text-text leading-relaxed">
                  {(scanResult.aiAnalysis as Record<string, unknown>)["executiveSummary"] as string}
                </p>
                {((scanResult.aiAnalysis as Record<string, unknown>)["recommendations"] as string[])?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-muted mb-2">Recommendations</p>
                    <ul className="space-y-1">
                      {((scanResult.aiAnalysis as Record<string, unknown>)["recommendations"] as string[]).map((rec, i) => (
                        <li key={i} className="text-sm text-muted flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </GlassCard>
            )}

            {/* Threats Found */}
            {scanResult.malwareIndicators.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Threats Detected ({scanResult.malwareIndicators.length})
                </h3>
                <div className="space-y-3">
                  {scanResult.malwareIndicators.map((indicator) => (
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
            )}

            {/* Threat Intel */}
            {scanResult.threatIntel.length > 0 && (
              <GlassCard>
                <h3 className="text-sm font-semibold text-muted mb-3">Threat Intelligence</h3>
                <div className="space-y-2">
                  {scanResult.threatIntel.map((ti, i) => {
                    const tiData = ti as Record<string, unknown>;
                    return (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div>
                          <p className="text-sm font-medium text-text">{String(tiData["source"])}</p>
                          <p className="text-xs text-muted">{String(tiData["details"])}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          tiData["status"] === "clean" ? "bg-success/20 text-success" :
                          tiData["status"] === "suspicious" ? "bg-warning/20 text-warning" :
                          tiData["status"] === "malicious" ? "bg-danger/20 text-danger" :
                          "bg-muted/20 text-muted"
                        }`}>
                          {String(tiData["status"])}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <GlowButton onClick={handleGenerateReport} disabled={isGeneratingReport}>
                <FileText className="h-4 w-4" />
                {isGeneratingReport ? "Generating..." : "Generate Report"}
              </GlowButton>
              <GlowButton variant="secondary" onClick={() => window.location.href = `/chat?scan=${scanResult._id}`}>
                <ArrowRight className="h-4 w-4" />
                Ask AI About Results
              </GlowButton>
              <GlowButton variant="ghost" onClick={() => { setShowResults(false); setScanResult(null); setUrl(""); }}>
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
