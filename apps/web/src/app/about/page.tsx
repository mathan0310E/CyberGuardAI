"use client";

import { motion } from "framer-motion";
import { Shield, Target, Users, Lock, Eye, Zap } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/ui/SectionTitle";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 },
  }),
};

const VALUES = [
  { icon: <Shield className="h-6 w-6" />, title: "Defensive First", description: "We only build defensive security tools. Our platform is designed to protect, never to exploit." },
  { icon: <Eye className="h-6 w-6" />, title: "Transparency", description: "Every detection comes with clear evidence, explanations, and actionable recommendations." },
  { icon: <Zap className="h-6 w-6" />, title: "AI-Powered", description: "Leveraging cutting-edge AI models to provide deeper threat analysis than traditional scanners." },
  { icon: <Users className="h-6 w-6" />, title: "For Teams", description: "Built for startups, SMBs, and enterprise security teams who need reliable threat detection." },
  { icon: <Lock className="h-6 w-6" />, title: "Privacy Focused", description: "We don't store your data unnecessarily. Scans are performed securely and results are yours." },
  { icon: <Target className="h-6 w-6" />, title: "Accuracy", description: "Multi-layered analysis combining HTML inspection, JS analysis, threat intel, and AI reasoning." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <h1 className="text-4xl font-bold text-text mb-4">About CyberGuard AI</h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          We&apos;re building the next generation of AI-powered defensive cybersecurity tools to help businesses protect their users and infrastructure.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <GlassCard className="mb-12">
          <h2 className="text-2xl font-bold text-text mb-4">Our Mission</h2>
          <p className="text-muted leading-relaxed">
            CyberGuard AI was created to democratize website security analysis. We believe every business — from solo developers to enterprise teams — deserves access to professional-grade threat detection. Our platform combines traditional security analysis with advanced AI to provide comprehensive, actionable security assessments that help teams identify and remediate threats before they impact users.
          </p>
        </GlassCard>
      </motion.div>

      <SectionTitle title="Our Values" subtitle="The principles that guide everything we build" />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {VALUES.map((value, i) => (
          <motion.div key={value.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <GlassCard hover className="h-full">
              <div className="text-primary mb-3">{value.icon}</div>
              <h3 className="text-lg font-semibold text-text mb-2">{value.title}</h3>
              <p className="text-sm text-muted">{value.description}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
