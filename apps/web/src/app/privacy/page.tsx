"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-text mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted mb-8">Last updated: July 11, 2026</p>

        <GlassCard className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-text mb-2">1. Information We Collect</h2>
            <p className="text-sm text-muted leading-relaxed">
              We collect information you provide directly: account details (name, email, company), scan URLs you submit, and chat messages with our AI assistant. We also collect usage data such as scan history and feature interactions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-2">2. How We Use Your Information</h2>
            <p className="text-sm text-muted leading-relaxed">
              Your information is used to provide and improve our security scanning services, generate reports, and communicate with you about your account. We do not sell or share your personal data with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-2">3. Data Security</h2>
            <p className="text-sm text-muted leading-relaxed">
              We implement industry-standard security measures including encrypted data transmission (HTTPS), secure authentication (JWT), and access controls. Scan data is processed securely and results belong to you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-2">4. Data Retention</h2>
            <p className="text-sm text-muted leading-relaxed">
              Scan results and reports are retained according to your subscription plan. You may delete your data at any time through the dashboard. Account data is retained until you request deletion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-2">5. Third-Party Services</h2>
            <p className="text-sm text-muted leading-relaxed">
              We use third-party threat intelligence services (VirusTotal, URLScan, AbuseIPDB) to enhance scan accuracy. These services receive only the domain/IP being analyzed, not your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text mb-2">6. Contact</h2>
            <p className="text-sm text-muted leading-relaxed">
              For privacy-related inquiries, contact us at privacy@cyberguard.ai
            </p>
          </section>
        </GlassCard>
      </motion.div>
    </div>
  );
}
