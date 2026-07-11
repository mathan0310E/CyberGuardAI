"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative mb-8">
          <div className="text-[120px] font-bold text-gradient opacity-20 leading-none">404</div>
          <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 text-primary/60" />
        </div>
        <h1 className="text-2xl font-bold text-text mb-2">Page Not Found</h1>
        <p className="text-muted mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>
        <Link href="/">
          <GlowButton>
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </GlowButton>
        </Link>
      </motion.div>
    </div>
  );
}
