"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export function LoadingOverlay({ message = "Loading...", className }: LoadingOverlayProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-20", className)}>
      <div className="relative">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <div className="absolute inset-0 h-10 w-10 rounded-full bg-primary/20 animate-ping" />
      </div>
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}
