"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group rounded-2xl glass p-6 transition-all duration-300",
        "hover:glow-border hover:scale-[1.02] hover:bg-surface/80 cursor-pointer",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary/20 group-hover:shadow-[0_0_15px_rgba(124,58,237,0.3)]">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-text">{title}</h3>
      <p className="mt-2 text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );
}
