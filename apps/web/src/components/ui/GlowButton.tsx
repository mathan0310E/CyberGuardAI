"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  (
    { className, variant = "primary", size = "md", children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:opacity-50 disabled:pointer-events-none",
          variant === "primary" &&
            "bg-gradient-to-r from-primary to-[#00B4D8] text-[#07090D] font-semibold hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] hover:from-primary-light hover:to-[#33EBFF] active:scale-[0.98]",
          variant === "secondary" &&
            "bg-surface text-text border border-primary/20 hover:border-primary/40 hover:bg-surface-elevated hover:shadow-[0_0_20px_rgba(0,229,255,0.15)]",
          variant === "ghost" &&
            "text-muted hover:text-primary hover:bg-primary/5",
          variant === "danger" &&
            "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]",
          size === "sm" && "h-8 px-3 text-xs",
          size === "md" && "h-10 px-5 text-sm",
          size === "lg" && "h-12 px-8 text-base",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GlowButton.displayName = "GlowButton";
