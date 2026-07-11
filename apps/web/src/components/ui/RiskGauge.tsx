"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { RISK_COLORS, RISK_LABELS } from "@cyberguard/shared";
import type { RiskLevel } from "@cyberguard/types";

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
}

export function RiskGauge({
  score,
  level,
  size = "md",
  className,
  animated = true,
}: RiskGaugeProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      return;
    }
    let start = 0;
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * score);
      setDisplayScore(start);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score, animated]);

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;
  const color = RISK_COLORS[level];

  const sizes = {
    sm: { w: 120, h: 120, text: "text-xl", label: "text-xs" },
    md: { w: 180, h: 180, text: "text-4xl", label: "text-sm" },
    lg: { w: 240, h: 240, text: "text-5xl", label: "text-base" },
  };

  const s = sizes[size];

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={s.w} height={s.h} className="-rotate-90">
        <circle
          cx={s.w / 2}
          cy={s.h / 2}
          r={45}
          fill="none"
          stroke="currentColor"
          strokeWidth={size === "lg" ? 8 : size === "md" ? 6 : 4}
          className="text-border"
        />
        <circle
          cx={s.w / 2}
          cy={s.h / 2}
          r={45}
          fill="none"
          stroke={color}
          strokeWidth={size === "lg" ? 8 : size === "md" ? 6 : 4}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300"
          style={{
            filter: `drop-shadow(0 0 6px ${color}40)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold", s.text)} style={{ color }}>
          {displayScore}
        </span>
        <span className={cn("font-medium text-muted", s.label)}>
          {RISK_LABELS[level]}
        </span>
      </div>
    </div>
  );
}
