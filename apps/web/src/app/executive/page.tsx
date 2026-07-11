"use client";

import { motion } from "framer-motion";
import {
  Globe,
  Scan,
  Shield,
  Users,
  DollarSign,
  Eye,
  Clock,
  AlertTriangle,
  FileText,
  MessageSquare,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumStatCard } from "@/components/premium/PremiumStatCard";
import { PremiumBadge } from "@/components/premium/PremiumBadge";
import { cn } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const PIE_COLORS = ["#00E5FF", "#7C3AED", "#3B82F6", "#F59E0B", "#EF4444"];

const securityTrend = [
  { date: "Jan", score: 65 },
  { date: "Feb", score: 68 },
  { date: "Mar", score: 72 },
  { date: "Apr", score: 70 },
  { date: "May", score: 74 },
  { date: "Jun", score: 76 },
  { date: "Jul", score: 73 },
  { date: "Aug", score: 78 },
  { date: "Sep", score: 75 },
  { date: "Oct", score: 80 },
  { date: "Nov", score: 77 },
  { date: "Dec", score: 78 },
];

const threatDistribution = [
  { name: "Malware", value: 24 },
  { name: "Phishing", value: 18 },
  { name: "JS Issues", value: 31 },
  { name: "Headers", value: 42 },
  { name: "Other", value: 12 },
];

const recentActivity = [
  { id: "1", type: "scan", message: "Security scan completed for example.com", time: "2 min ago", color: "text-primary" },
  { id: "2", type: "threat", message: "Critical threat blocked on shop.example.org", time: "15 min ago", color: "text-danger" },
  { id: "3", type: "team", message: "Sarah Chen joined the team", time: "1 hour ago", color: "text-accent" },
  { id: "4", type: "report", message: "Weekly security report generated", time: "3 hours ago", color: "text-info" },
  { id: "5", type: "monitor", message: "Monitoring alert: blog.example.net score dropped", time: "5 hours ago", color: "text-warning" },
  { id: "6", type: "scan", message: "Deep scan completed for api.example.com", time: "8 hours ago", color: "text-primary" },
  { id: "7", type: "threat", message: "2 phishing attempts detected and blocked", time: "12 hours ago", color: "text-danger" },
  { id: "8", type: "team", message: "Mike Johnson updated organization settings", time: "1 day ago", color: "text-accent" },
];

const activityIcons: Record<string, React.ReactNode> = {
  scan: <Scan className="h-4 w-4" />,
  threat: <AlertTriangle className="h-4 w-4" />,
  team: <Users className="h-4 w-4" />,
  report: <FileText className="h-4 w-4" />,
  monitor: <Eye className="h-4 w-4" />,
};

export default function ExecutiveDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-text">Executive Dashboard</h1>
            <PremiumBadge />
          </div>
          <p className="mt-1 text-muted">High-level overview for business stakeholders</p>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        {[
          { label: "Total Websites", value: 12, icon: <Globe className="h-5 w-5" />, trend: "+2 this month", trendUp: true },
          { label: "Total Scans", value: 1247, icon: <Scan className="h-5 w-5" />, trend: "+18% vs last month", trendUp: true },
          { label: "Security Score", value: 78, icon: <Shield className="h-5 w-5" />, trend: "+5 points", trendUp: true },
          { label: "Active Monitoring", value: 8, icon: <Eye className="h-5 w-5" />, trend: "2 pending setup", trendUp: true },
          { label: "Team Members", value: 6, icon: <Users className="h-5 w-5" />, trend: "1 invited", trendUp: true },
          { label: "Revenue", value: 12450, icon: <DollarSign className="h-5 w-5" />, prefix: "$", trend: "+12.3%", trendUp: true },
        ].map((stat, i) => (
          <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={fadeInUp}>
            <PremiumStatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeInUp} className="lg:col-span-2">
          <GlassCard>
            <h3 className="text-sm font-semibold text-muted mb-4">Security Score Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={securityTrend}>
                <defs>
                  <linearGradient id="execGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="date" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={{ stroke: "#1F2937" }} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={{ stroke: "#1F2937" }} domain={[50, 100]} />
                <Tooltip contentStyle={{ backgroundColor: "#0B1120", border: "1px solid #1F2937", borderRadius: "12px", color: "#F8FAFC" }} />
                <Area type="monotone" dataKey="score" stroke="#00E5FF" fill="url(#execGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        <motion.div custom={7} initial="hidden" animate="visible" variants={fadeInUp}>
          <GlassCard>
            <h3 className="text-sm font-semibold text-muted mb-4">Threat Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={threatDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {threatDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0B1120", border: "1px solid #1F2937", borderRadius: "12px", color: "#F8FAFC" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2">
              {threatDistribution.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-xs text-muted">{item.name}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div custom={8} initial="hidden" animate="visible" variants={fadeInUp}>
          <GlassCard>
            <h3 className="text-sm font-semibold text-muted mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((event) => (
                <div key={event.id} className="flex items-start gap-3 rounded-xl border border-border/30 p-3 hover:bg-surface/30 transition-colors">
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface", event.color)}>
                    {activityIcons[event.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text">{event.message}</p>
                    <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {event.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div custom={9} initial="hidden" animate="visible" variants={fadeInUp}>
          <GlassCard glow>
            <h3 className="text-sm font-semibold text-muted mb-4">Subscription Status</h3>
            <div className="rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-text">Professional Plan</p>
                  <p className="text-sm text-muted mt-1">$79/month  &bull;  Renews Jan 15, 2026</p>
                </div>
                <span className="rounded-full bg-success/15 text-success border border-success/30 px-3 py-1 text-xs font-bold uppercase">
                  Active
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                {[
                  { label: "Websites", used: 12, limit: 25 },
                  { label: "Scans", used: 1247, limit: 5000 },
                  { label: "Team", used: 6, limit: 10 },
                ].map((u) => (
                  <div key={u.label}>
                    <p className="text-xs text-muted">{u.label}</p>
                    <p className="text-sm font-semibold text-text">{u.used} / {u.limit}</p>
                    <div className="mt-1 h-1.5 rounded-full bg-border overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${(u.used / u.limit) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-muted mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <a href="/scanner" className="flex items-center gap-2 rounded-xl border border-border/50 p-3 text-sm text-text hover:border-primary/30 hover:bg-surface/30 transition-all">
                  <Scan className="h-4 w-4 text-primary" /> New Scan
                </a>
                <a href="/reports" className="flex items-center gap-2 rounded-xl border border-border/50 p-3 text-sm text-text hover:border-primary/30 hover:bg-surface/30 transition-all">
                  <FileText className="h-4 w-4 text-primary" /> Reports
                </a>
                <a href="/monitoring" className="flex items-center gap-2 rounded-xl border border-border/50 p-3 text-sm text-text hover:border-primary/30 hover:bg-surface/30 transition-all">
                  <Eye className="h-4 w-4 text-primary" /> Monitoring
                </a>
                <a href="/chat" className="flex items-center gap-2 rounded-xl border border-border/50 p-3 text-sm text-text hover:border-primary/30 hover:bg-surface/30 transition-all">
                  <MessageSquare className="h-4 w-4 text-primary" /> AI Assistant
                </a>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
