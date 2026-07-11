"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const SUGGESTED_PROMPTS = [
  "Explain the hidden iframe threat found on the scanned site",
  "What are the best practices to prevent crypto mining scripts?",
  "How do I remediate obfuscated JavaScript?",
  "Generate a summary of the latest scan results",
  "Compare security headers between two websites",
];

const MOCK_RESPONSES: Record<string, string> = {
  default: `## Threat Analysis

Based on the structured scan data, here's what I found:

### Key Findings
1. **Hidden iframe** loading content from an external suspicious domain — this is a common vector for drive-by downloads
2. **Obfuscated JavaScript** using \`eval(atob(...))\` patterns — a strong indicator of malicious intent
3. **Credential harvesting form** submitting data to an unencrypted external endpoint

### Risk Assessment
The site scores **72/100** on our risk scale, placing it in the **High Risk** category. The combination of obfuscated code and credential harvesting suggests this site may be actively stealing user data.

### Recommendations
- Immediately remove the hidden iframe and audit the page source
- Replace all obfuscated JavaScript with clean implementations
- Implement Content-Security-Policy headers to prevent inline script execution
- Move all form submissions to HTTPS-only endpoints
- Consider adding Subresource Integrity (SRI) hashes to external scripts

### Technical Details
The eval/atob pattern at \`script[src=main.js]:892\` decodes to:
\`\`\`javascript
document.cookies  // attempts to steal session cookies
\`\`\`

This is consistent with session hijacking malware. The site should be taken offline for remediation.`,
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello! I'm **CyberGuard AI Assistant**. I can help you understand scan results, explain threats, and provide remediation guidance.\n\nAsk me anything about website security, malware detection, or threat analysis.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsTyping(true);

      setTimeout(() => {
        const response = MOCK_RESPONSES["default"] ?? "I'm unable to process that request.";
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1500);
    },
    [isTyping]
  );

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-4rem)]">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI Security Assistant
        </h1>
        <p className="text-sm text-muted">Ask about scan results, threats, or security best practices</p>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary mt-1">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={cn(
                  "group relative max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                  msg.role === "user"
                    ? "bg-primary text-white rounded-br-md"
                    : "glass rounded-bl-md"
                )}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    {msg.content.split("\n").map((line, i) => {
                      if (line.startsWith("## ")) return <h2 key={i} className="text-base font-bold mt-0 mb-2">{line.slice(3)}</h2>;
                      if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-semibold mt-3 mb-1">{line.slice(4)}</h3>;
                      if (line.startsWith("- ")) return <li key={i} className="ml-4 text-muted">{line.slice(2)}</li>;
                      if (line.match(/^\d+\.\s/)) return <li key={i} className="ml-4 text-muted list-decimal">{line.replace(/^\d+\.\s/, "")}</li>;
                      if (line.startsWith("```")) return null;
                      if (line.startsWith("`") && line.endsWith("`")) return <code key={i} className="text-accent bg-accent/10 px-1 rounded text-xs">{line.slice(1, -1)}</code>;
                      if (line.trim() === "") return <div key={i} className="h-2" />;
                      return <p key={i} className="text-muted leading-relaxed">{line}</p>;
                    })}
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
                {msg.role === "assistant" && (
                  <button
                    onClick={() => copyMessage(msg.id, msg.content)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-surface text-muted hover:text-text"
                    title="Copy"
                  >
                    {copiedId === msg.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-accent mt-1">
                  <User className="h-4 w-4" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Bot className="h-4 w-4" />
            </div>
            <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="rounded-full border border-border bg-surface/50 px-3 py-1.5 text-xs text-muted hover:border-primary/50 hover:text-text transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="glass-strong rounded-2xl p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Ask about threats, scan results, or security..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-text placeholder:text-muted/50 focus:outline-none max-h-32"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white transition-all hover:bg-primary-light disabled:opacity-40 disabled:pointer-events-none shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
