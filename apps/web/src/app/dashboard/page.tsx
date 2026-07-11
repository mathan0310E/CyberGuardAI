"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Scan,
  TrendingUp,
  ArrowRight,
  FileText,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatsCard } from "@/components/ui/StatsCard";
import { RiskGauge } from "@/components/ui/RiskGauge";
import { GlowButton } from "@/components/ui/GlowButton";
import { THREAT_CATEGORY_LABELS, RISK_COLORS } from "@cyberguard/shared";
import { api } from "@/lib/api";
import type { RiskLevel } from "@cyberguard/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const PIE_COLORS = ["#00E5FF", "#7C3AED", "#3B82F6", "#F59E0B", "#EF4444", "#22C55E"];

interface DashboardData {
  totalScans: number;
  completedScans: number;
  malwareDetected: number;
  cleanSites: number;
  averageRiskScore: number;
  recentScans: Array<{
    _id: string;
    url: string;
    domain: string;
    riskScore: number;
    riskLevel: RiskLevel;
    status: string;
    malwareIndicators: unknown[];
  }>;
  threatDistribution: Array<{ category: string; count: number }>;
  riskOverTime: Array<{ date: string; averageScore: number; scanCount: number }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats()
      .then((stats) => setData(stats as unknown as DashboardData))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const stats = data ?? {
    totalScans: 0, completedScans: 0, malwareDetected: 0, cleanSites: 0,
    averageRiskScore: 0, recentScans: [], threatDistribution: [], riskOverTime: [],
  };

  const avgRiskLevel: RiskLevel = stats.averageRiskScore >= 80 ? "critical" :
    stats.averageRiskScore >= 60 ? "high" :
    stats.averageRiskScore >= 40 ? "medium" :
    stats.averageRiskScore >= 20 ? "low" : "safe";

  const chartData = stats.riskOverTime.length > 0
    ? stats.riskOverTime.map((e) => ({ name: e.date.slice(5), value: e.averageScore }))
    : [
        { name: "Mon", value: 0 }, { name: "Tue", value: 0 }, { name: "Wed", value: 0 },
        { name: "Thu", value: 0 }, { name: "Fri", value: 0 }, { name: "Sat", value: 0 }, { name: "Sun", value: 0 },
      ];

  const threatChartData = stats.threatDistribution.map((t) => ({
    name: THREAT_CATEGORY_LABELS[t.category as keyof typeof THREAT_CATEGORY_LABELS] ?? t.category,
    value: t.count,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-text">Dashboard</h1>
        <p className="mt-1 text-muted">Overview of your security scanning activity</p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: "Total Scans", value: stats.totalScans.toLocaleString(), icon: <Scan className="h-5 w-5" /> },
          { label: "Threats Detected", value: stats.malwareDetected.toLocaleString(), icon: <AlertTriangle className="h-5 w-5" /> },
          { label: "Clean Sites", value: stats.cleanSites.toLocaleString(), icon: <CheckCircle className="h-5 w-5" /> },
          { label: "Avg Risk Score", value: stats.averageRiskScore.toString(), icon: <TrendingUp className="h-5 w-5" /> },
        ].map((stat, i) => (
          <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={fadeInUp}>
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Risk Gauge + Quick Actions */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeInUp}>
          <GlassCard glow className="flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-muted mb-4">Overall Security Score</p>
            <RiskGauge score={stats.averageRiskScore} level={avgRiskLevel} size="lg" />
            <div className="mt-6 grid grid-cols-2 gap-3 w-full">
              <Link href="/scanner">
                <GlowButton variant="primary" className="w-full" size="sm">
                  <Scan className="h-4 w-4" /> New Scan
                </GlowButton>
              </Link>
              <Link href="/reports">
                <GlowButton variant="secondary" className="w-full" size="sm">
                  <FileText className="h-4 w-4" /> Reports
                </GlowButton>
              </Link>
              <Link href="/chat">
                <GlowButton variant="secondary" className="w-full" size="sm">
                  <MessageSquare className="h-4 w-4" /> AI Chat
                </GlowButton>
              </Link>
              <Link href="/settings">
                <GlowButton variant="ghost" className="w-full" size="sm">
                  <Shield className="h-4 w-4" /> Settings
                </GlowButton>
              </Link>
            </div>
          </GlassCard>
        </motion.div>

        {/* Risk Trend Chart */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeInUp} className="lg:col-span-2">
          <GlassCard>
            <h3 className="text-sm font-semibold text-muted mb-4">Risk Score Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={{ stroke: "#1E293B" }} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={{ stroke: "#1E293B" }} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #1E293B", borderRadius: "0.75rem", color: "#F8FAFC" }} />
                <Bar dataKey="value" fill="#00E5FF" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mt-6">
        {/* Recent Scans */}
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeInUp} className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted">Recent Scans</h3>
              <Link href="/reports" className="text-xs text-primary hover:text-primary-light transition-colors flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {stats.recentScans.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">No scans yet. Start your first scan!</p>
              ) : (
                stats.recentScans.map((scan) => (
                  <Link
                    key={scan._id}
                    href="/scanner"
                    className="flex items-center justify-between rounded-xl border border-border p-3 transition-all hover:border-primary/30 hover:bg-surface/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: RISK_COLORS[scan.riskLevel] }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">{scan.domain}</p>
                        <p className="text-xs text-muted truncate">{scan.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs text-muted hidden sm:block">
                        {scan.malwareIndicators.length} threat{scan.malwareIndicators.length !== 1 ? "s" : ""}
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: RISK_COLORS[scan.riskLevel] }}
                      >
                        {scan.riskScore}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Threat Feed */}
        <motion.div custom={7} initial="hidden" animate="visible" variants={fadeInUp}>
          <GlassCard>
            <h3 className="text-sm font-semibold text-muted mb-4">Threat Distribution</h3>
            {threatChartData.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">No threats detected yet.</p>
            ) : (
              <div className="space-y-3">
                {threatChartData.slice(0, 6).map((threat, i) => (
                  <div key={threat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-sm text-muted">{threat.name}</span>
                    </div>
                    <span className="text-sm font-medium text-text">{threat.value}</span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
