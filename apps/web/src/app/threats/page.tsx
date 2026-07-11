"use client";

import { Fragment, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ShieldAlert,
  Eye,
  Ban,
} from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { PremiumStatCard } from "@/components/premium/PremiumStatCard";
import { PremiumChartCard } from "@/components/premium/PremiumChartCard";
import { cn } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
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

const threatDistribution = [
  { name: "Malware", value: 34, color: "#EF4444" },
  { name: "Phishing", value: 22, color: "#7C3AED" },
  { name: "JS Obfuscation", value: 18, color: "#F59E0B" },
  { name: "Hidden Iframes", value: 14, color: "#00E5FF" },
  { name: "Crypto Mining", value: 12, color: "#3B82F6" },
];

const securityTrends = [
  { month: "Jan", threats: 45, blocked: 42 },
  { month: "Feb", threats: 52, blocked: 48 },
  { month: "Mar", threats: 38, blocked: 36 },
  { month: "Apr", threats: 67, blocked: 61 },
  { month: "May", threats: 73, blocked: 70 },
  { month: "Jun", threats: 58, blocked: 55 },
  { month: "Jul", threats: 82, blocked: 76 },
  { month: "Aug", threats: 91, blocked: 85 },
  { month: "Sep", threats: 64, blocked: 60 },
  { month: "Oct", threats: 78, blocked: 72 },
  { month: "Nov", threats: 55, blocked: 52 },
  { month: "Dec", threats: 42, blocked: 40 },
];

const riskHeatmapData: Array<{ day: string; slots: number[] }> = [
  { day: "Mon", slots: [2, 5, 3, 8, 12, 4] },
  { day: "Tue", slots: [1, 3, 6, 5, 9, 3] },
  { day: "Wed", slots: [4, 7, 2, 11, 15, 6] },
  { day: "Thu", slots: [0, 2, 4, 6, 8, 2] },
  { day: "Fri", slots: [3, 6, 8, 14, 18, 7] },
  { day: "Sat", slots: [1, 1, 2, 3, 5, 1] },
  { day: "Sun", slots: [0, 1, 1, 2, 3, 1] },
];

const slotLabels = ["00-04", "04-08", "08-12", "12-16", "16-20", "20-24"];

const recentEvents = [
  { id: "e1", event: "Malware detected: JS.Agent.XX", severity: "critical" as const, time: "2 min ago", source: "example.com" },
  { id: "e2", event: "Phishing attempt blocked", severity: "high" as const, time: "8 min ago", source: "shop-site.io" },
  { id: "e3", event: "Obfuscated script flagged", severity: "high" as const, time: "15 min ago", source: "blog-app.dev" },
  { id: "e4", event: "Hidden iframe removed", severity: "medium" as const, time: "23 min ago", source: "api-service.cloud" },
  { id: "e5", event: "Crypto miner script blocked", severity: "critical" as const, time: "31 min ago", source: "news-portal.com" },
  { id: "e6", event: "User IP blocked (brute force)", severity: "medium" as const, time: "45 min ago", source: "admin panel" },
  { id: "e7", event: "Suspicious redirect detected", severity: "low" as const, time: "1 hr ago", source: "landing-page.io" },
  { id: "e8", event: "Outdated library alert", severity: "low" as const, time: "1.5 hr ago", source: "docs.app.dev" },
  { id: "e9", event: "SQL injection attempt blocked", severity: "critical" as const, time: "2 hr ago", source: "api-service.cloud" },
  { id: "e10", event: "XSS payload sanitized", severity: "high" as const, time: "2.5 hr ago", source: "example.com" },
];

function getHeatColor(value: number): string {
  if (value === 0) return "bg-surface/50";
  if (value <= 3) return "bg-success/20";
  if (value <= 6) return "bg-success/40";
  if (value <= 10) return "bg-warning/40";
  if (value <= 14) return "bg-orange-500/50";
  return "bg-danger/60";
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical": return "bg-danger/15 text-danger";
    case "high": return "bg-orange-500/15 text-orange-400";
    case "medium": return "bg-warning/15 text-warning";
    case "low": return "bg-success/15 text-success";
    default: return "bg-muted/15 text-muted";
  }
}

