"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Trash2,
  Search,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { RISK_COLORS, RISK_LABELS } from "@cyberguard/shared";
import { api } from "@/lib/api";
import type { RiskLevel } from "@cyberguard/types";
import { cn } from "@/lib/utils";

interface Report {
  _id: string;
  title: string;
  url: string;
  domain: string;
  riskScore: number;
  riskLevel: RiskLevel;
  generatedAt: string;
  findingsCount: number;
  summary: string;
}

const SEVERITY_ICONS = {
  safe: CheckCircle,
  low: CheckCircle,
  medium: AlertTriangle,
  high: AlertTriangle,
  critical: Shield,
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<RiskLevel | "all">("all");

  useEffect(() => {
    api.listReports()
      .then((result) => setReports(result.data as unknown as Report[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = useCallback((report: Report) => {
    const url = api.getReportDownloadUrl(report._id);
    window.open(url, "_blank");
    toast.success("Downloading report", { description: `PDF for ${report.domain}` });
  }, []);

  const handleDelete = useCallback(async (report: Report) => {
    try {
      await api.deleteReport(report._id);
      setReports((prev) => prev.filter((r) => r._id !== report._id));
      toast.success("Report deleted");
    } catch {
      toast.error("Failed to delete report");
    }
  }, []);

  const filtered = reports.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterLevel === "all" || r.riskLevel === filterLevel;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-text">Reports</h1>
        <p className="mt-1 text-muted">View, download, and manage your scan reports</p>
      </motion.div>

      {/* Search + Filter */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports..."
            className="w-full rounded-xl bg-surface border border-border pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "critical", "high", "medium", "low", "safe"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-medium transition-all",
                filterLevel === level
                  ? "bg-gradient-to-r from-primary to-[#00B4D8] text-[#07090D] font-semibold"
                  : "bg-surface border border-border text-muted hover:text-text hover:border-primary/30"
              )}
            >
              {level === "all" ? "All" : RISK_LABELS[level]}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Reports Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((report, i) => {
          const SeverityIcon = SEVERITY_ICONS[report.riskLevel];
          return (
            <motion.div
              key={report._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard hover className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${RISK_COLORS[report.riskLevel]}20` }}
                    >
                      <SeverityIcon className="h-4 w-4" style={{ color: RISK_COLORS[report.riskLevel] }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">{report.domain}</p>
                      <p className="text-xs text-muted truncate max-w-[180px]">{report.url}</p>
                    </div>
                  </div>
                  <span
                    className="text-lg font-bold"
                    style={{ color: RISK_COLORS[report.riskLevel] }}
                  >
                    {report.riskScore}
                  </span>
                </div>

                <p className="text-sm text-muted mb-4 flex-1">{report.summary}</p>

                <div className="flex items-center justify-between text-xs text-muted border-t border-border pt-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(report.generatedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {report.findingsCount} findings
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDownload(report)}
                      className="p-1.5 rounded-lg hover:bg-surface text-muted hover:text-primary transition-colors"
                      title="Download PDF"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(report)}
                      className="p-1.5 rounded-lg hover:bg-surface text-muted hover:text-danger transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-muted/30 mx-auto mb-4" />
          <p className="text-muted">No reports found.</p>
        </div>
      )}
    </div>
  );
}
