"use client";

import { cn } from "@/lib/utils";
import { RISK_COLORS } from "@cyberguard/shared";
import { Check, Loader2 } from "lucide-react";

interface ProgressTimelineProps {
  steps: { label: string; status: "completed" | "active" | "pending" }[];
  className?: string;
}

export function ProgressTimeline({ steps, className }: ProgressTimelineProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const color =
          step.status === "completed"
            ? RISK_COLORS.safe
            : step.status === "active"
            ? "#00E5FF"
            : "#334155";

        return (
          <div key={step.label} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all"
                style={{ borderColor: color, backgroundColor: step.status === "completed" ? color : "transparent" }}
              >
                {step.status === "completed" && (
                  <Check className="h-3.5 w-3.5 text-[#07090D]" />
                )}
                {step.status === "active" && (
                  <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                )}
                {step.status === "pending" && (
                  <div className="h-2 w-2 rounded-full bg-border" />
                )}
              </div>
              {!isLast && (
                <div
                  className="w-0.5 h-6 mt-1 transition-colors"
                  style={{ backgroundColor: step.status === "completed" ? color : "#1F2937" }}
                />
              )}
            </div>
            <div className="pt-0.5">
              <p
                className={cn(
                  "text-sm font-medium transition-colors",
                  step.status === "pending" ? "text-muted" : "text-text"
                )}
              >
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
