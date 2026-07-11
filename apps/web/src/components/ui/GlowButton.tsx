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
          "cyber-btn inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 uppercase tracking-wider",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:opacity-40 disabled:pointer-events-none",
          variant === "primary" && "cyber-btn-primary",
          variant === "secondary" && "cyber-btn-secondary",
          variant === "ghost" && "text-muted hover:text-primary hover:bg-primary/5",
          variant === "danger" && "cyber-btn-danger",
          size === "sm" && "h-9 px-4 text-[11px]",
          size === "md" && "h-11 px-6 text-xs",
          size === "lg" && "h-13 px-10 text-sm",
          className
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      </button>
    );
  }
);

GlowButton.displayName = "GlowButton";
