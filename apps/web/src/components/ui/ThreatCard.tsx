"use client";

import { cn } from "@/lib/utils";
import { RISK_COLORS } from "@cyberguard/shared";
import type { RiskLevel, ThreatCategory } from "@cyberguard/types";
import { THREAT_CATEGORY_LABELS } from "@cyberguard/shared";
import { AlertTriangle, AlertCircle, ShieldAlert, Info } from "lucide-react";

interface ThreatCardProps {
  category: ThreatCategory;
  severity: RiskLevel;
  title: string;
  description: string;
  evidence?: string;
  className?: string;
}

const severityIcons = {
  safe: Info,
  low: Info,
  medium: AlertCircle,
  high: AlertTriangle,
  critical: ShieldAlert,
};

export function ThreatCard({
  category,
  severity,
  title,
  description,
  evidence,
  className,
}: ThreatCardProps) {
  const Icon = severityIcons[severity];
  const color = RISK_COLORS[severity];

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-300 hover:shadow-lg",
        className
      )}
      style={{
        borderColor: `${color}30`,
        backgroundColor: `${color}08`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-text">{title}</h4>
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${color}20`,
                color,
              }}
            >
              {THREAT_CATEGORY_LABELS[category]}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{description}</p>
          {evidence && (
            <pre className="mt-2 rounded-lg bg-background/50 p-2 text-xs text-muted overflow-x-auto">
              {evidence}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
