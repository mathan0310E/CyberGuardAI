"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  HardDrive,
  Wifi,
  MemoryStick,
  Activity,
  Bot,
  User,
  AlertTriangle,
  Radio,
  Search,
  Database,
  Globe,
  Shield,
  ScrollText,
  Terminal,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusBadge } from "@/components/premium/StatusBadge";
import { PremiumChartCard } from "@/components/premium/PremiumChartCard";
import { cn } from "@/lib/utils";
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

const systemHealth = [
  { label: "CPU Usage", value: 67, icon: Cpu, color: "#00E5FF" },
  { label: "Memory", value: 82, icon: MemoryStick, color: "#7C3AED" },
  { label: "Disk I/O", value: 45, icon: HardDrive, color: "#22C55E" },
  { label: "Network", value: 58, icon: Wifi, color: "#F59E0B" },
];

const threatTimeline = [
  { hour: "00:00", threats: 3 },
  { hour: "02:00", threats: 1 },
  { hour: "04:00", threats: 0 },
  { hour: "06:00", threats: 2 },
  { hour: "08:00", threats: 8 },
  { hour: "10:00", threats: 14 },
  { hour: "12:00", threats: 11 },
  { hour: "14:00", threats: 18 },
  { hour: "16:00", threats: 22 },
  { hour: "18:00", threats: 15 },
  { hour: "20:00", threats: 9 },
  { hour: "22:00", threats: 5 },
];

const initialEvents = [
  { id: "ev1", time: "14:32:18", message: "Critical: Malware payload detected — example.com/assets/main.js", type: "danger" as const },
  { id: "ev2", time: "14:31:45", message: "Blocked IP 203.0.113.42 — brute force attempt on /api/auth", type: "warning" as const },
  { id: "ev3", time: "14:30:22", message: "Info: Scheduled scan completed for shop-site.io (Score: 45)", type: "info" as const },
  { id: "ev4", time: "14:29:58", message: "High: Obfuscated JavaScript detected — blog-app.dev/widget.js", type: "danger" as const },
  { id: "ev5", time: "14:28:11", message: "Medium: Missing security headers on api-service.cloud", type: "warning" as const },
  { id: "ev6", time: "14:27:33", message: "Info: SSL certificate renewed for docs.app.dev", type: "info" as const },
  { id: "ev7", time: "14:26:05", message: "Critical: SQL injection attempt blocked — /api/v1/search", type: "danger" as const },
  { id: "ev8", time: "14:25:42", message: "Blocked IP 198.51.100.17 — port scanning detected", type: "warning" as const },
];

const auditLogs = [
  { timestamp: "2026-07-12 14:32", user: "system", action: "Malware scan completed", status: "resolved" as const },
  { timestamp: "2026-07-12 14:30", user: "admin@cyberguard.ai", action: "Manual scan initiated", status: "active" as const },
  { timestamp: "2026-07-12 14:28", user: "system", action: "IP 203.0.113.42 blocked", status: "blocked" as const },
  { timestamp: "2026-07-12 14:25", user: "admin@cyberguard.ai", action: "Updated security policy", status: "resolved" as const },
  { timestamp: "2026-07-12 14:22", user: "system", action: "Threat intelligence sync", status: "resolved" as const },
  { timestamp: "2026-07-12 14:18", user: "ops@cyberguard.ai", action: "Service restart: scanner-v2", status: "resolved" as const },
  { timestamp: "2026-07-12 14:15", user: "system", action: "Backup completed", status: "resolved" as const },
  { timestamp: "2026-07-12 14:10", user: "admin@cyberguard.ai", action: "Revoked API key for legacy-app", status: "error" as const },
];

