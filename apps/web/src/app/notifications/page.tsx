"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  Scan,
  Settings,
  Shield,
  Users,
  Search,
  CheckCheck,
  Trash2,
  Clock,
  ChevronRight,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { cn } from "@/lib/utils";

type NotificationType = "malware_alert" | "scan_completed" | "subscription_update" | "system_announcement" | "security_recommendation" | "team_update";
type FilterType = "all" | "unread" | NotificationType;

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: "critical" | "high" | "medium" | "low" | "safe";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

const typeIcons: Record<NotificationType, React.ReactNode> = {
  malware_alert: <AlertTriangle className="h-4 w-4" />,
  scan_completed: <Scan className="h-4 w-4" />,
  subscription_update: <Settings className="h-4 w-4" />,
  system_announcement: <Bell className="h-4 w-4" />,
  security_recommendation: <Shield className="h-4 w-4" />,
  team_update: <Users className="h-4 w-4" />,
};

const typeColors: Record<NotificationType, string> = {
  malware_alert: "text-danger bg-danger/10",
  scan_completed: "text-primary bg-primary/10",
  subscription_update: "text-accent bg-accent/10",
  system_announcement: "text-info bg-info/10",
  security_recommendation: "text-warning bg-warning/10",
  team_update: "text-success bg-success/10",
};

const severityColors: Record<string, string> = {
  critical: "bg-danger",
  high: "bg-orange-500",
  medium: "bg-warning",
  low: "bg-info",
  safe: "bg-success",
};

const mockNotifications: Notification[] = [
  { id: "1", type: "malware_alert", title: "Critical Malware Detected", message: "Malicious JavaScript injection found on example.com. Immediate action required.", severity: "critical", read: false, createdAt: "2026-01-10T14:30:00Z", actionUrl: "/scanner" },
  { id: "2", type: "scan_completed", title: "Scan Completed", message: "Deep security scan for shop.example.org completed. Risk score: 42 (Medium).", severity: "medium", read: false, createdAt: "2026-01-10T13:15:00Z", actionUrl: "/reports" },
  { id: "3", type: "security_recommendation", title: "Security Header Missing", message: "Content-Security-Policy header not found on blog.example.net. This exposes your site to XSS attacks.", severity: "high", read: false, createdAt: "2026-01-10T12:00:00Z" },
  { id: "4", type: "team_update", title: "New Team Member", message: "Sarah Chen has accepted your invitation and joined the Security Analysts team.", severity: "safe", read: false, createdAt: "2026-01-10T10:45:00Z" },
  { id: "5", type: "malware_alert", title: "Phishing Attempt Blocked", message: "A phishing page impersonating your brand was detected and reported on phishing-site.xyz.", severity: "high", read: true, createdAt: "2026-01-09T18:30:00Z" },
  { id: "6", type: "subscription_update", title: "Plan Upgrade Successful", message: "Your account has been upgraded to Professional plan. All premium features are now available.", severity: "safe", read: true, createdAt: "2026-01-09T14:00:00Z" },
  { id: "7", type: "scan_completed", title: "Scheduled Scan Completed", message: "Daily automated scan for api.example.com completed. No new threats found.", severity: "safe", read: true, createdAt: "2026-01-09T06:00:00Z" },
  { id: "8", type: "system_announcement", title: "System Maintenance", message: "Scheduled maintenance window on Jan 15, 2026 from 2:00 AM to 4:00 AM UTC. Scans may be delayed.", severity: "low", read: true, createdAt: "2026-01-08T09:00:00Z" },
  { id: "9", type: "security_recommendation", title: "SSL Certificate Expiring", message: "SSL certificate for shop.example.org expires in 14 days. Renew to avoid browser warnings.", severity: "medium", read: true, createdAt: "2026-01-07T11:30:00Z" },
  { id: "10", type: "team_update", title: "Role Changed", message: "Mike Johnson's role has been updated from Developer to Security Analyst.", severity: "safe", read: true, createdAt: "2026-01-06T16:00:00Z" },
  { id: "11", type: "malware_alert", title: "Suspicious Redirect Detected", message: "Malicious redirect found on legacy.example.com pointing to known malware distribution site.", severity: "critical", read: true, createdAt: "2026-01-05T22:15:00Z" },
  { id: "12", type: "system_announcement", title: "New Feature: SOC Dashboard", message: "Enterprise Security Operations Center is now available for Professional and Enterprise plans.", severity: "low", read: true, createdAt: "2026-01-04T10:00:00Z" },
];

function timeAgo(dateStr: string): string {
  const diff = new Date("2026-01-11T15:00:00Z").getTime() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const filters: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "malware_alert", label: "Malware" },
  { key: "scan_completed", label: "Scans" },
  { key: "system_announcement", label: "System" },
  { key: "team_update", label: "Team" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.read;
    if (activeFilter !== "all" && n.type !== activeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    }
    return true;
  });

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-5 lg:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-text">Notification Center</h1>
          {unreadCount > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-danger text-[11px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <GlowButton variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" /> Mark All Read
          </GlowButton>
          <GlowButton variant="ghost" size="sm" onClick={clearAll}>
            <Trash2 className="h-4 w-4" /> Clear All
          </GlowButton>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notifications..."
          className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium border transition-all",
              activeFilter === f.key
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-surface text-muted border-border hover:border-border-light"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <GlassCard className="text-center py-12">
              <Bell className="h-12 w-12 text-muted/30 mx-auto mb-3" />
              <p className="text-sm text-muted">No notifications to display</p>
            </GlassCard>
          ) : (
            filtered.map((notification, i) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => markRead(notification.id)}
                className={cn(
                  "rounded-xl border p-4 transition-all cursor-pointer hover:bg-surface/50",
                  notification.read
                    ? "border-border/30 bg-surface/20"
                    : "border-primary/20 bg-primary/5 shadow-[0_0_15px_rgba(0,229,255,0.05)]"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", typeColors[notification.type])}>
                    {typeIcons[notification.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={cn("text-sm font-semibold", notification.read ? "text-muted" : "text-text")}>
                        {notification.title}
                      </h4>
                      <div className={cn("h-2 w-2 rounded-full shrink-0", severityColors[notification.severity])} />
                      {!notification.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className={cn("text-sm mt-0.5", notification.read ? "text-muted/70" : "text-muted")}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted/60 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {timeAgo(notification.createdAt)}
                      </span>
                      {notification.actionUrl && (
                        <a href={notification.actionUrl} className="text-xs text-primary hover:text-primary-light flex items-center gap-0.5 transition-colors">
                          View <ChevronRight className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
