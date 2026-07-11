"use client";

import { useEffect } from "react";
import { GlowButton } from "@/components/ui/GlowButton";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="mb-6 h-16 w-16 rounded-2xl bg-danger/20 flex items-center justify-center">
        <span className="text-2xl font-bold text-danger">!</span>
      </div>
      <h1 className="text-2xl font-bold text-text mb-2">Something went wrong</h1>
      <p className="text-muted mb-8 max-w-md">
        An unexpected error occurred. Please try again or contact support if the issue persists.
      </p>
      <GlowButton onClick={reset} variant="secondary">
        Try Again
      </GlowButton>
    </div>
  );
}
