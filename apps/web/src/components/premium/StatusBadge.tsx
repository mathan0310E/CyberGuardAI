"use client";

import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/15 text-success border-success/30",
  paused: "bg-warning/15 text-warning border-warning/30",
  error: "bg-danger/15 text-danger border-danger/30",
  invited: "bg-info/15 text-info border-info/30",
  disabled: "bg-muted/15 text-muted border-muted/30",
  revoked: "bg-danger/15 text-danger border-danger/30",
  expired: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  investigating: "bg-warning/15 text-warning border-warning/30",
  resolved: "bg-success/15 text-success border-success/30",
  blocked: "bg-danger/15 text-danger border-danger/30",
  open: "bg-info/15 text-info border-info/30",
  in_progress: "bg-warning/15 text-warning border-warning/30",
  failed: "bg-danger/15 text-danger border-danger/30",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
        STATUS_STYLES[status] ?? "bg-muted/15 text-muted border-muted/30",
        className
      )}
    >
      <span className={cn(
        "h-1.5 w-1.5 rounded-full mr-1.5",
        status === "active" && "bg-success animate-pulse",
        status === "error" && "bg-danger animate-pulse",
        status === "paused" && "bg-warning",
        !["active", "error", "paused"].includes(status) && "bg-current opacity-50"
      )} />
      {status}
    </span>
  );
}
