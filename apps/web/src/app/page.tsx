"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Scan,
  Brain,
  FileText,
  Lock,
  Eye,
  Zap,
  Globe,
  Code,
  Camera,
  Search,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { WorkflowTimeline } from "@/components/ui/WorkflowTimeline";
import { StatsCard } from "@/components/ui/StatsCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/lib/auth-context";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const FEATURES = [
  { icon: <Scan className="h-6 w-6" />, title: "Deep Site Scanning", description: "Comprehensive HTML, JavaScript, and resource analysis with automated threat detection." },
  { icon: <Brain className="h-6 w-6" />, title: "AI-Powered Analysis", description: "Structured threat intelligence fed into advanced AI models for accurate risk assessment." },
  { icon: <Eye className="h-6 w-6" />, title: "Computer Vision", description: "Visual analysis of page layouts to detect phishing patterns and fake login pages." },
  { icon: <Lock className="h-6 w-6" />, title: "Threat Intelligence", description: "Correlation with VirusTotal, URLScan, AbuseIPDB, and NVD CVE databases." },
  { icon: <FileText className="h-6 w-6" />, title: "PDF Reports", description: "Professional, detailed security reports with executive summaries and recommendations." },
  { icon: <Code className="h-6 w-6" />, title: "JS Analysis", description: "Detect obfuscated code, eval usage, crypto miners, and drive-by download scripts." },
  { icon: <Camera className="h-6 w-6" />, title: "OCR & Screenshots", description: "Full-page screenshots with text extraction for credential harvesting detection." },
  { icon: <BarChart3 className="h-6 w-6" />, title: "Risk Dashboard", description: "Real-time threat monitoring with charts, trends, and activity timelines." },
  { icon: <Search className="h-6 w-6" />, title: "Phishing Detection", description: "Identify fake login pages, suspicious forms, and credential harvesting attempts." },
];

const WORKFLOW_STEPS = [
  { number: 1, title: "Enter URL", description: "Paste any website URL into the scanner", icon: <Globe className="h-6 w-6" /> },
  { number: 2, title: "Scan & Analyze", description: "Multi-layer analysis of HTML, JS, screenshots, and threat intel", icon: <Search className="h-6 w-6" /> },
  { number: 3, title: "AI Assessment", description: "Structured data fed to AI for risk scoring and explanations", icon: <Brain className="h-6 w-6" /> },
  { number: 4, title: "Report", description: "Professional PDF with findings, charts, and recommendations", icon: <FileText className="h-6 w-6" /> },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-24 pb-32 text-center overflow-hidden">
        <div className="absolute inset-0 aurora opacity-50" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
            <Zap className="h-3 w-3" />
            AI-Powered Threat Detection
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl">
            Detect Threats.
            <br />
            <span className="text-gradient">Protect Websites.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            CyberGuard AI scans any website for malware, phishing, and security threats
            using advanced AI analysis, computer vision, and threat intelligence correlation.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link href={isAuthenticated ? "/scanner" : "/auth/register"}>
              <GlowButton size="lg">
                Start Scanning
                <ArrowRight className="h-4 w-4" />
              </GlowButton>
            </Link>
            <Link href="/dashboard">
              <GlowButton variant="secondary" size="lg">
                View Dashboard
              </GlowButton>
            </Link>
          </div>
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Stats */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Scans Performed", value: "12,847", icon: <Scan className="h-5 w-5" /> },
            { label: "Threats Detected", value: "3,291", icon: <Shield className="h-5 w-5" /> },
            { label: "Sites Cleaned", value: "9,556", icon: <Lock className="h-5 w-5" /> },
            { label: "Reports Generated", value: "8,124", icon: <FileText className="h-5 w-5" /> },
          ].map((stat, i) => (
            <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} custom={0}>
            <SectionTitle
              title="Comprehensive Threat Detection"
              subtitle="Multi-layered analysis covering every aspect of website security"
            />
          </motion.div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <motion.div key={feature.title} custom={i + 1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} custom={0}>
            <SectionTitle
              title="How It Works"
              subtitle="From URL to comprehensive security report in seconds"
            />
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} custom={1} className="mt-12">
            <WorkflowTimeline steps={WORKFLOW_STEPS} />
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} custom={0}>
          <GlassCard glow className="mx-auto max-w-3xl text-center p-12">
            <h2 className="text-3xl font-bold text-text">Ready to Secure Your Website?</h2>
            <p className="mt-4 text-muted">Get started with a comprehensive security scan in seconds.</p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Link href={isAuthenticated ? "/scanner" : "/auth/register"}>
                <GlowButton size="lg">
                  Start Free Scan
                  <ArrowRight className="h-4 w-4" />
                </GlowButton>
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-bold text-gradient">CyberGuardAI</span>
              </div>
              <p className="text-sm text-muted">AI-Powered Website Security Analysis Platform. Defensive security tools for modern businesses.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text mb-3">Product</h4>
              <div className="space-y-2 text-sm text-muted">
                <Link href="/scanner" className="block hover:text-text transition-colors">Scanner</Link>
                <Link href="/reports" className="block hover:text-text transition-colors">Reports</Link>
                <Link href="/chat" className="block hover:text-text transition-colors">AI Chat</Link>
                <Link href="/history" className="block hover:text-text transition-colors">History</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text mb-3">Company</h4>
              <div className="space-y-2 text-sm text-muted">
                <Link href="/about" className="block hover:text-text transition-colors">About</Link>
                <Link href="/dashboard" className="block hover:text-text transition-colors">Dashboard</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text mb-3">Legal</h4>
              <div className="space-y-2 text-sm text-muted">
                <Link href="/privacy" className="block hover:text-text transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="block hover:text-text transition-colors">Terms & Conditions</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted">
              &copy; {new Date().getFullYear()} CyberGuard AI. Defensive security analysis only.
            </p>
            <p className="text-xs text-muted">Built with enterprise-grade security in mind.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
