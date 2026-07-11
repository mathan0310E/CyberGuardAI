"use client";

import { cn } from "@/lib/utils";

interface PremiumChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function PremiumChartCard({ title, children, className, action }: PremiumChartCardProps) {
  return (
    <div className={cn("rounded-2xl glass p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
