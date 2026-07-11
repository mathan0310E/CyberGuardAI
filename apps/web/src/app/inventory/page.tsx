"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Search,
  Plus,
  Scan,
  AlertTriangle,
  Activity,
  BarChart3,
  X,
  Tag,
  Calendar,
  Shield,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
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

type SiteStatus = "active" | "paused" | "error";

interface WebsiteEntry {
  id: string;
  name: string;
  domain: string;
  status: SiteStatus;
  lastScan: string;
  riskScore: number;
  monitoring: boolean;
  scanCount: number;
  threatCount: number;
  tags: string[];
}

const INITIAL_WEBSITES: WebsiteEntry[] = [
  {
    id: "1",
    name: "Main Website",
    domain: "example.com",
    status: "active",
    lastScan: "2 hours ago",
    riskScore: 12,
    monitoring: true,
    scanCount: 148,
    threatCount: 2,
    tags: ["production", "marketing"],
  },
  {
    id: "2",
    name: "E-Commerce Store",
    domain: "shop.example.org",
    status: "active",
    lastScan: "1 hour ago",
    riskScore: 45,
    monitoring: true,
    scanCount: 95,
    threatCount: 8,
    tags: ["production", "ecommerce"],
  },
  {
    id: "3",
    name: "Company Blog",
    domain: "blog.example.net",
    status: "paused",
    lastScan: "3 days ago",
    riskScore: 28,
    monitoring: false,
    scanCount: 62,
    threatCount: 1,
    tags: ["content", "marketing"],
  },
  {
    id: "4",
    name: "API Gateway",
    domain: "api.example.com",
    status: "active",
    lastScan: "15 minutes ago",
    riskScore: 8,
    monitoring: true,
    scanCount: 210,
    threatCount: 0,
    tags: ["production", "api", "backend"],
  },
  {
    id: "5",
    name: "Documentation Portal",
    domain: "docs.example.com",
    status: "error",
    lastScan: "5 days ago",
    riskScore: 67,
    monitoring: true,
    scanCount: 34,
    threatCount: 12,
    tags: ["docs", "development"],
  },
  {
    id: "6",
    name: "Staging Environment",
    domain: "staging.example.com",
    status: "active",
    lastScan: "4 hours ago",
    riskScore: 31,
    monitoring: true,
    scanCount: 87,
    threatCount: 3,
    tags: ["staging", "development"],
  },
  {
    id: "7",
    name: "Partner Portal",
    domain: "partners.example.com",
    status: "active",
    lastScan: "30 minutes ago",
    riskScore: 22,
    monitoring: true,
    scanCount: 120,
    threatCount: 1,
    tags: ["production", "partners"],
  },
  {
    id: "8",
    name: "Legacy Landing Page",
    domain: "old.example.com",
    status: "active",
    lastScan: "12 hours ago",
    riskScore: 78,
    monitoring: false,
    scanCount: 15,
    threatCount: 6,
    tags: ["legacy", "marketing"],
  },
];

const ALL_TAGS = ["production", "marketing", "ecommerce", "content", "api", "backend", "docs", "development", "staging", "partners", "legacy"];

const RISK_COLOR = (score: number) => {
  if (score <= 20) return "#22C55E";
  if (score <= 40) return "#F59E0B";
  if (score <= 60) return "#F97316";
  return "#EF4444";
};

