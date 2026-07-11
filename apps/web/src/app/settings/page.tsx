"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Key, Bell, Shield, User, Save, Check } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { cn } from "@/lib/utils";

const SETTINGS_SECTIONS = [
  { id: "api", label: "API Keys", icon: <Key className="h-4 w-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
  { id: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
  { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("api");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-5 lg:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-text">Settings</h1>
        <p className="mt-1 text-muted">Manage your API keys, notifications, and preferences</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        {/* Sidebar */}
        <div className="flex lg:flex-col gap-1">
          {SETTINGS_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all text-left w-full",
                activeSection === section.id
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted hover:text-text hover:bg-surface"
              )}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <GlassCard>
          {activeSection === "api" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text mb-1">API Keys</h3>
                <p className="text-sm text-muted">Configure external API keys for threat intelligence services.</p>
              </div>
              {[
                { label: "VirusTotal API Key", placeholder: "Enter your VirusTotal API key", id: "vt" },
                { label: "URLScan.io API Key", placeholder: "Enter your URLScan.io API key", id: "urlscan" },
                { label: "AbuseIPDB API Key", placeholder: "Enter your AbuseIPDB API key", id: "abuse" },
                { label: "OpenRouter API Key", placeholder: "Enter your OpenRouter API key", id: "openrouter" },
              ].map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-text mb-1.5">{field.label}</label>
                  <input
                    type="password"
                    placeholder={field.placeholder}
                    className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text mb-1">Notifications</h3>
                <p className="text-sm text-muted">Configure how and when you receive alerts.</p>
              </div>
              {[
                { label: "Email notifications for critical threats", defaultChecked: true },
                { label: "Email notifications for completed scans", defaultChecked: false },
                { label: "Browser push notifications", defaultChecked: false },
                { label: "Weekly security digest", defaultChecked: true },
              ].map((item, i) => (
                <label key={i} className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-surface/50 transition-colors cursor-pointer">
                  <span className="text-sm text-text">{item.label}</span>
                  <input
                    type="checkbox"
                    defaultChecked={item.defaultChecked}
                    className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/50"
                  />
                </label>
              ))}
            </div>
          )}

          {activeSection === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text mb-1">Security Settings</h3>
                <p className="text-sm text-muted">Manage authentication and access controls.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Scan Depth</label>
                <select className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all">
                  <option>Standard (recommended)</option>
                  <option>Deep scan (slower, more thorough)</option>
                  <option>Quick scan (fast, basic checks)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Maximum concurrent scans</label>
                <input
                  type="number"
                  defaultValue={5}
                  min={1}
                  max={20}
                  className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>
          )}

          {activeSection === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-text mb-1">Profile</h3>
                <p className="text-sm text-muted">Manage your account information.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Display Name</label>
                <input
                  type="text"
                  defaultValue="Security Analyst"
                  className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Email</label>
                <input
                  type="email"
                  defaultValue="analyst@cyberguard.ai"
                  className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <GlowButton onClick={handleSave}>
              {saved ? <><Check className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Changes</>}
            </GlowButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
