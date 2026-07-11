"use client";

import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionTitle({
  title,
  subtitle,
  align = "center",
  className,
}: SectionTitleProps) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gradient-warm">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-2xl text-lg text-muted mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
