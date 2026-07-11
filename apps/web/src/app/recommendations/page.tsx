"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Clock,
  Target,
  Lightbulb,
  CheckCircle2,
  Circle,
  Loader2,
  Filter,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/components/premium/PriorityBadge";
import { StatusBadge } from "@/components/premium/StatusBadge";
import { AnimatedCounter } from "@/components/premium/AnimatedCounter";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved";
  businessImpact: string;
  suggestedFix: string;
  estimatedEffort: string;
  domain: string;
  createdDate: string;
  category: string;
}

const recommendations: Recommendation[] = [
  {
    id: "1",
    title: "SQL Injection Vulnerability in Login Endpoint",
    description:
      "The authentication endpoint at /api/auth/login is vulnerable to SQL injection attacks. User input is directly concatenated into database queries without parameterization.",
    priority: "critical",
    status: "open",
    businessImpact:
      "Full database compromise, unauthorized access to all user accounts, potential data breach affecting 50,000+ users.",
    suggestedFix:
      "Implement parameterized queries or use an ORM. Add input validation and sanitization middleware. Deploy a WAF rule as an immediate mitigation.",
    estimatedEffort: "4-8 hours",
    domain: "api.cyberguard.io",
    createdDate: "Jul 5, 2025",
    category: "Injection",
  },
  {
    id: "2",
    title: "Expired SSL Certificate on Staging Environment",
    description:
      "The SSL certificate for staging.cyberguard.io expired 3 days ago. This exposes staging traffic to man-in-the-middle attacks.",
    priority: "critical",
    status: "in_progress",
    businessImpact:
      "Staging environment data exposed, developer credentials at risk, compliance violation for SOC 2.",
    suggestedFix:
      "Renew the SSL certificate immediately. Set up automated certificate renewal using Let's Encrypt or cert-manager.",
    estimatedEffort: "1-2 hours",
    domain: "staging.cyberguard.io",
    createdDate: "Jul 3, 2025",
    category: "Configuration",
  },
  {
    id: "3",
    title: "Cross-Site Scripting (XSS) in User Profile Page",
    description:
      "User-submitted content in the profile bio field is rendered without proper escaping, allowing stored XSS attacks.",
    priority: "high",
    status: "open",
    businessImpact:
      "Attackers can inject malicious scripts that execute in other users' browsers, stealing session tokens and personal data.",
    suggestedFix:
      "Implement Content Security Policy headers, sanitize all user input with DOMPurify, and use React's built-in XSS protection.",
    estimatedEffort: "2-4 hours",
    domain: "app.cyberguard.io",
    createdDate: "Jul 4, 2025",
    category: "XSS",
  },
  {
    id: "4",
    title: "Missing Rate Limiting on API Endpoints",
    description:
      "No rate limiting is configured on public-facing API endpoints, making them vulnerable to brute-force and DDoS attacks.",
    priority: "high",
    status: "in_progress",
    businessImpact:
      "Service degradation under attack, potential brute-force compromise of user accounts, increased infrastructure costs.",
    suggestedFix:
      "Implement rate limiting using Redis-backed middleware. Configure different limits for authenticated and unauthenticated requests.",
    estimatedEffort: "6-10 hours",
    domain: "api.cyberguard.io",
    createdDate: "Jul 2, 2025",
    category: "Availability",
  },
  {
    id: "5",
    title: "Insecure Direct Object Reference in File Download",
    description:
      "File download endpoint allows users to access any file by incrementing the file ID, bypassing authorization checks.",
    priority: "high",
    status: "open",
    businessImpact:
      "Unauthorized access to sensitive documents, potential exposure of confidential business data and customer records.",
    suggestedFix:
      "Implement proper authorization checks. Use UUIDs instead of sequential IDs. Add access control verification before serving files.",
    estimatedEffort: "3-5 hours",
    domain: "files.cyberguard.io",
    createdDate: "Jul 1, 2025",
    category: "Access Control",
  },
  {
    id: "6",
    title: "Outdated Dependencies with Known Vulnerabilities",
    description:
      "12 npm packages have known critical vulnerabilities. Including lodash 4.17.20, axios 0.21.1, and express 4.17.1.",
    priority: "medium",
    status: "open",
    businessImpact:
      "Exposure to known exploits, potential supply chain attacks, compliance audit findings.",
    suggestedFix:
      "Run npm audit fix, update all packages to latest stable versions, integrate Dependabot for automated dependency updates.",
    estimatedEffort: "4-6 hours",
    domain: "app.cyberguard.io",
    createdDate: "Jun 28, 2025",
    category: "Dependencies",
  },
  {
    id: "7",
    title: "Insufficient Logging and Monitoring",
    description:
      "Security-critical events like failed login attempts, privilege escalations, and data access are not being logged.",
    priority: "medium",
    status: "in_progress",
    businessImpact:
      "Inability to detect ongoing attacks, delayed incident response, compliance gaps for PCI DSS and SOC 2.",
    suggestedFix:
      "Implement structured logging for all security events. Integrate with SIEM. Set up alerting for anomalous patterns.",
    estimatedEffort: "8-12 hours",
    domain: "infrastructure",
    createdDate: "Jun 25, 2025",
    category: "Monitoring",
  },
  {
    id: "8",
    title: "Weak Password Policy Enforcement",
    description:
      "Current password policy only requires 6 characters with no complexity requirements. No breach database checking.",
    priority: "medium",
    status: "open",
    businessImpact:
      "Easier credential stuffing attacks, increased risk of account takeovers, weak compliance posture.",
    suggestedFix:
      "Enforce minimum 12 characters with complexity rules. Integrate HaveIBeenPwned API for breach checking. Add MFA enforcement for admin accounts.",
    estimatedEffort: "3-4 hours",
    domain: "auth.cyberguard.io",
    createdDate: "Jun 20, 2025",
    category: "Authentication",
  },
  {
    id: "9",
    title: "Missing Security Headers on Main Domain",
    description:
      "HTTP response headers are missing X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, and Content-Security-Policy.",
    priority: "low",
    status: "open",
    businessImpact:
      "Increased susceptibility to clickjacking, MIME sniffing attacks, and protocol downgrade attacks.",
    suggestedFix:
      "Configure security headers in the web server or middleware. Use helmet.js for Express or configure at the CDN level.",
    estimatedEffort: "1-2 hours",
    domain: "cyberguard.io",
    createdDate: "Jun 18, 2025",
    category: "Configuration",
  },
  {
    id: "10",
    title: "CORS Configuration Allows All Origins",
    description:
      "The API server has Access-Control-Allow-Origin set to wildcard (*), allowing any website to make authenticated requests.",
    priority: "low",
    status: "resolved",
    businessImpact:
      "Cross-origin abuse potential, CSRF-like attacks from malicious websites, data exfiltration risk.",
    suggestedFix:
      "Whitelist specific trusted origins. Implement CSRF tokens for state-changing operations.",
    estimatedEffort: "2-3 hours",
    domain: "api.cyberguard.io",
    createdDate: "Jun 15, 2025",
    category: "Configuration",
  },
];

