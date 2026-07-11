"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Shield, AlertTriangle, CheckCircle, Loader2, Search } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { RISK_COLORS } from "@cyberguard/shared";
import { api } from "@/lib/api";
import type { RiskLevel } from "@cyberguard/types";
import { formatDistanceToNow } from "date-fns";

export default function HistoryPage() {
  const [scans, setScans] = useState<Array<{
    _id: string;
    url: string;
    domain: string;
    riskScore: number;
    riskLevel: RiskLevel;
    status: string;
    startedAt: string;
    duration: number | null;
    malwareIndicators: unknown[];
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.listScans(1, 100)
      .then((result) => setScans(result.data as unknown as typeof scans))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = scans.filter((s) =>
    !search || s.domain.toLowerCase().includes(search.toLowerCase()) || s.url.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-5 lg:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-text">Scan History</h1>
        <p className="mt-1 text-muted">Browse all your previous scans</p>
      </motion.div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by domain or URL..."
          className="w-full rounded-xl bg-surface border border-border pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((scan, i) => (
          <motion.div
            key={scan._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link href="/scanner">
              <GlassCard hover className="flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${RISK_COLORS[scan.riskLevel]}20` }}
                  >
                    {scan.riskLevel === "critical" || scan.riskLevel === "high" ? (
                      <AlertTriangle className="h-5 w-5" style={{ color: RISK_COLORS[scan.riskLevel] }} />
                    ) : scan.riskLevel === "safe" || scan.riskLevel === "low" ? (
                      <CheckCircle className="h-5 w-5" style={{ color: RISK_COLORS[scan.riskLevel] }} />
                    ) : (
                      <Shield className="h-5 w-5" style={{ color: RISK_COLORS[scan.riskLevel] }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text">{scan.domain}</p>
                    <p className="text-xs text-muted truncate">{scan.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-muted hidden sm:flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(scan.startedAt), { addSuffix: true })}
                  </span>
                  <span className="text-xs text-muted hidden sm:block">
                    {scan.malwareIndicators.length} threats
                  </span>
                  {scan.duration && (
                    <span className="text-xs text-muted hidden sm:block">{scan.duration}s</span>
                  )}
                  <span
                    className="text-sm font-bold"
                    style={{ color: RISK_COLORS[scan.riskLevel] }}
                  >
                    {scan.riskScore}
                  </span>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Clock className="h-12 w-12 text-muted/30 mx-auto mb-4" />
          <p className="text-muted">No scan history found.</p>
        </div>
      )}
    </div>
  );
}
