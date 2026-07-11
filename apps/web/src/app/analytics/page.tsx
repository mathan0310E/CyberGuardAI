"use client";

import { motion } from "framer-motion";
import {
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  Crown,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumStatCard } from "@/components/premium/PremiumStatCard";
import { PremiumBadge } from "@/components/premium/PremiumBadge";
import { PremiumChartCard } from "@/components/premium/PremiumChartCard";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
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

const PIE_COLORS = ["#00E5FF", "#7C3AED", "#3B82F6", "#F59E0B"];

const customerGrowth = [
  { month: "Jan", customers: 210, revenue: 18900 },
  { month: "Feb", customers: 228, revenue: 20520 },
  { month: "Mar", customers: 245, revenue: 22050 },
  { month: "Apr", customers: 252, revenue: 22680 },
  { month: "May", customers: 268, revenue: 24120 },
  { month: "Jun", customers: 281, revenue: 25290 },
  { month: "Jul", customers: 295, revenue: 26550 },
  { month: "Aug", customers: 304, revenue: 27360 },
  { month: "Sep", customers: 312, revenue: 28080 },
  { month: "Oct", customers: 325, revenue: 29250 },
  { month: "Nov", customers: 334, revenue: 30060 },
  { month: "Dec", customers: 342, revenue: 30780 },
];

const revenueTrends = customerGrowth.map((d) => ({ month: d.month, revenue: d.revenue }));

const planDistribution = [
  { name: "Free", value: 180 },
  { name: "Starter", value: 98 },
  { name: "Professional", value: 48 },
  { name: "Enterprise", value: 16 },
];

const planDetails = [
  { plan: "Enterprise", customers: 16, mrr: 3184, arpu: 199 },
  { plan: "Professional", customers: 48, mrr: 3792, arpu: 79 },
  { plan: "Starter", customers: 98, mrr: 2842, arpu: 29 },
  { plan: "Free", customers: 180, mrr: 0, arpu: 0 },
];

export default function BusinessAnalyticsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-text">Business Analytics</h1>
          <PremiumBadge />
        </div>
        <p className="mt-1 text-muted">Revenue, growth, and subscription metrics</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: "Active Customers", value: 342, icon: <Users className="h-5 w-5" />, trend: "+12.5%", trendUp: true },
          { label: "MRR", value: 28400, icon: <DollarSign className="h-5 w-5" />, prefix: "$", trend: "+8.2%", trendUp: true },
          { label: "ARR", value: 340800, icon: <TrendingUp className="h-5 w-5" />, prefix: "$", trend: "+15.4%", trendUp: true },
          { label: "Growth Rate", value: 12.5, icon: <BarChart3 className="h-5 w-5" />, suffix: "%", decimals: 1, trend: "+2.1%", trendUp: true },
        ].map((stat, i) => (
          <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={fadeInUp}>
            <PremiumStatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeInUp}>
          <PremiumChartCard title="Customer Growth">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={{ stroke: "#1F2937" }} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={{ stroke: "#1F2937" }} />
                <Tooltip contentStyle={{ backgroundColor: "#0B1120", border: "1px solid #1F2937", borderRadius: "12px", color: "#F8FAFC" }} />
                <Bar dataKey="customers" fill="url(#custGrad)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <defs>
                  <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity={1} />
                    <stop offset="100%" stopColor="#00E5FF" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </PremiumChartCard>
        </motion.div>

        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeInUp}>
          <PremiumChartCard title="Revenue Trends">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueTrends}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={{ stroke: "#1F2937" }} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={{ stroke: "#1F2937" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: "#0B1120", border: "1px solid #1F2937", borderRadius: "12px", color: "#F8FAFC" }} formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#22C55E" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </PremiumChartCard>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeInUp}>
          <GlassCard>
            <h3 className="text-sm font-semibold text-muted mb-4">Plan Distribution</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {planDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0B1120", border: "1px solid #1F2937", borderRadius: "12px", color: "#F8FAFC" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {planDistribution.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <span className="text-sm text-text">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-muted">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div custom={7} initial="hidden" animate="visible" variants={fadeInUp}>
          <GlassCard>
            <h3 className="text-sm font-semibold text-muted mb-4">Subscription Plans</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted uppercase">Plan</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-muted uppercase">Customers</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-muted uppercase">MRR</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-muted uppercase">ARPU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {planDetails.map((p) => (
                    <tr key={p.plan} className="hover:bg-surface/30 transition-colors">
                      <td className="px-3 py-2.5 font-medium text-text flex items-center gap-2">
                        {p.plan === "Enterprise" && <Crown className="h-3.5 w-3.5 text-amber-400" />}
                        {p.plan}
                      </td>
                      <td className="px-3 py-2.5 text-right text-muted">{p.customers}</td>
                      <td className="px-3 py-2.5 text-right text-text font-medium">${p.mrr.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right text-muted">${p.arpu}/mo</td>
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
