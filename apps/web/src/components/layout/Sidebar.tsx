"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Shield,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Scan,
  MessageSquare,
  FileText,
  Clock,
  Settings,
  Radar,
  Eye,
  Brain,
  ShieldCheck,
  CircleHelp,
  BarChart3,
  Bell,
  Users,
  Globe,
  Key,
  Building2,
  Target,
  GitCompare,
  Calendar,
  Lightbulb,
  Crown,
  LineChart,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scanner", label: "URL Scanner", icon: Scan },
  { href: "/chat", label: "AI Assistant", icon: MessageSquare },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/history", label: "Scan History", icon: Clock },
];

const SECURITY_LINKS = [
  { href: "/detection", label: "AI Security Center", icon: Brain },
  { href: "/monitoring", label: "Live Monitoring", icon: Eye },
  { href: "/threats", label: "Threat Dashboard", icon: Radar },
  { href: "/soc", label: "SOC Dashboard", icon: ShieldCheck },
  { href: "/timeline", label: "Score Timeline", icon: LineChart },
  { href: "/compare", label: "Compare Sites", icon: GitCompare },
];

const BUSINESS_LINKS = [
  { href: "/executive", label: "Executive View", icon: Briefcase },
  { href: "/analytics", label: "Business Analytics", icon: BarChart3 },
  { href: "/inventory", label: "Website Inventory", icon: Globe },
  { href: "/teams", label: "Team Collaboration", icon: Users },
  { href: "/recommendations", label: "Recommendations", icon: Lightbulb },
  { href: "/scan-comparison", label: "Scan Comparison", icon: Target },
];

const BOTTOM_LINKS = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/support", label: "Support", icon: CircleHelp },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const NavItem = ({ href, label, icon: Icon, onClick }: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; onClick?: () => void }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          active
            ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
            : "text-muted hover:bg-surface hover:text-text hover:border-transparent"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", active && "drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]")} />
        {label}
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-primary/30 transition-all group-hover:from-primary/30 group-hover:to-accent/30 group-hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold text-gradient">
            CyberGuard<span className="text-accent">AI</span>
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_LINKS.map((link) => (
          <NavItem key={link.href} {...link} onClick={() => setMobileOpen(false)} />
        ))}

        {/* Security Center Section */}
        <div className="!mt-4 pt-4 border-t border-border/50">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted/60">Security Center</p>
          <div className="space-y-1">
            {SECURITY_LINKS.map((link) => (
              <NavItem key={link.href} {...link} onClick={() => setMobileOpen(false)} />
            ))}
          </div>
        </div>

        {/* Business Section */}
        <div className="!mt-4 pt-4 border-t border-border/50">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted/60 flex items-center gap-1.5">
            Business <Crown className="h-3 w-3 text-amber-400" />
          </p>
          <div className="space-y-1">
            {BUSINESS_LINKS.map((link) => (
              <NavItem key={link.href} {...link} onClick={() => setMobileOpen(false)} />
            ))}
          </div>
        </div>

        {/* Premium Tools */}
        <div className="!mt-4 pt-4 border-t border-border/50">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted/60">Enterprise</p>
          <div className="space-y-1">
            <NavItem href="/organizations" label="Organization" icon={Building2} onClick={() => setMobileOpen(false)} />
            <NavItem href="/scheduled-reports" label="Scheduled Reports" icon={Calendar} onClick={() => setMobileOpen(false)} />
            <NavItem href="/api-keys" label="API Keys" icon={Key} onClick={() => setMobileOpen(false)} />
            <NavItem href="/notifications" label="Notifications" icon={Bell} onClick={() => setMobileOpen(false)} />
          </div>
        </div>

        {isAdmin && (
          <div className="!mt-4 pt-4 border-t border-border/50">
            <NavItem href="/admin" label="Admin Panel" icon={ShieldCheck} onClick={() => setMobileOpen(false)} />
          </div>
        )}

        <div className="!mt-4 pt-4 border-t border-border/50 space-y-1">
          {BOTTOM_LINKS.map((link) => (
            <NavItem key={link.href} {...link} onClick={() => setMobileOpen(false)} />
          ))}
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
              className="shrink-0 p-2 rounded-xl text-muted hover:text-danger hover:bg-danger/10 transition-colors"
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
              className="flex items-center justify-center rounded-xl border border-primary/20 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-[#00B4D8] px-3 py-2 text-sm font-semibold text-[#07090D] transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]"
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
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-primary/30">
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
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
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