const filterOptions = [
  { key: "all", label: "All", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  { key: "critical", label: "Critical", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { key: "high", label: "High", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { key: "medium", label: "Medium", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { key: "low", label: "Low", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
];

export default function RecommendationsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});

  const counts = useMemo(() => ({
    critical: recommendations.filter((r) => r.priority === "critical").length,
    high: recommendations.filter((r) => r.priority === "high").length,
    medium: recommendations.filter((r) => r.priority === "medium").length,
    low: recommendations.filter((r) => r.priority === "low").length,
  }), []);

  const filtered = useMemo(() => {
    if (filter === "all") return recommendations;
    return recommendations.filter((r) => r.priority === filter);
  }, [filter]);

  const getStatus = (rec: Recommendation) => statusOverrides[rec.id] || rec.status;

  const cycleStatus = (id: string) => {
    const current = recommendations.find((r) => r.id === id);
    if (!current) return;
    const status = getStatus(current);
    const next: Record<string, string> = {
      open: "in_progress",
      in_progress: "resolved",
      resolved: "open",
    };
    setStatusOverrides((prev) => ({ ...prev, [id]: next[status] ?? "open" }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 py-8">
      <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={0}>
        <SectionTitle
          title="Security Recommendations"
          subtitle="Prioritized findings and actionable remediation steps"
        />
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        custom={1}
        className="flex flex-wrap gap-3 mt-6 mb-8"
      >
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFilter(opt.key)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
              filter === opt.key
                ? opt.color
                : "bg-gray-800/50 text-gray-400 border-gray-700 hover:border-gray-600"
            )}
          >
            {opt.label}
            {opt.key !== "all" && (
              <span className="ml-1.5 opacity-70">
                {counts[opt.key as keyof typeof counts]}
              </span>
            )}
            {opt.key === "all" && (
              <span className="ml-1.5 opacity-70">{recommendations.length}</span>
            )}
          </button>
        ))}
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        custom={2}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <GlassCard className="p-4 text-center">
          <p className="text-3xl font-bold text-red-400">
            <AnimatedCounter value={counts.critical} />
          </p>
          <p className="text-xs text-gray-400 mt-1">Critical</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-3xl font-bold text-orange-400">
            <AnimatedCounter value={counts.high} />
          </p>
          <p className="text-xs text-gray-400 mt-1">High</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-3xl font-bold text-yellow-400">
            <AnimatedCounter value={counts.medium} />
          </p>
          <p className="text-xs text-gray-400 mt-1">Medium</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-3xl font-bold text-blue-400">
            <AnimatedCounter value={counts.low} />
          </p>
          <p className="text-xs text-gray-400 mt-1">Low</p>
        </GlassCard>
      </motion.div>

      <div className="space-y-4">
        {filtered.map((rec, i) => {
          const status = getStatus(rec);
          return (
            <motion.div
              key={rec.id}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={i + 3}
            >
              <GlassCard className="p-6 hover:border-gray-600/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <PriorityBadge priority={rec.priority} />
                      <StatusBadge status={status} />
                      <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-full">
                        {rec.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2">{rec.title}</h3>
                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">{rec.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span className="text-xs font-medium text-red-400 uppercase tracking-wider">
                            Business Impact
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{rec.businessImpact}</p>
                      </div>
                      <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-green-400" />
                          <span className="text-xs font-medium text-green-400 uppercase tracking-wider">
                            Suggested Fix
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{rec.suggestedFix}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" />
                        {rec.domain}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {rec.estimatedEffort}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Circle className="w-3.5 h-3.5" />
                        Created {rec.createdDate}
                      </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-col items-center gap-2 lg:pt-2">
                    <button
                      onClick={() => cycleStatus(rec.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                        status === "open" &&
                          "bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-[#00E5FF]/10 hover:text-[#00E5FF] hover:border-[#00E5FF]/30",
                        status === "in_progress" &&
                          "bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/20 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30",
                        status === "resolved" &&
                          "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-gray-500/10 hover:text-gray-400 hover:border-gray-500/30"
                      )}
                    >
                      {status === "open" && (
                        <>
                          <Loader2 className="w-3.5 h-3.5" />
                          Start Work
                        </>
                      )}
                      {status === "in_progress" && (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolve
                        </>
                      )}
                      {status === "resolved" && (
                        <>
                          <Circle className="w-3.5 h-3.5" />
                          Reopen
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <GlassCard className="p-12 text-center">
          <Filter className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No recommendations match the selected filter.</p>
        </GlassCard>
      )}
    </div>
  );
}