export default function InventoryPage() {
  const [websites, setWebsites] = useState<WebsiteEntry[]>(INITIAL_WEBSITES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newTags, setNewTags] = useState("");

  const filteredWebsites = useMemo(() => {
    return websites.filter((site) => {
      const matchesSearch =
        !searchQuery ||
        site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.domain.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => site.tags.includes(tag));
      return matchesSearch && matchesTags;
    });
  }, [websites, searchQuery, selectedTags]);

  const totalWebsites = websites.length;
  const activeCount = websites.filter((s) => s.status === "active").length;
  const needsAttention = websites.filter(
    (s) => s.status === "error" || s.riskScore > 50
  ).length;
  const avgScore = Math.round(
    websites.reduce((sum, s) => sum + s.riskScore, 0) / websites.length
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddWebsite = () => {
    if (!newName.trim() || !newDomain.trim()) return;
    const tags = newTags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const newSite: WebsiteEntry = {
      id: Date.now().toString(),
      name: newName,
      domain: newDomain.replace(/^https?:\/\//, "").replace(/\/.*$/, ""),
      status: "active",
      lastScan: "Just now",
      riskScore: Math.floor(Math.random() * 50) + 10,
      monitoring: true,
      scanCount: 1,
      threatCount: 0,
      tags,
    };
    setWebsites((prev) => [...prev, newSite]);
    setNewName("");
    setNewDomain("");
    setNewTags("");
    setShowAddForm(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-3xl font-bold text-text">Website Inventory</h1>
          <p className="mt-1 text-muted">
            Manage and monitor all your web properties in one place
          </p>
        </div>
        <GlowButton
          variant="primary"
          size="md"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? "Cancel" : "Add Website"}
        </GlowButton>
      </motion.div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6"
        >
          <GlassCard glow>
            <h3 className="text-sm font-semibold text-muted mb-4">Add New Website</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                type="text"
                placeholder="Website name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-11 px-4 rounded-xl bg-surface border border-border text-text text-sm placeholder:text-muted/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="text"
                  placeholder="Domain (e.g., example.com)"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddWebsite()}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface border border-border text-text text-sm placeholder:text-muted/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="h-11 px-4 rounded-xl bg-surface border border-border text-text text-sm placeholder:text-muted/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
              <GlowButton variant="primary" onClick={handleAddWebsite}>
                <Plus className="h-4 w-4" /> Add Website
              </GlowButton>
            </div>
          </GlassCard>
        </motion.div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          {
            label: "Total Websites",
            value: totalWebsites,
            icon: <Globe className="h-5 w-5" />,
            trend: "All properties",
            trendUp: true,
          },
          {
            label: "Active",
            value: activeCount,
            icon: <Activity className="h-5 w-5" />,
            trend: `${activeCount}/${totalWebsites} monitored`,
            trendUp: true,
          },
          {
            label: "Needs Attention",
            value: needsAttention,
            icon: <AlertTriangle className="h-5 w-5" />,
            trend: needsAttention > 0 ? "Action required" : "All clear",
            trendUp: needsAttention === 0,
          },
          {
            label: "Average Score",
            value: avgScore,
            icon: <BarChart3 className="h-5 w-5" />,
            trend: avgScore >= 60 ? "Healthy" : "Needs improvement",
            trendUp: avgScore >= 60,
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

      <motion.div custom={4} initial="hidden" animate="visible" variants={fadeInUp} className="mb-6">
        <GlassCard>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Search by name or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface border border-border text-text text-sm placeholder:text-muted/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-xs text-muted hover:text-text transition-colors flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Clear filters
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Tag className="h-3.5 w-3.5 text-muted mt-0.5" />
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                  selectedTags.includes(tag)
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border/30 bg-surface/30 text-muted hover:border-border-light"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredWebsites.map((site, i) => (
          <motion.div
            key={site.id}
            custom={i + 5}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <GlassCard hover>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text truncate">{site.name}</p>
                    <p className="text-xs text-muted truncate">{site.domain}</p>
                  </div>
                </div>
                <StatusBadge status={site.status} />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-muted">Risk Score:</span>
                <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${site.riskScore}%`,
                      backgroundColor: RISK_COLOR(site.riskScore),
                    }}
                  />
                </div>
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: RISK_COLOR(site.riskScore) }}
                >
                  {site.riskScore}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <Calendar className="h-3 w-3" />
                  {site.lastScan}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <Scan className="h-3 w-3" />
                  {site.scanCount} scans
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <Shield className="h-3 w-3" />
                  {site.monitoring ? "Monitored" : "Not monitored"}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <AlertTriangle className="h-3 w-3" />
                  {site.threatCount} threats
                </div>
              </div>

              {site.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {site.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface border border-border/30 text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {filteredWebsites.length === 0 && (
        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeInUp}>
          <GlassCard className="text-center py-12">
            <Search className="h-8 w-8 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No websites match your search or filter criteria.</p>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
