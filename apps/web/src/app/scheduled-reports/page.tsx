"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarClock,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit3,
  Download,
  Mail,
  LayoutDashboard,
  FileBarChart,
  Clock,
  ChevronDown,
  X,
  CheckCircle2,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { cn } from "@/lib/utils";
import { PremiumStatCard } from "@/components/premium/PremiumStatCard";
import { StatusBadge } from "@/components/premium/StatusBadge";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

interface ScheduledReport {
  id: string;
  name: string;
  frequency: "daily" | "weekly" | "monthly";
  delivery: "dashboard" | "email" | "download";
  status: "active" | "paused" | "failed";
  lastGenerated: string;
  nextGeneration: string;
  includeCharts: boolean;
  includeRecommendations: boolean;
  recipients: string;
  createdAt: string;
}

interface GeneratedReport {
  id: string;
  name: string;
  generatedAt: string;
  type: string;
  size: string;
}

const frequencyColors: Record<string, string> = {
  daily: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  weekly: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  monthly: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

const deliveryIcons: Record<string, typeof Mail> = {
  dashboard: LayoutDashboard,
  email: Mail,
  download: Download,
};

const initialReports: ScheduledReport[] = [
  {
    id: "1",
    name: "Weekly Security Summary",
    frequency: "weekly",
    delivery: "email",
    status: "active",
    lastGenerated: "Jun 30, 2025",
    nextGeneration: "Jul 7, 2025",
    includeCharts: true,
    includeRecommendations: true,
    recipients: "team@cyberguard.io, ciso@cyberguard.io",
    createdAt: "Mar 15, 2025",
  },
  {
    id: "2",
    name: "Daily Vulnerability Digest",
    frequency: "daily",
    delivery: "dashboard",
    status: "active",
    lastGenerated: "Jul 6, 2025",
    nextGeneration: "Jul 7, 2025",
    includeCharts: false,
    includeRecommendations: true,
    recipients: "",
    createdAt: "Apr 2, 2025",
  },
  {
    id: "3",
    name: "Monthly Compliance Report",
    frequency: "monthly",
    delivery: "email",
    status: "active",
    lastGenerated: "Jun 1, 2025",
    nextGeneration: "Jul 1, 2025",
    includeCharts: true,
    includeRecommendations: true,
    recipients: "compliance@cyberguard.io, legal@cyberguard.io",
    createdAt: "Feb 10, 2025",
  },
  {
    id: "4",
    name: "Quarterly Executive Brief",
    frequency: "monthly",
    delivery: "download",
    status: "paused",
    lastGenerated: "Apr 1, 2025",
    nextGeneration: "—",
    includeCharts: true,
    includeRecommendations: false,
    recipients: "board@cyberguard.io",
    createdAt: "Jan 5, 2025",
  },
];

const recentReports: GeneratedReport[] = [
  { id: "1", name: "Weekly Security Summary", generatedAt: "Jun 30, 2025 09:00 AM", type: "PDF", size: "2.4 MB" },
  { id: "2", name: "Daily Vulnerability Digest", generatedAt: "Jul 6, 2025 06:00 AM", type: "HTML", size: "890 KB" },
  { id: "3", name: "Monthly Compliance Report", generatedAt: "Jun 1, 2025 08:00 AM", type: "PDF", size: "5.1 MB" },
  { id: "4", name: "Daily Vulnerability Digest", generatedAt: "Jul 5, 2025 06:00 AM", type: "HTML", size: "845 KB" },
  { id: "5", name: "Daily Vulnerability Digest", generatedAt: "Jul 4, 2025 06:00 AM", type: "HTML", size: "912 KB" },
];

export default function ScheduledReportsPage() {
  const [reports, setReports] = useState<ScheduledReport[]>(initialReports);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    frequency: "weekly" as ScheduledReport["frequency"],
    delivery: "email" as ScheduledReport["delivery"],
    includeCharts: true,
    includeRecommendations: true,
    recipients: "",
  });

  const activeReports = reports.filter((r) => r.status === "active").length;
  const pausedReports = reports.filter((r) => r.status === "paused").length;

  const resetForm = () => {
    setFormData({
      name: "",
      frequency: "weekly",
      delivery: "email",
      includeCharts: true,
      includeRecommendations: true,
      recipients: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (report: ScheduledReport) => {
    setFormData({
      name: report.name,
      frequency: report.frequency,
      delivery: report.delivery,
      includeCharts: report.includeCharts,
      includeRecommendations: report.includeRecommendations,
      recipients: report.recipients,
    });
    setEditingId(report.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name) return;
    if (editingId) {
      setReports(
        reports.map((r) =>
          r.id === editingId
            ? { ...r, ...formData }
            : r
        )
      );
    } else {
      const now = new Date();
      const newReport: ScheduledReport = {
        id: String(reports.length + 1),
        ...formData,
        status: "active",
        lastGenerated: "Never",
        nextGeneration: "Pending",
        createdAt: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      setReports([...reports, newReport]);
    }
    resetForm();
  };

  const toggleStatus = (id: string) => {
    setReports(
      reports.map((r) =>
        r.id === id
          ? { ...r, status: r.status === "active" ? "paused" : "active" }
          : r
      )
    );
  };

  const deleteReport = (id: string) => {
    setReports(reports.filter((r) => r.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={0}>
        <SectionTitle
          title="Scheduled Reports"
          subtitle="Automate your security reporting pipeline"
        />
      </motion.div>

      <div className="flex items-center gap-3 mt-4 mb-8">
        <PremiumStatCard
          label="Active Schedules"
          value={activeReports}
          icon={<CalendarClock className="w-5 h-5" />}
        />
        <PremiumStatCard
          label="Paused"
          value={pausedReports}
          icon={<Pause className="w-5 h-5" />}
        />
        <PremiumStatCard
          label="Total Reports"
          value={reports.length}
          icon={<FileBarChart className="w-5 h-5" />}
        />
      </div>

      <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={3} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Scheduled Reports</h2>
          <GlowButton onClick={() => { resetForm(); setShowForm(!showForm); }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Schedule
          </GlowButton>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6"
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-medium text-white">
                  {editingId ? "Edit Schedule" : "Create New Schedule"}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Report Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Weekly Security Summary"
                    className="w-full px-4 py-2.5 bg-[#0B1120] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Frequency</label>
                  <div className="relative">
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value as ScheduledReport["frequency"] })}
                      className="w-full px-4 py-2.5 bg-[#0B1120] border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:border-[#00E5FF] transition-colors"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Delivery Method</label>
                  <div className="relative">
                    <select
                      value={formData.delivery}
                      onChange={(e) => setFormData({ ...formData, delivery: e.target.value as ScheduledReport["delivery"] })}
                      className="w-full px-4 py-2.5 bg-[#0B1120] border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:border-[#00E5FF] transition-colors"
                    >
                      <option value="dashboard">Dashboard</option>
                      <option value="email">Email</option>
                      <option value="download">Download</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Recipients</label>
                  <input
                    type="text"
                    value={formData.recipients}
                    onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                    placeholder="email1@co.com, email2@co.com"
                    className="w-full px-4 py-2.5 bg-[#0B1120] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 mb-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeCharts}
                    onChange={(e) => setFormData({ ...formData, includeCharts: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 bg-[#0B1120] text-[#00E5FF] focus:ring-[#00E5FF] focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-300">Include Charts</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeRecommendations}
                    onChange={(e) => setFormData({ ...formData, includeRecommendations: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 bg-[#0B1120] text-[#00E5FF] focus:ring-[#00E5FF] focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-300">Include Recommendations</span>
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <GlowButton onClick={handleSave}>
                  {editingId ? "Save Changes" : "Create Schedule"}
                </GlowButton>
              </div>
            </GlassCard>
          </motion.div>
        )}

        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Report Name</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Frequency</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Delivery</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Last Generated</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Next Generation</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => {
                  const DeliveryIcon = deliveryIcons[report.delivery] ?? Mail;
                  return (
                    <tr
                      key={report.id}
                      className="border-b border-gray-700/30 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center">
                            <FileBarChart className="w-4 h-4 text-[#00E5FF]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{report.name}</p>
                            <p className="text-xs text-gray-500">Created {report.createdAt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize",
                            frequencyColors[report.frequency]
                          )}
                        >
                          {report.frequency}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <DeliveryIcon className="w-4 h-4 text-gray-400" />
                          <span className="capitalize">{report.delivery}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400">{report.lastGenerated}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {report.nextGeneration}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(report)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleStatus(report.id)}
                            className={cn(
                              "p-1.5 rounded-lg transition-colors",
                              report.status === "active"
                                ? "text-yellow-400 hover:bg-yellow-500/10"
                                : "text-green-400 hover:bg-green-500/10"
                            )}
                            title={report.status === "active" ? "Pause" : "Resume"}
                          >
                            {report.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => deleteReport(report.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {reports.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No scheduled reports yet. Create your first schedule above.
            </div>
          )}
        </GlassCard>
      </motion.div>

      <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={5}>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#00E5FF]" />
          Recently Generated
        </h2>
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Report</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Generated At</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Type</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Size</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-gray-700/30 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-white">{report.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm text-gray-400">{report.generatedAt}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-xs font-medium">
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm text-gray-400">{report.size}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button className="text-sm text-[#00E5FF] hover:text-[#00E5FF]/80 transition-colors flex items-center gap-1 ml-auto">
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
