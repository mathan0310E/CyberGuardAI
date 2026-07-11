"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./AnimatedCounter";

interface PremiumStatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  glowColor?: string;
}

export function PremiumStatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
  glowColor = "rgba(0,229,255,0.15)",
}: PremiumStatCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl glass p-5 transition-all duration-300 hover:glow-border group overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${glowColor}, transparent 70%)`,
        }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold text-text">
            <AnimatedCounter value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
          </p>
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
