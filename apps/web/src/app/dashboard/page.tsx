"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Scan,
  TrendingUp,
  ArrowRight,
  Clock,
  FileText,
  MessageSquare,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatsCard } from "@/components/ui/StatsCard";
import { RiskGauge } from "@/components/ui/RiskGauge";
import { GlowButton } from "@/components/ui/GlowButton";
import { THREAT_CATEGORY_LABELS, RISK_COLORS } from "@cyberguard/shared";
import {
  MOCK_RECENT_SCANS,
  MOCK_THREAT_FEED,
  MOCK_RISK_CHART_DATA,
  MOCK_THREAT_DISTRIBUTION,
} from "@/lib/mock-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const PIE_COLORS = ["#7C3AED", "#A855F7", "#38BDF8", "#F59E0B", "#EF4444", "#22C55E"];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-text">Dashboard</h1>
        <p className="mt-1 text-muted">Overview of your security scanning activity</p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: "Total Scans", value: "12,847", icon: <Scan className="h-5 w-5" />, trend: "+12% this week", trendUp: true },
          { label: "Threats Detected", value: "3,291", icon: <AlertTriangle className="h-5 w-5" />, trend: "+5% this week", trendUp: false },
          { label: "Clean Sites", value: "9,556", icon: <CheckCircle className="h-5 w-5" />, trend: "+8% this week", trendUp: true },
          { label: "Avg Risk Score", value: "24", icon: <TrendingUp className="h-5 w-5" />, trend: "-3% this week", trendUp: true },
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
            <RiskGauge score={24} level="low" size="lg" />
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
            <h3 className="text-sm font-semibold text-muted mb-4">Risk Score Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={MOCK_RISK_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={{ stroke: "#1E293B" }} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={{ stroke: "#1E293B" }} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #1E293B", borderRadius: "0.75rem", color: "#F8FAFC" }} />
                <Bar dataKey="value" fill="#7C3AED" radius={[4, 4, 0, 0]} maxBarSize={40} />
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
              {MOCK_RECENT_SCANS.map((scan) => (
                <Link
                  key={scan.id}
                  href={`/scanner?id=${scan.id}`}
                  className="flex items-center justify-between rounded-xl border border-border p-3 transition-all hover:border-primary/30 hover:bg-surface/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: RISK_COLORS[scan.riskLevel] }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text truncate">{scan.domain}</p>
                      <p className="text-xs text-muted">{scan.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-muted hidden sm:block">
                      {scan.threatsFound} threat{scan.threatsFound !== 1 ? "s" : ""}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: RISK_COLORS[scan.riskLevel] }}
                    >
                      {scan.riskScore}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Threat Feed */}
        <motion.div custom={7} initial="hidden" animate="visible" variants={fadeInUp}>
          <GlassCard>
            <h3 className="text-sm font-semibold text-muted mb-4">Live Threat Feed</h3>
            <div className="space-y-3">
              {MOCK_THREAT_FEED.map((threat) => (
                <div key={threat.id} className="flex items-start gap-3">
                  <div
                    className="mt-1 h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: RISK_COLORS[threat.severity] }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text">
                      {THREAT_CATEGORY_LABELS[threat.category]}
                    </p>
                    <p className="text-xs text-muted truncate">{threat.domain}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-muted" />
                      <span className="text-xs text-muted">{threat.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Threat Distribution */}
      <motion.div custom={8} initial="hidden" animate="visible" variants={fadeInUp} className="mt-6">
        <GlassCard>
          <h3 className="text-sm font-semibold text-muted mb-4">Threat Distribution</h3>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={MOCK_THREAT_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {MOCK_THREAT_DISTRIBUTION.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #1E293B", borderRadius: "0.75rem", color: "#F8FAFC" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 min-w-[200px]">
              {MOCK_THREAT_DISTRIBUTION.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-sm text-muted">{item.name}</span>
                  <span className="ml-auto text-sm font-medium text-text">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
