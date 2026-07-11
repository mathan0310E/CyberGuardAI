"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatsCard({
  label,
  value,
  icon,
  trend,
  trendUp,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl glass p-5 transition-all duration-300 hover:glow-border group",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold text-text">{value}</p>
          {trend && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                trendUp ? "text-success" : "text-danger"
              )}
            >
              {trend}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary/20 group-hover:shadow-[0_0_15px_rgba(0,229,255,0.3)]">
          {icon}
        </div>
      </div>
    </div>
  );
}
