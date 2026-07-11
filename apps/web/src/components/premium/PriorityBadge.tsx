"use client";

import { cn } from "@/lib/utils";

type PriorityType = "critical" | "high" | "medium" | "low";

const PRIORITY_STYLES: Record<PriorityType, string> = {
  critical: "bg-danger/15 text-danger border-danger/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  low: "bg-success/15 text-success border-success/30",
};

interface PriorityBadgeProps {
  priority: PriorityType;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
        PRIORITY_STYLES[priority] ?? "bg-muted/15 text-muted border-muted/30",
        className
      )}
    >
      {priority}
    </span>
  );
}