export default function SOCPage() {
  const [events, setEvents] = useState(initialEvents);
  const [telegramAlerts, setTelegramAlerts] = useState(true);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const newEvents = [
        "New scan initiated for landing-page.io",
        "Threat intelligence feed updated (3 new indicators)",
        "User session expired: ops@cyberguard.ai",
        "WAF rule updated: block-pattern-47",
        "SSL certificate check completed for 12 domains",
        "AI model retrained with latest threat data",
        "Automated remediation applied: missing-csp-header",
        "Port scan detected from 192.0.2.15",
      ];
      const severities: Array<"danger" | "warning" | "info"> = ["danger", "warning", "info"];
      const msg = newEvents[Math.floor(Math.random() * newEvents.length)] ?? "Unknown event";
      const type = severities[Math.floor(Math.random() * severities.length)] ?? "info";
      const now = new Date();
      const time = now.toLocaleTimeString("en-US", { hour12: false });

      setEvents((prev) => [
        { id: `ev-${Date.now()}`, time, message: msg, type },
        ...prev.slice(0, 19),
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <SectionTitle
          title="Security Operations Center"
          subtitle="Enterprise-grade monitoring and incident response"
          align="left"
        />
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {systemHealth.map((item, i) => (
          <motion.div key={item.label} custom={i} initial="hidden" animate="visible" variants={fadeInUp}>
            <GlassCard>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-4 w-4" style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-xs text-muted">{item.label}</p>
                  <p className="text-lg font-bold text-text">{item.value}%</p>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 1.2, delay: i * 0.1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
              {item.value >= 80 && (
                <p className="mt-1.5 text-[10px] text-warning font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  High usage detected
                </p>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeInUp}>
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Bot className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-muted">AI Service Status</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: "Threat Detection AI", status: "active" as const },
                { name: "NLP Analysis Engine", status: "active" as const },
                { name: "Anomaly Detection", status: "active" as const },
                { name: "Auto-Remediation", status: "paused" as const },
              ].map((svc) => (
                <div key={svc.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      {svc.status === "active" && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                      )}
                      <span className={cn(
                        "relative inline-flex h-2 w-2 rounded-full",
                        svc.status === "active" ? "bg-success" : "bg-warning"
                      )} />
                    </span>
                    <span className="text-xs text-text">{svc.name}</span>
                  </div>
                  <StatusBadge status={svc.status} />
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Radio className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold text-muted">Telegram Alerts</h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text">Alert notifications</span>
                <button
                  onClick={() => setTelegramAlerts(!telegramAlerts)}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    telegramAlerts ? "bg-success" : "bg-surface border border-border"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                      telegramAlerts ? "translate-x-[22px]" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
              <p className="text-[10px] text-muted mt-2">
                {telegramAlerts ? "Alerts are being sent to @CyberGuardAlerts" : "Telegram alerts are disabled"}
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeInUp}>
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-muted">Threat Intelligence</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: "VirusTotal", icon: Shield, connected: true, lastSync: "2 min ago" },
                { name: "URLScan.io", icon: Search, connected: true, lastSync: "5 min ago" },
                { name: "AbuseIPDB", icon: Database, connected: true, lastSync: "8 min ago" },
                { name: "AlienVault OTX", icon: Globe, connected: false, lastSync: "N/A" },
              ].map((ti) => (
                <div
                  key={ti.name}
                  className="flex items-center justify-between rounded-xl border border-border/30 p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      ti.connected ? "bg-primary/10 text-primary" : "bg-muted/10 text-muted"
                    )}>
                      <ti.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text">{ti.name}</p>
                      <p className="text-[10px] text-muted">
                        {ti.connected ? `Last sync: ${ti.lastSync}` : "Not connected"}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={ti.connected ? "active" : "error"} />
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeInUp}>
          <PremiumChartCard title="Threat Timeline (24h)">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={threatTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="hour" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={{ stroke: "#1E293B" }} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={{ stroke: "#1E293B" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0B1120",
                    border: "1px solid #1F2937",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                />
                <Bar
                  dataKey="threats"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                  fill="#00E5FF"
                />
              </BarChart>
            </ResponsiveContainer>
          </PremiumChartCard>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <motion.div custom={7} initial="hidden" animate="visible" variants={fadeInUp}>
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-muted">Live Security Events</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
                </span>
                <span className="text-[10px] text-danger font-medium">LIVE</span>
              </div>
            </div>
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
              {events.map((evt) => (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-2 rounded-lg px-3 py-2 hover:bg-surface/50 transition-colors"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-muted font-mono w-[60px]">{evt.time}</span>
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      evt.type === "danger" && "bg-danger",
                      evt.type === "warning" && "bg-warning",
                      evt.type === "info" && "bg-primary",
                    )} />
                  </div>
                  <p className="text-xs text-text/80 leading-relaxed">{evt.message}</p>
                </motion.div>
              ))}
              <div ref={eventsEndRef} />
            </div>
          </GlassCard>
        </motion.div>

        <motion.div custom={8} initial="hidden" animate="visible" variants={fadeInUp}>
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <ScrollText className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-muted">Audit Logs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="pb-2 text-left text-muted font-medium">Timestamp</th>
                    <th className="pb-2 text-left text-muted font-medium">User</th>
                    <th className="pb-2 text-left text-muted font-medium">Action</th>
                    <th className="pb-2 text-left text-muted font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log, idx) => (
                    <tr key={idx} className="border-b border-border/20 hover:bg-surface/30 transition-colors">
                      <td className="py-2.5 text-muted font-mono text-[10px] whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-2.5 text-text whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {log.user === "system" ? (
                            <Terminal className="h-3 w-3 text-muted" />
                          ) : (
                            <User className="h-3 w-3 text-muted" />
                          )}
                          <span className="truncate max-w-[120px]">{log.user}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-text/80 max-w-[200px] truncate">{log.action}</td>
                      <td className="py-2.5">
                        <StatusBadge status={log.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}


