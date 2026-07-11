"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WorkflowTimelineProps {
  steps: {
    number: number;
    title: string;
    description: string;
    icon: ReactNode;
  }[];
  className?: string;
}

export function WorkflowTimeline({ steps, className }: WorkflowTimelineProps) {
  return (
    <div className={cn("flex flex-col gap-8 md:flex-row md:gap-0", className)}>
      {steps.map((step, i) => (
        <div key={step.number} className="relative flex-1 flex flex-col items-center text-center">
          <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/30 text-primary transition-all hover:bg-primary/20 hover:shadow-[0_0_25px_rgba(0,229,255,0.4)]">
            {step.icon}
          </div>
          <h3 className="mt-4 text-base font-semibold text-text">{step.title}</h3>
          <p className="mt-2 text-sm text-muted max-w-[200px]">{step.description}</p>
          {i < steps.length - 1 && (
            <div className="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-gradient-to-r from-primary/40 to-primary/10" />
          )}
        </div>
      ))}
    </div>
  );
}