export default function ThreatsPage() {
  const [timeFilter, setTimeFilter] = useState<"24h" | "7d" | "30d" | "90d">("7d");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <SectionTitle
          title="Threat Dashboard"
          subtitle="Real-time threat monitoring and intelligence overview"
          align="left"
        />
        <div className="flex items-center gap-2">
          {(["24h", "7d", "30d", "90d"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeFilter(period)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                timeFilter === period
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted hover:text-text hover:bg-surface border border-transparent"
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: "Critical Threats", value: 4, icon: <ShieldAlert className="h-5 w-5" />, trend: "+2 since yesterday", trendUp: true, glowColor: "rgba(239,68,68,0.15)" },
          { label: "Active Threats", value: 12, icon: <AlertTriangle className="h-5 w-5" />, trend: "-3 from last week", trendUp: false, glowColor: "rgba(245,158,11,0.15)" },
          { label: "Recent Detections", value: 28, icon: <Eye className="h-5 w-5" />, trend: "+12 this week", trendUp: true, glowColor: "rgba(0,229,255,0.15)" },
          { label: "Blocked Users", value: 6, icon: <Ban className="h-5 w-5" />, trend: "+1 new block", trendUp: true, glowColor: "rgba(124,58,237,0.15)" },
        ].map((stat, i) => (
          <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={fadeInUp}>
            <PremiumStatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeInUp}>
          <PremiumChartCard title="Threat Distribution">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={threatDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {threatDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0B1120",
                    border: "1px solid #1F2937",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {threatDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted">{item.name}</span>
                  <span className="text-xs font-bold text-text">{item.value}</span>
                </div>
              ))}
            </div>
          </PremiumChartCard>
        </motion.div>

        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeInUp}>
          <PremiumChartCard title="Security Trends">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={securityTrends}>
                <defs>
                  <linearGradient id="threatsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="blockedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={{ stroke: "#1E293B" }} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={{ stroke: "#1E293B" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0B1120",
                    border: "1px solid #1F2937",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                />
                <Area type="monotone" dataKey="threats" stroke="#EF4444" fill="url(#threatsGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="blocked" stroke="#22C55E" fill="url(#blockedGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-6 rounded-full bg-danger" />
                <span className="text-xs text-muted">Threats</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-6 rounded-full bg-success" />
                <span className="text-xs text-muted">Blocked</span>
              </div>
            </div>
          </PremiumChartCard>
        </motion.div>

        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeInUp}>
          <PremiumChartCard title="Recent Events">
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
              {recentEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-start gap-3 rounded-xl border border-border/30 p-3 hover:border-border/60 transition-colors"
                >
                  <div className={cn("mt-0.5 h-2 w-2 shrink-0 rounded-full", getSeverityColor(evt.severity))} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-text truncate">{evt.event}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted">{evt.time}</span>
                      <span className="text-[10px] text-muted/50">•</span>
                      <span className="text-[10px] text-primary/70">{evt.source}</span>
                    </div>
                  </div>
                  <span className={cn(
                    "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase",
                    getSeverityColor(evt.severity)
                  )}>
                    {evt.severity}
                  </span>
                </div>
              ))}
            </div>
          </PremiumChartCard>
        </motion.div>
      </div>

      <motion.div custom={7} initial="hidden" animate="visible" variants={fadeInUp}>
        <PremiumChartCard title="Risk Heatmap — Threat Activity by Day & Time">
          <div className="overflow-x-auto">
            <div className="min-w-[500px]">
              <div className="grid gap-1" style={{ gridTemplateColumns: `60px repeat(${slotLabels.length}, 1fr)` }}>
                <div />
                {slotLabels.map((label) => (
                  <div key={label} className="text-center text-[10px] text-muted font-medium pb-1">
                    {label}
                  </div>
                ))}

                {riskHeatmapData.map((row) => (
                  <Fragment key={row.day}>
                    <div className="text-xs text-muted flex items-center font-medium">
                      {row.day}
                    </div>
                    {row.slots.map((value, idx) => (
                      <motion.div
                        key={`${row.day}-${idx}`}
                        whileHover={{ scale: 1.15 }}
                        className={cn(
                          "aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold cursor-default transition-colors",
                          getHeatColor(value),
                          value > 0 ? "text-text" : "text-muted/30"
                        )}
                        title={`${row.day} ${slotLabels[idx]}: ${value} threats`}
                      >
                        {value}
                      </motion.div>
                    ))}
                  </Fragment>
                ))}
              </div>

              <div className="flex items-center justify-center gap-3 mt-4">
                <span className="text-[10px] text-muted">Low</span>
                <div className="flex gap-0.5">
                  {["bg-surface/50", "bg-success/20", "bg-success/40", "bg-warning/40", "bg-orange-500/50", "bg-danger/60"].map((cls, i) => (
                    <div key={i} className={cn("h-4 w-4 rounded-sm", cls)} />
                  ))}
                </div>
                <span className="text-[10px] text-muted">High</span>
              </div>
            </div>
          </div>
        </PremiumChartCard>
      </motion.div>
    </div>
  );
}
