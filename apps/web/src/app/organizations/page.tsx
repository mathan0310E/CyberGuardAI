"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Globe,
  Users,
  Mail,
  Slack,
  Code,
  Zap,
  CreditCard,

  Settings,
  TrendingUp,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { cn } from "@/lib/utils";
import { PremiumStatCard } from "@/components/premium/PremiumStatCard";
import { PremiumBadge } from "@/components/premium/PremiumBadge";
import { PremiumChartCard } from "@/components/premium/PremiumChartCard";
import { AnimatedCounter } from "@/components/premium/AnimatedCounter";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#0B1120",
    border: "1px solid #1F2937",
    borderRadius: "12px",
    color: "#F8FAFC",
  },
};

const organization = {
  name: "CyberGuard Enterprises",
  plan: "Enterprise",
  website: "https://cyberguard.io",
  createdAt: "January 2024",
  logo: "CG",
  settings: {
    defaultScanFrequency: "daily",
    emailNotifications: true,
    slackIntegration: false,
    apiAccess: true,
  },
};

const usageData = [
  { month: "Jan", scans: 120 },
  { month: "Feb", scans: 180 },
  { month: "Mar", scans: 240 },
  { month: "Apr", scans: 310 },
  { month: "May", scans: 280 },
  { month: "Jun", scans: 420 },
];

const planBreakdown = [
  { name: "Websites Used", value: 24, color: "#00E5FF" },
  { name: "Remaining", value: 26, color: "#1F2937" },
];

const subscriptionFeatures = [
  { name: "Up to 50 websites", included: true },
  { name: "Unlimited scans", included: true },
  { name: "Real-time monitoring", included: true },
  { name: "API access", included: true },
  { name: "Priority support", included: true },
  { name: "Custom reports", included: true },
  { name: "SSO integration", included: true },
  { name: "Audit logs", included: true },
];

export default function OrganizationsPage() {
  const [settings, setSettings] = useState(organization.settings);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const frequencies = ["hourly", "daily", "weekly", "monthly"];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={0}>
        <SectionTitle
          title="Organization Management"
          subtitle="Manage your organization settings, subscription, and usage"
        />
      </motion.div>

      <div className="flex items-center gap-3 mt-4 mb-8">
        <PremiumBadge />
        <span className="text-sm text-gray-400">Enterprise-level organization controls</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={1} className="lg:col-span-2">
          <GlassCard className="p-6 h-full">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#7C3AED] flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                {organization.logo}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">{organization.name}</h2>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-xs font-medium">
                    {organization.plan}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    {organization.website}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    Since {organization.createdAt}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0B1120] rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-4 h-4 text-[#00E5FF]" />
                      <span className="text-xs text-gray-400">Websites</span>
                    </div>
                    <p className="text-2xl font-bold text-white">24</p>
                    <p className="text-xs text-gray-500">of 50 limit</p>
                  </div>
                  <div className="bg-[#0B1120] rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-[#7C3AED]" />
                      <span className="text-xs text-gray-400">Members</span>
                    </div>
                    <p className="text-2xl font-bold text-white">6</p>
                    <p className="text-xs text-gray-500">active team members</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={2}>
          <GlassCard className="p-6 h-full">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-[#7C3AED]" />
              <h3 className="text-lg font-semibold text-white">Current Plan</h3>
            </div>
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-white mb-1">Enterprise</p>
              <p className="text-sm text-gray-400">$299/month</p>
            </div>
            <ul className="space-y-2 mb-6">
              {subscriptionFeatures.slice(0, 5).map((feature) => (
                <li key={feature.name} className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {feature.name}
                </li>
              ))}
            </ul>
            <GlowButton className="w-full" onClick={() => setShowUpgradeModal(!showUpgradeModal)}>
              <Zap className="w-4 h-4 mr-2" />
              Upgrade Plan
            </GlowButton>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={3} className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#00E5FF]" />
          Organization Settings
        </h2>
        <GlassCard className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#00E5FF]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Default Scan Frequency</p>
                  <p className="text-xs text-gray-400">How often websites are automatically scanned</p>
                </div>
              </div>
              <div className="relative">
                <select
                  value={settings.defaultScanFrequency}
                  onChange={(e) => setSettings({ ...settings, defaultScanFrequency: e.target.value })}
                  className="px-4 py-2 bg-[#0B1120] border border-gray-700 rounded-lg text-white text-sm appearance-none pr-10 focus:outline-none focus:border-[#00E5FF] transition-colors"
                >
                  {frequencies.map((f) => (
                    <option key={f} value={f} className="capitalize">
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Email Notifications</p>
                  <p className="text-xs text-gray-400">Receive email alerts for critical findings</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting("emailNotifications")}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors duration-200",
                  settings.emailNotifications ? "bg-[#00E5FF]" : "bg-gray-700"
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200",
                    settings.emailNotifications ? "translate-x-7" : "translate-x-1"
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Slack className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Slack Integration</p>
                  <p className="text-xs text-gray-400">Send scan results to Slack channels</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting("slackIntegration")}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors duration-200",
                  settings.slackIntegration ? "bg-[#00E5FF]" : "bg-gray-700"
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200",
                    settings.slackIntegration ? "translate-x-7" : "translate-x-1"
                  )}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Code className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">API Access</p>
                  <p className="text-xs text-gray-400">Enable programmatic access to your data</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting("apiAccess")}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors duration-200",
                  settings.apiAccess ? "bg-[#00E5FF]" : "bg-gray-700"
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200",
                    settings.apiAccess ? "translate-x-7" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={4}>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00E5FF]" />
          Usage Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <PremiumStatCard
            label="Websites Used"
            value={24}
            suffix="/50"
            icon={<Globe className="w-5 h-5" />}
            trend="8"
            trendUp={true}
          />
          <PremiumStatCard
            label="Scans This Month"
            value={420}
            icon={<Zap className="w-5 h-5" />}
            trend="24"
            trendUp={true}
          />
          <PremiumStatCard
            label="API Calls"
            value={12847}
            icon={<Code className="w-5 h-5" />}
            trend="15"
            trendUp={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PremiumChartCard title="Monthly Scans">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={usageData}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="scans" fill="#00E5FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </PremiumChartCard>

          <PremiumChartCard title="Website Usage">
            <div className="flex items-center justify-center h-[250px]">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={planBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    {planBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute">
                <p className="text-3xl font-bold text-white text-center">
                  <AnimatedCounter value={24} />
                </p>
                <p className="text-xs text-gray-400 text-center">of 50</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#00E5FF]" />
                <span className="text-sm text-gray-400">Used (24)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#1F2937]" />
                <span className="text-sm text-gray-400">Available (26)</span>
              </div>
            </div>
          </PremiumChartCard>
        </div>
      </motion.div>
    </div>
  );
}
