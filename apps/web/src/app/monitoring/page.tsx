"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Plus,
  Pause,
  Play,
  Trash2,
  Clock,
  Activity,
  AlertTriangle,
  X,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { cn } from "@/lib/utils";
import { PremiumStatCard } from "@/components/premium/PremiumStatCard";
import { PremiumBadge } from "@/components/premium/PremiumBadge";
import { StatusBadge } from "@/components/premium/StatusBadge";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

type MonitoringStatus = "active" | "paused" | "error";

interface MonitoredSite {
  id: string;
  domain: string;
  url: string;
  frequency: string;
  status: MonitoringStatus;
  lastCheck: string;
  riskScore: number;
  changesDetected: number;
}

interface MonitoringEvent {
  id: string;
  domain: string;
  type: "check" | "change" | "error";
  message: string;
  timestamp: string;
}

const INITIAL_SITES: MonitoredSite[] = [
  {
    id: "1",
    domain: "example.com",
    url: "https://example.com",
    frequency: "hourly",
    status: "active",
    lastCheck: "2 minutes ago",
    riskScore: 12,
    changesDetected: 0,
  },
  {
    id: "2",
    domain: "shop.example.org",
    url: "https://shop.example.org",
    frequency: "6hours",
    status: "active",
    lastCheck: "1 hour ago",
    riskScore: 45,
    changesDetected: 2,
  },
  {
    id: "3",
    domain: "blog.example.net",
    url: "https://blog.example.net",
    frequency: "daily",
    status: "paused",
    lastCheck: "3 days ago",
    riskScore: 28,
    changesDetected: 0,
  },
  {
    id: "4",
    domain: "api.example.com",
    url: "https://api.example.com",
    frequency: "hourly",
    status: "active",
    lastCheck: "15 minutes ago",
    riskScore: 8,
    changesDetected: 1,
  },
  {
    id: "5",
    domain: "docs.example.com",
    url: "https://docs.example.com",
    frequency: "weekly",
    status: "error",
    lastCheck: "5 days ago",
    riskScore: 67,
    changesDetected: 3,
  },
  {
    id: "6",
    domain: "staging.example.com",
    url: "https://staging.example.com",
    frequency: "6hours",
    status: "active",
    lastCheck: "4 hours ago",
    riskScore: 31,
    changesDetected: 0,
  },
];

const MONITORING_EVENTS: MonitoringEvent[] = [
  {
    id: "1",
    domain: "example.com",
    type: "check",
    message: "Hourly security scan completed - no issues found",
    timestamp: "2 minutes ago",
  },
  {
    id: "2",
    domain: "shop.example.org",
    type: "change",
    message: "SSL certificate expiry updated from 45 to 44 days remaining",
    timestamp: "1 hour ago",
  },
  {
    id: "3",
    domain: "shop.example.org",
    type: "change",
    message: "New external script detected from CDN provider",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    domain: "api.example.com",
    type: "check",
    message: "Hourly scan completed - 1 minor change detected",
    timestamp: "15 minutes ago",
  },
  {
    id: "5",
    domain: "docs.example.com",
    type: "error",
    message: "Connection timeout - site may be down or blocking monitors",
    timestamp: "5 days ago",
  },
  {
    id: "6",
    domain: "staging.example.com",
    type: "check",
    message: "6-hour scan completed - all security headers present",
    timestamp: "4 hours ago",
  },
  {
    id: "7",
    domain: "blog.example.net",
    type: "check",
    message: "Daily scan skipped - monitoring paused by user",
    timestamp: "3 days ago",
  },
  {
    id: "8",
    domain: "shop.example.org",
    type: "check",
    message: "6-hour scan completed - 2 changes flagged for review",
    timestamp: "7 hours ago",
  },
];

