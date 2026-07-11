"use client";

import Link from "next/link";
import { useState } from "react";
import { Shield, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/scanner", label: "Scanner" },
  { href: "/chat", label: "AI Chat" },
  { href: "/reports", label: "Reports" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-strong">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/30 transition-all group-hover:bg-primary/30 group-hover:shadow-[0_0_15px_rgba(124,58,237,0.3)]">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold text-gradient">
            CyberGuard<span className="text-accent">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors",
                "hover:bg-surface hover:text-text"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/scanner"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-light hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]"
          >
            Start Scan
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-muted hover:text-text transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border glass-strong">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-text transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/scanner"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white text-center mt-2"
            >
              Start Scan
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
