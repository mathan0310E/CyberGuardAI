"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Check,
  Trophy,
  Shield,
  Globe,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { PremiumBadge } from "@/components/premium/PremiumBadge";
import { PremiumChartCard } from "@/components/premium/PremiumChartCard";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
    border: "1px solid #1F293B",
    borderRadius: "12px",
    color: "#F8FAFC",
  },
};

interface WebsiteData {
  id: string;
  domain: string;
  securityHeaders: number;
  malwareRisk: number;
  sslConfig: number;
  jsComplexity: number;
  externalResources: number;
  overallScore: number;
}

const WEBSITES: WebsiteData[] = [
  {
    id: "1",
    domain: "example.com",
    securityHeaders: 92,
    malwareRisk: 95,
    sslConfig: 88,
    jsComplexity: 78,
    externalResources: 85,
    overallScore: 88,
  },
  {
    id: "2",
    domain: "shop.example.org",
    securityHeaders: 74,
    malwareRisk: 82,
    sslConfig: 91,
    jsComplexity: 62,
    externalResources: 70,
    overallScore: 76,
  },
  {
    id: "3",
    domain: "blog.example.net",
    securityHeaders: 85,
    malwareRisk: 90,
    sslConfig: 82,
    jsComplexity: 88,
    externalResources: 72,
    overallScore: 83,
  },
  {
    id: "4",
    domain: "api.example.com",
    securityHeaders: 96,
    malwareRisk: 98,
    sslConfig: 95,
    jsComplexity: 92,
    externalResources: 94,
    overallScore: 95,
  },
];

const METRICS = [
  { key: "securityHeaders", label: "Security Headers" },
  { key: "malwareRisk", label: "Malware Risk" },
  { key: "sslConfig", label: "SSL Config" },
  { key: "jsComplexity", label: "JS Complexity" },
  { key: "externalResources", label: "External Resources" },
  { key: "overallScore", label: "Overall Score" },
] as const;

const CHART_COLORS = ["#00E5FF", "#7C3AED", "#22C55E", "#F59E0B"];

export default function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(["1", "4"]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const selectedSites = WEBSITES.filter((w) => selectedIds.includes(w.id));

  const radarData = METRICS.filter((m) => m.key !== "overallScore").map((metric) => {
    const entry: Record<string, string | number> = { metric: metric.label };
    selectedSites.forEach((site) => {
      entry[site.domain] = site[metric.key];
    });
    return entry;
  });

  const barData = selectedSites.map((site) => ({
    name: site.domain,
    score: site.overallScore,
  }));

  const findWinner = (metricKey: (typeof METRICS)[number]["key"]) => {
    if (selectedSites.length === 0) return null;
    let bestIdx = 0;
    selectedSites.forEach((site, idx) => {
      if (site[metricKey] > (selectedSites[bestIdx]?.[metricKey] ?? 0)) {
        bestIdx = idx;
      }
    });
    return selectedSites[bestIdx]?.domain ?? null;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-text">Competitor Comparison</h1>
          <PremiumBadge />
        </div>
        <p className="mt-1 text-muted">
          Compare security metrics across multiple websites side by side
        </p>
      </motion.div>

      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeInUp}>
        <GlassCard>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-sm font-medium text-muted shrink-0">
              Select 2-4 websites to compare:
            </label>
            <div className="flex flex-wrap gap-2">
              {WEBSITES.map((site) => {
                const selected = selectedIds.includes(site.id);
                return (
                  <button
                    key={site.id}
                    onClick={() => toggleSelect(site.id)}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all",
                      selected
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border/50 bg-surface/30 text-muted hover:border-border-light hover:bg-surface/60"
                    )}
                  >
                    {selected ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Globe className="h-3.5 w-3.5" />
                    )}
                    {site.domain}
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-muted shrink-0">
              {selectedIds.length}/4 selected
            </span>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6 mb-6">
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeInUp}>
          <PremiumChartCard title="Radar Comparison">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1E293B" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: "#94A3B8", fontSize: 10 }}
                  axisLine={{ stroke: "#1E293B" }}
                />
                {selectedSites.map((site, i) => (
                  <Radar
                    key={site.id}
                    name={site.domain}
                    dataKey={site.domain}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
                <Legend
                  wrapperStyle={{ color: "#94A3B8", fontSize: 12 }}
                />
                <Tooltip {...TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </PremiumChartCard>
        </motion.div>

        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeInUp}>
          <PremiumChartCard title="Overall Score Comparison">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  axisLine={{ stroke: "#1E293B" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  axisLine={{ stroke: "#1E293B" }}
                  width={130}
                />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="score" radius={[0, 8, 8, 0]} maxBarSize={36}>
                  {barData.map((entry, i) => (
                    <rect
                      key={entry.name}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </PremiumChartCard>
        </motion.div>
      </div>

      <motion.div custom={3} initial="hidden" animate="visible" variants={fadeInUp}>
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-muted">Detailed Metric Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                    Metric
                  </th>
                  {selectedSites.map((site) => (
                    <th
                      key={site.id}
                      className="px-4 py-3 text-center text-xs font-semibold text-muted uppercase tracking-wider"
                    >
                      {site.domain}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {METRICS.map((metric) => {
                  const winner = findWinner(metric.key);
                  return (
                    <tr key={metric.key} className="transition-colors hover:bg-surface/50">
                      <td className="px-4 py-3 font-medium text-text">{metric.label}</td>
                      {selectedSites.map((site) => {
                        const val = site[metric.key];
                        const isWinner = winner === site.domain && selectedSites.length > 1;
                        return (
                          <td key={site.id} className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span
                                className={cn(
                                  "text-sm font-bold",
                                  val >= 80
                                    ? "text-success"
                                    : val >= 60
                                    ? "text-warning"
                                    : "text-danger"
                                )}
                              >
                                {val}
                              </span>
                              {isWinner && (
                                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {selectedSites.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border/30">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Category Winners
                </h4>
              </div>
              <div className="flex flex-wrap gap-3">
                {METRICS.map((metric) => {
                  const winner = findWinner(metric.key);
                  return (
                    <div
                      key={metric.key}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/30 bg-surface/30 text-xs"
                    >
                      <Trophy className="h-3 w-3 text-amber-400" />
                      <span className="text-muted">{metric.label}:</span>
                      <span className="font-semibold text-primary">{winner}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
