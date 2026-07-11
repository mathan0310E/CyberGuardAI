"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Users, Shield, Activity, AlertTriangle, Loader2, CheckCircle, Clock, Ban,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface AdminUser {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  companyName: string;
  role: string;
  status: string;
  scanCount: number;
  createdAt: string;
}

interface AdminStats {
  totalScans: number;
  completedScans: number;
  malwareDetected: number;
  totalUsers: number;
  activeUsers: number;
  totalReports: number;
  logs: Array<{ _id: string; level: string; message: string; timestamp: string }>;
}

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "analytics" | "logs">("users");

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;

    Promise.all([api.getAdminUsers(), api.getAdminStats()])
      .then(([usersData, statsData]) => {
        setUsers(usersData as unknown as AdminUser[]);
        setStats(statsData as unknown as AdminStats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const handleStatusChange = async (userId: string, status: string) => {
    try {
      await api.updateUserStatus(userId, status);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, status } : u));
      toast.success("User status updated");
    } catch {
      toast.error("Failed to update user status");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-text flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Admin Console
        </h1>
        <p className="mt-1 text-muted">Security Operations Center</p>
      </motion.div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { label: "Total Users", value: stats.totalUsers, icon: <Users className="h-5 w-5" /> },
            { label: "Active Users", value: stats.activeUsers, icon: <CheckCircle className="h-5 w-5" /> },
            { label: "Total Scans", value: stats.totalScans, icon: <Activity className="h-5 w-5" /> },
            { label: "Threats Found", value: stats.malwareDetected, icon: <AlertTriangle className="h-5 w-5" /> },
          ].map((stat) => (
            <GlassCard key={stat.label}>
              <div className="flex items-center gap-3">
                <div className="text-primary">{stat.icon}</div>
                <div>
                  <p className="text-2xl font-bold text-text">{stat.value}</p>
                  <p className="text-xs text-muted">{stat.label}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["users", "analytics", "logs"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-all capitalize",
              activeTab === tab ? "bg-primary text-white" : "bg-surface border border-border text-muted hover:text-text"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted font-medium">User</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Company</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Scans</th>
                  <th className="text-right py-3 px-4 text-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-border/50 hover:bg-surface/50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-text">{user.fullName}</p>
                      <p className="text-xs text-muted">{user.email}</p>
                    </td>
                    <td className="py-3 px-4 text-muted">{user.companyName}</td>
                    <td className="py-3 px-4">
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full", user.role === "admin" ? "bg-primary/20 text-primary" : "bg-surface text-muted")}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full",
                        user.status === "active" ? "bg-success/20 text-success" :
                        user.status === "blocked" ? "bg-danger/20 text-danger" :
                        user.status === "suspended" ? "bg-warning/20 text-warning" :
                        "bg-muted/20 text-muted"
                      )}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted">{user.scanCount}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {user.status === "active" ? (
                          <>
                            <button onClick={() => handleStatusChange(user._id, "suspended")} className="p-1.5 rounded-lg hover:bg-surface text-muted hover:text-warning transition-colors" title="Suspend">
                              <Clock className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleStatusChange(user._id, "blocked")} className="p-1.5 rounded-lg hover:bg-surface text-muted hover:text-danger transition-colors" title="Block">
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleStatusChange(user._id, "active")} className="p-1.5 rounded-lg hover:bg-surface text-muted hover:text-success transition-colors" title="Activate">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && stats && (
        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard>
            <h3 className="text-sm font-semibold text-muted mb-4">Scan Analytics</h3>
            <div className="space-y-3">
              {[
                { label: "Total Scans", value: stats.totalScans, color: "text-primary" },
                { label: "Completed", value: stats.completedScans, color: "text-success" },
                { label: "Malware Detected", value: stats.malwareDetected, color: "text-danger" },
                { label: "Total Reports", value: stats.totalReports, color: "text-accent" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm text-muted">{item.label}</span>
                  <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard>
            <h3 className="text-sm font-semibold text-muted mb-4">User Analytics</h3>
            <div className="space-y-3">
              {[
                { label: "Total Users", value: stats.totalUsers, color: "text-text" },
                { label: "Active Users", value: stats.activeUsers, color: "text-success" },
                { label: "Blocked/Suspended", value: stats.totalUsers - stats.activeUsers, color: "text-danger" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm text-muted">{item.label}</span>
                  <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === "logs" && stats && (
        <GlassCard>
          <h3 className="text-sm font-semibold text-muted mb-4">System Logs</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {stats.logs.map((log) => (
              <div key={log._id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <div className={cn("mt-0.5 h-2 w-2 shrink-0 rounded-full",
                  log.level === "error" ? "bg-danger" : log.level === "warn" ? "bg-warning" : "bg-success"
                )} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text">{log.message}</p>
                  <p className="text-xs text-muted">{new Date(log.timestamp).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full shrink-0",
                  log.level === "error" ? "bg-danger/20 text-danger" : log.level === "warn" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"
                )}>
                  {log.level}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
