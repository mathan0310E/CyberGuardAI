"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-text mb-2">Terms & Conditions</h1>
        <p className="text-sm text-muted mb-8">Last updated: July 11, 2026</p>

        <GlassCard className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-text mb-2">1. Acceptance of Terms</h2>
            <p className="text-sm text-muted leading-relaxed">
              By accessing or using CyberGuard AI, you agree to be bound by these Terms & Conditions. If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-2">2. Service Description</h2>
            <p className="text-sm text-muted leading-relaxed">
              CyberGuard AI is a defensive security analysis platform that scans websites for malware, phishing, and security threats. The service is strictly defensive and does not perform offensive security actions, exploit execution, or unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-2">3. Acceptable Use</h2>
            <p className="text-sm text-muted leading-relaxed">
              You may only scan websites you own or have explicit authorization to analyze. You may not use the service for unauthorized scanning, competitive intelligence gathering, or any illegal purpose.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-2">4. Account Responsibility</h2>
            <p className="text-sm text-muted leading-relaxed">
              You are responsible for maintaining the security of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-2">5. Limitation of Liability</h2>
            <p className="text-sm text-muted leading-relaxed">
              CyberGuard AI provides security analysis as-is. While we strive for accuracy, we do not guarantee that all threats will be detected. You are responsible for implementing additional security measures as appropriate for your use case.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-2">6. Subscription & Billing</h2>
            <p className="text-sm text-muted leading-relaxed">
              Paid plans are billed according to the selected subscription tier. You may cancel your subscription at any time. Refunds are handled on a case-by-case basis.
            </p>
          </section>
        </GlassCard>
      </motion.div>
    </div>
  );
}
