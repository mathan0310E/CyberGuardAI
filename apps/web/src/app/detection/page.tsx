"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send,
  FileText,
  Shield,
  AlertTriangle,
  GitCompare,
  ChevronDown,
  Bot,
  User,
  Sparkles,
  Loader2,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { PremiumBadge } from "@/components/premium/PremiumBadge";
import { cn } from "@/lib/utils";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SCAN_OPTIONS = [
  { id: "scan-1", label: "example.com — Jul 11, 2026", riskScore: 72 },
  { id: "scan-2", label: "shop-site.io — Jul 10, 2026", riskScore: 45 },
  { id: "scan-3", label: "blog-app.dev — Jul 9, 2026", riskScore: 18 },
  { id: "scan-4", label: "api-service.cloud — Jul 8, 2026", riskScore: 91 },
];

const QUICK_ACTIONS = [
  { label: "Generate Executive Summary", icon: FileText, prompt: "Generate an executive summary of the latest scan results" },
  { label: "Explain Vulnerabilities", icon: AlertTriangle, prompt: "Explain the vulnerabilities found in the latest scan in detail" },
  { label: "Security Best Practices", icon: Shield, prompt: "What security best practices should be implemented based on scan findings?" },
  { label: "Compare Scans", icon: GitCompare, prompt: "Compare the last two scans and highlight improvements and regressions" },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    role: "user",
    content: "What are the critical vulnerabilities found on example.com?",
    timestamp: new Date("2026-01-11T11:55:00Z"),
  },
  {
    id: "m2",
    role: "assistant",
    content:
      "Based on the scan of **example.com** (Risk Score: 72/100), I found 3 critical vulnerabilities:\n\n**1. Cross-Site Scripting (XSS)** — The search input field at `/search?q=` is vulnerable to reflected XSS attacks. User-supplied input is rendered without proper sanitization.\n\n**2. Missing Content-Security-Policy Header** — No CSP header is set, allowing potential code injection attacks.\n\n**3. Outdated jQuery Library (v2.1.4)** — This version contains multiple known CVEs including CVE-2020-11022 and CVE-2020-11023.\n\n**Recommendation:** Prioritize patching the XSS vulnerability and implementing a Content-Security-Policy header immediately.",
    timestamp: new Date("2026-01-11T11:56:00Z"),
  },
  {
    id: "m3",
    role: "assistant",
    content: "Would you like me to generate a detailed remediation plan for these issues?",
    timestamp: new Date("2026-01-11T11:57:00Z"),
  },
];

const FOLLOW_UP_CHIPS = [
  "Show me the full report",
  "What about SEO issues?",
  "Generate remediation steps",
  "Is this site PCI compliant?",
];

