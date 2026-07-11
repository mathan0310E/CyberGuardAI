"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Target,
  Award,
  AlertTriangle,
  ArrowUp,
  ChevronDown,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumStatCard } from "@/components/premium/PremiumStatCard";
import { PremiumChartCard } from "@/components/premium/PremiumChartCard";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#0B1120",
    border: "1px solid #1F2937",
    borderRadius: "12px",
    color: "#F8FAFC",
  },
};

const DOMAINS = [
  { value: "example.com", label: "example.com" },
  { value: "shop.example.org", label: "shop.example.org" },
  { value: "blog.example.net", label: "blog.example.net" },
  { value: "api.example.com", label: "api.example.com" },
];

function generateScoreData(): Array<{ date: string; score: number }> {
  const data = [];
  let score = 58;
  const base = new Date(2026, 0, 11);
  for (let i = 29; i >= 0; i--) {
    const date = new Date(base);
    date.setDate(date.getDate() - i);
    const change = Math.floor(Math.random() * 7) - 3;
    score = Math.max(30, Math.min(95, score + change));
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      score,
    });
  }
  return data;
}

function generateThreatData(): Array<{ date: string; threats: number }> {
  const data = [];
  const base = new Date(2026, 0, 11);
  for (let i = 29; i >= 0; i--) {
    const date = new Date(base);
    date.setDate(date.getDate() - i);
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      threats: Math.floor(Math.random() * 12) + 1,
    });
  }
  return data;
}

function generateMalwareData(): Array<{ date: string; detections: number }> {
  const data = [];
  let detections = 3;
  const base = new Date(2026, 0, 11);
  for (let i = 29; i >= 0; i--) {
    const date = new Date(base);
    date.setDate(date.getDate() - i);
    const change = Math.floor(Math.random() * 3) - 1;
    detections = Math.max(0, Math.min(15, detections + change));
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      detections,
    });
  }
  return data;
}

const SECURITY_IMPROVEMENTS = [
  { date: "Jan 15", improvement: "Added Content-Security-Policy header", impact: "+5 points" },
  { date: "Jan 22", improvement: "Upgraded TLS to 1.3", impact: "+3 points" },
  { date: "Feb 3", improvement: "Removed deprecated jQuery library", impact: "+4 points" },
  { date: "Feb 14", improvement: "Fixed XSS vulnerability in search form", impact: "+8 points" },
  { date: "Mar 1", improvement: "Implemented Subresource Integrity", impact: "+3 points" },
  { date: "Mar 12", improvement: "Blocked malicious third-party script", impact: "+6 points" },
  { date: "Mar 28", improvement: "Hardened HTTP security headers", impact: "+4 points" },
  { date: "Apr 5", improvement: "Removed exposed API keys from client code", impact: "+7 points" },
];

export default function TimelinePage() {
  const [selectedDomain, setSelectedDomain] = useState("example.com");

  const scoreData = useState(generateScoreData)[0];
  const threatData = useState(generateThreatData)[0];
  const malwareData = useState(generateMalwareData)[0];

  const currentScore = scoreData[scoreData.length - 1]?.score ?? 0;
  const bestScore = Math.max(...scoreData.map((d) => d.score));
  const worstScore = Math.min(...scoreData.map((d) => d.score));
  const avgScore = Math.round(scoreData.reduce((sum, d) => sum + d.score, 0) / scoreData.length);
  const totalImprovements = SECURITY_IMPROVEMENTS.length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-text">Security Score Timeline</h1>
        <p className="mt-1 text-muted">
          Track how your security posture evolves over time
        </p>
      </motion.div>

      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeInUp} className="mb-6">
        <GlassCard>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-sm font-medium text-muted">Select Website:</label>
            <div className="relative flex-1 max-w-xs">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full h-11 px-4 pr-10 rounded-xl bg-surface border border-border text-text text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
              >
                {DOMAINS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
            </div>
            <span className="text-xs text-muted">Showing 30-day history for {selectedDomain}</span>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        {[
          {
            label: "Current Score",
            value: currentScore,
            icon: <Target className="h-5 w-5" />,
            trend: "+3 this week",
            trendUp: true,
          },
          {
            label: "Best Score",
            value: bestScore,
            icon: <Award className="h-5 w-5" />,
            trend: "All time",
            trendUp: true,
          },
          {
            label: "Worst Score",
            value: worstScore,
            icon: <AlertTriangle className="h-5 w-5" />,
            trend: "All time",
            trendUp: false,
          },
          {
            label: "Average Score",
            value: avgScore,
            icon: <TrendingUp className="h-5 w-5" />,
            trend: "30-day avg",
            trendUp: avgScore > 50,
          },
          {
            label: "Total Improvements",
            value: totalImprovements,
            icon: <ArrowUp className="h-5 w-5" />,
            trend: "Actions taken",
            trendUp: true,
          },
        ].map((stat, i) => (
          <motion.div key={stat.label} custom={i + 1} initial="hidden" animate="visible" variants={fadeInUp}>
            <PremiumStatCard
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              trendUp={stat.trendUp}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-1 mb-6">
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeInUp}>
          <PremiumChartCard title="Risk Score Trend (30 Days)">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  axisLine={{ stroke: "#1E293B" }}
                  interval={2}
                />
                <YAxis
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  axisLine={{ stroke: "#1E293B" }}
                  domain={[0, 100]}
                />
                <Tooltip {...TOOLTIP_STYLE} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#00E5FF"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "#00E5FF", stroke: "#0B1120", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </PremiumChartCard>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <motion.div custom={7} initial="hidden" animate="visible" variants={fadeInUp}>
          <PremiumChartCard title="Threat Count Over Time">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={threatData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  axisLine={{ stroke: "#1E293B" }}
                  interval={2}
                />
                <YAxis
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  axisLine={{ stroke: "#1E293B" }}
                />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar
                  dataKey="threats"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </PremiumChartCard>
        </motion.div>

        <motion.div custom={8} initial="hidden" animate="visible" variants={fadeInUp}>
          <PremiumChartCard title="Malware Detections Trend">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={malwareData}>
                <defs>
                  <linearGradient id="malwareGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  axisLine={{ stroke: "#1E293B" }}
                  interval={2}
                />
                <YAxis
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  axisLine={{ stroke: "#1E293B" }}
                />
                <Tooltip {...TOOLTIP_STYLE} />
                <Area
                  type="monotone"
                  dataKey="detections"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fill="url(#malwareGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </PremiumChartCard>
        </motion.div>
      </div>

      <motion.div custom={9} initial="hidden" animate="visible" variants={fadeInUp}>
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <ArrowUp className="h-4 w-4 text-success" />
            <h3 className="text-sm font-semibold text-muted">Security Improvements</h3>
          </div>
          <div className="space-y-3">
            {SECURITY_IMPROVEMENTS.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-xl border border-border/30 bg-surface/30 transition-all hover:border-success/20 hover:bg-success/5"
              >
                <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text">{item.improvement}</p>
                  <p className="text-xs text-muted">{item.date}</p>
                </div>
                <span className="text-xs font-bold text-success shrink-0">{item.impact}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
