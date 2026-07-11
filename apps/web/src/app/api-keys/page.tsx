"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Copy,
  Trash2,
  RefreshCw,
  Activity,
  Clock,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { PremiumBadge } from "@/components/premium/PremiumBadge";
import { StatusBadge } from "@/components/premium/StatusBadge";
import { PremiumStatCard } from "@/components/premium/PremiumStatCard";
import { cn } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

interface APIKeyItem {
  id: string;
  name: string;
  key: string;
  prefix: string;
  createdAt: string;
  lastUsed: string | null;
  expiresAt: string | null;
  status: "active" | "revoked" | "expired";
  usageCount: number;
  permissions: string[];
}

const mockKeys: APIKeyItem[] = [
  {
    id: "1", name: "Production API Key", key: "cg_prod_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    prefix: "cg_prod_a1b2", createdAt: "2025-11-15", lastUsed: "2026-01-10T14:30:00Z",
    expiresAt: "2026-11-15", status: "active", usageCount: 4521, permissions: ["read:scans", "write:scans", "read:reports"],
  },
  {
    id: "2", name: "Staging API Key", key: "cg_stag_x7y8z9w0v1u2t3s4r5q6p7o8n9m0l1k2",
    prefix: "cg_stag_x7y8", createdAt: "2025-12-20", lastUsed: "2026-01-09T09:15:00Z",
    expiresAt: "2026-06-20", status: "active", usageCount: 892, permissions: ["read:scans", "read:reports"],
  },
  {
    id: "3", name: "Legacy Integration", key: "cg_leg_m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8",
    prefix: "cg_leg_m3n4", createdAt: "2025-06-01", lastUsed: null,
    expiresAt: "2025-12-01", status: "expired", usageCount: 12043, permissions: ["read:scans", "write:scans", "read:reports", "admin"],
  },
];

const allPermissions = ["read:scans", "write:scans", "read:reports", "admin"];

export default function APIKeysPage() {
  const [keys, setKeys] = useState<APIKeyItem[]>(mockKeys);
  const [showForm, setShowForm] = useState(false);
  const [newKey, setNewKey] = useState({ name: "", permissions: [] as string[] });
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const revokeKey = (id: string) => {
    setKeys((prev) => prev.map((k) => k.id === id ? { ...k, status: "revoked" as const } : k));
  };

  const handleCreate = () => {
    if (!newKey.name) return;
    const generatedKey = `cg_${Math.random().toString(36).slice(2, 6)}_${Array.from({ length: 32 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("")}`;
    setKeys((prev) => [
      {
        id: String(Date.now()),
        name: newKey.name,
        key: generatedKey,
        prefix: generatedKey.slice(0, 12),
        createdAt: new Date().toISOString().slice(0, 10),
        lastUsed: null,
        expiresAt: null,
        status: "active",
        usageCount: 0,
        permissions: newKey.permissions,
      },
      ...prev,
    ]);
    setNewKey({ name: "", permissions: [] });
    setShowForm(false);
  };

  const togglePermission = (perm: string) => {
    setNewKey((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-text">API Key Management</h1>
            <PremiumBadge />
          </div>
          <p className="mt-1 text-muted">Generate and manage API keys for programmatic access</p>
        </div>
        <GlowButton onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> Generate Key
        </GlowButton>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[
          { label: "Total Calls Today", value: 1247, icon: <Activity className="h-5 w-5" />, trend: "+18%", trendUp: true },
          { label: "Success Rate", value: 99.7, icon: <CheckCircle className="h-5 w-5" />, suffix: "%", decimals: 1, trend: "+0.2%", trendUp: true },
          { label: "Avg Response", value: 142, icon: <Clock className="h-5 w-5" />, suffix: "ms", trend: "-12ms", trendUp: true },
        ].map((stat, i) => (
          <motion.div key={stat.label} custom={i} initial="hidden" animate="visible" variants={fadeInUp}>
            <PremiumStatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
          <GlassCard className="mb-6 glow-border">
            <h3 className="text-sm font-semibold text-text mb-4">Generate New API Key</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted">Key Name</label>
                <input
                  type="text"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                  placeholder="e.g., Production API Key"
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Permissions</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {allPermissions.map((perm) => (
                    <button
                      key={perm}
                      onClick={() => togglePermission(perm)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-medium border transition-all",
                        newKey.permissions.includes(perm)
                          ? "bg-primary/15 text-primary border-primary/30"
                          : "bg-surface text-muted border-border hover:border-border-light"
                      )}
                    >
                      {perm}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <GlowButton onClick={handleCreate} size="sm">Create Key</GlowButton>
                <GlowButton variant="ghost" onClick={() => setShowForm(false)} size="sm">Cancel</GlowButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      <motion.div custom={3} initial="hidden" animate="visible" variants={fadeInUp}>
        <GlassCard>
          <h3 className="text-sm font-semibold text-muted mb-4">API Keys</h3>
          <div className="space-y-3">
            {keys.map((apiKey) => (
              <div key={apiKey.id} className="rounded-xl border border-border/50 p-4 hover:bg-surface/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-text">{apiKey.name}</h4>
                      <StatusBadge status={apiKey.status} />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="rounded-lg bg-surface px-3 py-1.5 text-xs font-mono text-muted">
                        {visibleKeys.has(apiKey.id) ? apiKey.key : `${apiKey.prefix}${"*".repeat(24)}`}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="p-1 rounded-lg text-muted hover:text-text hover:bg-surface transition-colors"
                      >
                        {visibleKeys.has(apiKey.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => copyKey(apiKey.key, apiKey.id)}
                        className="p-1 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        {copiedId === apiKey.id ? <CheckCircle className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {apiKey.permissions.map((p) => (
                        <span key={p} className="rounded-md bg-surface px-2 py-0.5 text-[10px] font-medium text-muted border border-border/50">
                          {p}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted">
                      <span>Created: {apiKey.createdAt}</span>
                      <span>Last used: {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : "Never"}</span>
                      <span>Usage: {apiKey.usageCount.toLocaleString()} calls</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-4">
                    {apiKey.status === "active" && (
                      <>
                        <button className="p-1.5 rounded-lg text-muted hover:text-warning hover:bg-warning/10 transition-colors" title="Rotate key">
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button onClick={() => revokeKey(apiKey.id)} className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors" title="Revoke key">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