export default function DetectionPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [selectedScan, setSelectedScan] = useState(SCAN_OPTIONS[0]?.id ?? "scan-1");
  const [isTyping, setIsTyping] = useState(false);
  const [showScanDropdown, setShowScanDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedScanData = SCAN_OPTIONS.find((s) => s.id === selectedScan);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowScanDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const generateAIResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();
    if (lower.includes("executive summary") || lower.includes("summary")) {
      return "**Executive Security Summary**\n\nThe latest scan of " + (selectedScanData?.label ?? "the selected target") + " reveals an overall risk score of **" + (selectedScanData?.riskScore ?? 0) + "/100**.\n\n**Key Findings:**\n• 3 critical, 5 high, and 8 medium-severity issues detected\n• Primary attack surface: web application layer\n• No immediate data breach indicators found\n• 2 third-party libraries require urgent updates\n\n**Risk Assessment:** The current security posture requires immediate attention on critical items. A focused 2-week remediation sprint is recommended to bring the risk score below 30.";
    }
    if (lower.includes("vulnerabilit") || lower.includes("explain")) {
      return "**Vulnerability Analysis**\n\nThe scan identified issues across three categories:\n\n**Web Application (12 issues)**\n• XSS in 3 input fields\n• CSRF tokens missing on 2 forms\n• Open redirect vulnerability in auth flow\n\n**Infrastructure (4 issues)**\n• TLS 1.0 still enabled\n• Server header information disclosure\n• Missing HSTS header\n• Weak cipher suites available\n\n**Third-Party (3 issues)**\n• jQuery 2.x (known CVEs)\n• Bootstrap 4.x (XSS vector)\n• Lodash 4.17.15 (prototype pollution)";
    }
    if (lower.includes("best practice") || lower.includes("recommend")) {
      return "**Security Best Practices Recommendations**\n\n**Immediate (Week 1):**\n1. Implement Content-Security-Policy with nonce-based script loading\n2. Add Subresource Integrity (SRI) to all external resources\n3. Enable HTTP Strict Transport Security (HSTS) with 1-year max-age\n\n**Short-term (Month 1):**\n4. Upgrade all dependencies to latest stable versions\n5. Implement rate limiting on authentication endpoints\n6. Add automated security scanning to CI/CD pipeline\n\n**Long-term (Quarter 1):**\n7. Deploy Web Application Firewall (WAF)\n8. Implement Security Information and Event Management (SIEM)\n9. Conduct penetration testing with certified professionals";
    }
    if (lower.includes("compare") || lower.includes("improvement")) {
      return "**Scan Comparison**\n\nComparing the current scan with the previous scan:\n\n**Improvements (+)** ✅\n• Removed 2 outdated JavaScript libraries\n• Fixed 4 missing security headers\n• Resolved 1 open redirect vulnerability\n\n**Regressions (-)** ❌\n• 3 new XSS vectors discovered in recently added features\n• New API endpoint exposed without authentication\n• Certificate expires in 14 days (previously 45)\n\n**Net Change:** Risk score improved from 81 → " + (selectedScanData?.riskScore ?? 0) + " (−" + (81 - (selectedScanData?.riskScore ?? 0)) + " points)";
    }
    return "I've analyzed your question about **\"" + userMessage + "**\". Based on the current scan data for " + (selectedScanData?.label ?? "the selected target") + ", here are my findings:\n\nThe security assessment indicates several areas that need attention. The most critical items should be addressed within the next 48 hours to prevent potential exploitation.\n\nWould you like me to dive deeper into any specific aspect of this analysis?";
  };

  const handleSend = (content?: string) => {
    const text = content || inputValue.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `m${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: `m${Date.now() + 1}`,
        role: "assistant",
        content: generateAIResponse(text),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <SectionTitle
              title="AI Security Center"
              subtitle="Ask questions about your security scans and get intelligent analysis"
              align="left"
            />
            <PremiumBadge />
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowScanDropdown(!showScanDropdown)}
            className="flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-text hover:glow-border transition-all"
          >
            <Shield className="h-4 w-4 text-primary" />
            <span className="max-w-[200px] truncate">{selectedScanData?.label}</span>
            <span className={cn(
              "ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
              (selectedScanData?.riskScore ?? 0) >= 70
                ? "bg-danger/15 text-danger"
                : (selectedScanData?.riskScore ?? 0) >= 40
                ? "bg-warning/15 text-warning"
                : "bg-success/15 text-success"
            )}>
              {selectedScanData?.riskScore}
            </span>
            <ChevronDown className="h-4 w-4 text-muted" />
          </button>

          {showScanDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 w-80 rounded-xl glass-strong border border-border/50 shadow-xl z-50 overflow-hidden"
            >
              {SCAN_OPTIONS.map((scan) => (
                <button
                  key={scan.id}
                  onClick={() => {
                    setSelectedScan(scan.id);
                    setShowScanDropdown(false);
                  }}
                  className={cn(
                    "flex items-center justify-between w-full px-4 py-3 text-sm text-left transition-colors hover:bg-surface/80",
                    selectedScan === scan.id && "bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted shrink-0" />
                    <span className="text-text truncate">{scan.label}</span>
                  </div>
                  <span className={cn(
                    "ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0",
                    scan.riskScore >= 70
                      ? "bg-danger/15 text-danger"
                      : scan.riskScore >= 40
                      ? "bg-warning/15 text-warning"
                      : "bg-success/15 text-success"
                  )}>
                    {scan.riskScore}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-4">
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeInUp} className="lg:col-span-1">
          <GlassCard className="sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-muted">Quick Actions</h3>
            </div>
            <div className="space-y-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleSend(action.prompt)}
                  disabled={isTyping}
                  className="flex items-center gap-3 w-full rounded-xl border border-border/50 px-3 py-3 text-left text-sm text-text transition-all hover:border-primary/30 hover:bg-primary/5 disabled:opacity-40"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <action.icon className="h-4 w-4" />
                  </div>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border/50">
              <h4 className="text-xs font-semibold text-muted mb-3 uppercase tracking-wider">Conversation Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Messages</span>
                  <span className="text-text font-medium">{messages.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Selected Scan</span>
                  <span className={cn(
                    "text-xs font-bold rounded-full px-2 py-0.5",
                    (selectedScanData?.riskScore ?? 0) >= 70
                      ? "bg-danger/15 text-danger"
                      : (selectedScanData?.riskScore ?? 0) >= 40
                      ? "bg-warning/15 text-warning"
                      : "bg-success/15 text-success"
                  )}>
                    {selectedScanData?.riskScore}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeInUp} className="lg:col-span-3">
          <GlassCard className="flex flex-col h-[calc(100vh-12rem)]">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      msg.role === "user"
                        ? "bg-primary/20 text-primary"
                        : "bg-accent/20 text-accent"
                    )}
                  >
                    {msg.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>

                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary/10 border border-primary/20 text-text"
                        : "bg-surface border border-border/50 text-text"
                    )}
                  >
                    <div className="whitespace-pre-wrap">
                      {msg.content.split("\n").map((line, idx) => {
                        if (line.startsWith("**") && line.endsWith("**")) {
                          return (
                            <p key={idx} className="font-semibold text-text mb-1">
                              {line.replace(/\*\*/g, "")}
                            </p>
                          );
                        }
                        if (line.includes("**")) {
                          const parts = line.split(/(\*\*.*?\*\*)/);
                          return (
                            <p key={idx} className="mb-0.5">
                              {parts.map((part, pidx) =>
                                part.startsWith("**") && part.endsWith("**") ? (
                                  <strong key={pidx} className="text-text font-semibold">
                                    {part.replace(/\*\*/g, "")}
                                  </strong>
                                ) : (
                                  <span key={pidx} className="text-muted">{part}</span>
                                )
                              )}
                            </p>
                          );
                        }
                        if (line.startsWith("•") || line.startsWith("—")) {
                          return (
                            <p key={idx} className="mb-0.5 text-muted">
                              {line}
                            </p>
                          );
                        }
                        return (
                          <p key={idx} className={line ? "mb-1 text-muted" : "mb-2"}>
                            {line}
                          </p>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[10px] text-muted/50">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-surface border border-border/50">
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                      <span className="text-sm text-muted">Analyzing security data...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {FOLLOW_UP_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSend(chip)}
                    disabled={isTyping}
                    className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about security scans..."
                  rows={1}
                  className="w-full rounded-xl bg-surface border border-border/50 px-4 py-3 pr-12 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 resize-none transition-all"
                />
              </div>
              <GlowButton
                variant="primary"
                size="sm"
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping}
                className="shrink-0 h-11"
              >
                <Send className="h-4 w-4" />
              </GlowButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
