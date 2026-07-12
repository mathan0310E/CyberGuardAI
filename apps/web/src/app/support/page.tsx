"use client";

import { motion } from "framer-motion";
import { Mail, MessageSquare, FileText } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-5 lg:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-text">Support</h1>
        <p className="mt-1 text-muted">Get help with CyberGuard AI</p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard hover className="flex flex-col items-center text-center py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-text mb-2">Email Support</h3>
            <p className="text-xs text-muted mb-4">Reach out to our team via email for detailed assistance.</p>
            <a href="mailto:support@cyberguard.ai" className="text-xs font-medium text-primary hover:text-primary-light transition-colors">
              support@cyberguard.ai
            </a>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard hover className="flex flex-col items-center text-center py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent mb-4">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-text mb-2">AI Assistant</h3>
            <p className="text-xs text-muted mb-4">Use our AI chat to get instant answers about your security scans.</p>
            <a href="/chat" className="text-xs font-medium text-primary hover:text-primary-light transition-colors">
              Open AI Chat
            </a>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard hover className="flex flex-col items-center text-center py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-text mb-2">Documentation</h3>
            <p className="text-xs text-muted mb-4">Browse our documentation for guides and best practices.</p>
            <a href="/about" className="text-xs font-medium text-primary hover:text-primary-light transition-colors">
              View Docs
            </a>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
