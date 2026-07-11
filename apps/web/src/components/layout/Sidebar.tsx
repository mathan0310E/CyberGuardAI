"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Shield,
  Menu,
  X,
  LogOut,
  Home,
  LayoutDashboard,
  Scan,
  MessageSquare,
  FileText,
  Clock,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scanner", label: "Scanner", icon: Scan },
  { href: "/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/history", label: "History", icon: Clock },
];

const BOTTOM_LINKS = [
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/30 transition-all group-hover:bg-primary/30 group-hover:shadow-[0_0_15px_rgba(124,58,237,0.3)]">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold text-gradient">
            CyberGuard<span className="text-accent">AI</span>
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_LINKS.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                  : "text-muted hover:bg-surface hover:text-text"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              isActive("/admin")
                ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                : "text-primary/80 hover:bg-primary/10 hover:text-primary"
            )}
          >
            <Shield className="h-4 w-4 shrink-0" />
            Admin
          </Link>
        )}

        <div className="!mt-4 pt-4 border-t border-border/50 space-y-1">
          {BOTTOM_LINKS.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                    : "text-muted hover:bg-surface hover:text-text"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="border-t border-border/50 p-4">
        {isAuthenticated ? (
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-text truncate">{user?.fullName}</p>
              <p className="text-xs text-muted truncate">{user?.companyName}</p>
            </div>
            <button
              onClick={() => { logout(); setMobileOpen(false); }}
              className="shrink-0 p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted hover:text-text hover:border-primary/30 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-all hover:bg-primary-light"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-60 md:shrink-0">
        <div className="fixed inset-y-0 left-0 z-40 w-60 glass-strong border-r border-border/50">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 glass-strong border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/30">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <span className="text-base font-bold text-gradient">
              CyberGuard<span className="text-accent">AI</span>
            </span>
          </Link>
          <button
            className="p-2 text-muted hover:text-text transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Overlay Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar Panel */}
          <div className="absolute inset-y-0 left-0 w-72 glass-strong border-r border-border/50 animate-in slide-in-from-left duration-200">
            <button
              className="absolute top-4 right-4 p-2 text-muted hover:text-text transition-colors"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