const FREQUENCY_LABELS: Record<string, string> = {
  hourly: "Every Hour",
  "6hours": "Every 6 Hours",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

const RISK_COLOR = (score: number) => {
  if (score <= 20) return "#22C55E";
  if (score <= 40) return "#F59E0B";
  if (score <= 60) return "#F97316";
  return "#EF4444";
};

export default function MonitoringPage() {
  const [sites, setSites] = useState<MonitoredSite[]>(INITIAL_SITES);
  const [showForm, setShowForm] = useState(false);
  const [formUrl, setFormUrl] = useState("");
  const [formFrequency, setFormFrequency] = useState("hourly");
  const [events] = useState<MonitoringEvent[]>(MONITORING_EVENTS);

  const monitoredCount = sites.length;
  const checksToday = sites.filter((s) => s.status === "active").length * 4;
  const totalChanges = sites.reduce((sum, s) => sum + s.changesDetected, 0);

  const handleAddSite = () => {
    if (!formUrl.trim()) return;
    const domain = formUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");
    const newSite: MonitoredSite = {
      id: Date.now().toString(),
      domain,
      url: formUrl.startsWith("http") ? formUrl : `https://${formUrl}`,
      frequency: formFrequency,
      status: "active",
      lastCheck: "Just now",
      riskScore: Math.floor(Math.random() * 50) + 5,
      changesDetected: 0,
    };
    setSites((prev) => [...prev, newSite]);
    setFormUrl("");
    setFormFrequency("hourly");
    setShowForm(false);
  };

  const toggleSiteStatus = (id: string) => {
    setSites((prev) =>
      prev.map((site) =>
        site.id === id
          ? { ...site, status: site.status === "active" ? ("paused" as const) : ("active" as const) }
          : site
      )
    );
  };

  const deleteSite = (id: string) => {
    setSites((prev) => prev.filter((site) => site.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-text">Continuous Website Monitoring</h1>
            <PremiumBadge />
          </div>
          <p className="mt-1 text-muted">
            Track changes and security posture across your web properties 24/7
          </p>
        </div>
        <GlowButton
          variant="primary"
          size="md"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Website"}
        </GlowButton>
      </motion.div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6"
        >
          <GlassCard glow>
            <h3 className="text-sm font-semibold text-muted mb-4">Add New Website to Monitor</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                  <input
                    type="text"
                    placeholder="Enter website URL (e.g., example.com)"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSite()}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface border border-border text-text text-sm placeholder:text-muted/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>
              <select
                value={formFrequency}
                onChange={(e) => setFormFrequency(e.target.value)}
                className="h-11 px-4 rounded-xl bg-surface border border-border text-text text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all appearance-none cursor-pointer min-w-[160px]"
              >
                <option value="hourly">Every Hour</option>
                <option value="6hours">Every 6 Hours</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <GlowButton variant="primary" onClick={handleAddSite}>
                <Plus className="h-4 w-4" /> Add
              </GlowButton>
            </div>
          </GlassCard>
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {[
          {
            label: "Monitored Sites",
            value: monitoredCount,
            icon: <Globe className="h-5 w-5" />,
            trend: "+1 this month",
            trendUp: true,
          },
          {
            label: "Checks Today",
            value: checksToday,
            icon: <Activity className="h-5 w-5" />,
            trend: "On track",
            trendUp: true,
          },
          {
            label: "Changes Detected",
            value: totalChanges,
            icon: <AlertTriangle className="h-5 w-5" />,
            trend: totalChanges > 0 ? `${totalChanges} need review` : "All clear",
            trendUp: totalChanges === 0,
          },
        ].map((stat, i) => (
          <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={fadeInUp}>
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

      <motion.div custom={3} initial="hidden" animate="visible" variants={fadeInUp}>
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted">Monitored Websites</h3>
            <span className="text-xs text-muted">{sites.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                    Last Check
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                    Changes
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {sites.map((site) => (
                  <tr key={site.id} className="transition-colors hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <p className="font-medium text-text">{site.domain}</p>
                          <p className="text-xs text-muted truncate max-w-[200px]">{site.url}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted bg-surface px-2 py-1 rounded-lg border border-border/50">
                        {FREQUENCY_LABELS[site.frequency] ?? site.frequency}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={site.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{site.lastCheck}</td>
                    <td className="px-4 py-3">
                      <span
                        className="text-sm font-bold"
                        style={{ color: RISK_COLOR(site.riskScore) }}
                      >
                        {site.riskScore}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {site.changesDetected > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                          <AlertTriangle className="h-3 w-3" />
                          {site.changesDetected}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleSiteStatus(site.id)}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            site.status === "active"
                              ? "text-warning hover:bg-warning/10"
                              : "text-success hover:bg-success/10"
                          )}
                          title={site.status === "active" ? "Pause" : "Resume"}
                        >
                          {site.status === "active" ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteSite(site.id)}
                          className="p-2 rounded-lg text-danger hover:bg-danger/10 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div custom={4} initial="hidden" animate="visible" variants={fadeInUp} className="mt-6">
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-muted">Recent Monitoring Events</h3>
          </div>
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border transition-all",
                  event.type === "error"
                    ? "border-danger/20 bg-danger/5"
                    : event.type === "change"
                    ? "border-warning/20 bg-warning/5"
                    : "border-border/30 bg-surface/30"
                )}
              >
                <div
                  className={cn(
                    "h-2 w-2 rounded-full mt-2 shrink-0",
                    event.type === "error" && "bg-danger animate-pulse",
                    event.type === "change" && "bg-warning",
                    event.type === "check" && "bg-success"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-text">{event.domain}</span>
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                        event.type === "error" && "text-danger bg-danger/10",
                        event.type === "change" && "text-warning bg-warning/10",
                        event.type === "check" && "text-success bg-success/10"
                      )}
                    >
                      {event.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted">{event.message}</p>
                </div>
                <span className="text-[11px] text-muted shrink-0">{event.timestamp}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
