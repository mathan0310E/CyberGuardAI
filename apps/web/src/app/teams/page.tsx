"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, Shield, Crown, Code, Eye, Settings, X, ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { cn } from "@/lib/utils";
import { PremiumStatCard } from "@/components/premium/PremiumStatCard";
import { PremiumBadge } from "@/components/premium/PremiumBadge";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "analyst" | "developer" | "viewer";
  status: "online" | "away" | "offline";
  lastActive: string;
  joinedDate: string;
  initials: string;
}

const roleColors: Record<string, string> = {
  owner: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  admin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  analyst: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  developer: "bg-green-500/20 text-green-400 border-green-500/30",
  viewer: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const statusColors: Record<string, string> = {
  online: "bg-green-500",
  away: "bg-yellow-500",
  offline: "bg-gray-500",
};

const rolePermissions: Record<string, string[]> = {
  owner: ["Full access", "Manage billing", "Delete organization", "Manage all members"],
  admin: ["Manage members", "Configure settings", "Manage scans", "View reports"],
  analyst: ["Run scans", "View reports", "Create recommendations", "Export data"],
  developer: ["View scans", "Access API", "View reports", "Manage integrations"],
  viewer: ["View only", "View reports", "View dashboard"],
};

const initialMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@cyberguard.io",
    role: "owner",
    status: "online",
    lastActive: "Just now",
    joinedDate: "Jan 15, 2024",
    initials: "SC",
  },
  {
    id: "2",
    name: "Marcus Johnson",
    email: "marcus.j@cyberguard.io",
    role: "admin",
    status: "online",
    lastActive: "5 min ago",
    joinedDate: "Mar 2, 2024",
    initials: "MJ",
  },
  {
    id: "3",
    name: "Aisha Patel",
    email: "aisha.p@cyberguard.io",
    role: "analyst",
    status: "online",
    lastActive: "12 min ago",
    joinedDate: "Apr 18, 2024",
    initials: "AP",
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.k@cyberguard.io",
    role: "developer",
    status: "away",
    lastActive: "1 hour ago",
    joinedDate: "Jun 5, 2024",
    initials: "DK",
  },
  {
    id: "5",
    name: "Elena Rodriguez",
    email: "elena.r@cyberguard.io",
    role: "analyst",
    status: "offline",
    lastActive: "3 hours ago",
    joinedDate: "Aug 22, 2024",
    initials: "ER",
  },
  {
    id: "6",
    name: "James Wilson",
    email: "james.w@cyberguard.io",
    role: "viewer",
    status: "offline",
    lastActive: "Yesterday",
    joinedDate: "Oct 10, 2024",
    initials: "JW",
  },
];

export default function TeamsPage() {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", role: "analyst" as TeamMember["role"] });
  const [activeRoleFilter, setActiveRoleFilter] = useState<string | null>(null);

  const filteredMembers = activeRoleFilter
    ? members.filter((m) => m.role === activeRoleFilter)
    : members;

  const handleInvite = () => {
    if (!formData.name || !formData.email) return;
    const initials = formData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const newMember: TeamMember = {
      id: String(members.length + 1),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: "offline",
      lastActive: "Never",
      joinedDate: "Just now",
      initials,
    };
    setMembers([...members, newMember]);
    setFormData({ name: "", email: "", role: "analyst" });
    setShowInviteForm(false);
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 py-8">
      <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={0}>
        <SectionTitle
          title="Team Collaboration"
          subtitle="Manage your team members, roles, and permissions"
        />
      </motion.div>

      <div className="flex items-center gap-3 mt-4 mb-8">
        <PremiumBadge />
        <span className="text-sm text-gray-400">Invite and manage your security team</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={1}>
          <PremiumStatCard
            label="Team Members"
            value={members.length}
            icon={<Users className="w-5 h-5" />}
          />
        </motion.div>
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={2}>
          <PremiumStatCard
            label="Active Now"
            value={members.filter((m) => m.status === "online").length}
            icon={<Shield className="w-5 h-5" />}
            trendUp={true}
            trend="12"
          />
        </motion.div>
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={3}>
          <PremiumStatCard
            label="Roles Assigned"
            value={Object.keys(rolePermissions).length}
            icon={<Crown className="w-5 h-5" />}
          />
        </motion.div>
      </div>

      <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={4} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Team Members</h2>
          <GlowButton onClick={() => setShowInviteForm(!showInviteForm)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </GlowButton>
        </div>

        {showInviteForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Invite New Member</h3>
                <button
                  onClick={() => setShowInviteForm(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 bg-[#0B1120] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@company.com"
                    className="w-full px-4 py-2.5 bg-[#0B1120] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                  <div className="relative">
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as TeamMember["role"] })}
                      className="w-full px-4 py-2.5 bg-[#0B1120] border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:border-[#00E5FF] transition-colors"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="analyst">Analyst</option>
                      <option value="developer">Developer</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-end">
                  <GlowButton onClick={handleInvite} className="w-full">
                    Send Invitation
                  </GlowButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveRoleFilter(null)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              !activeRoleFilter
                ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30"
                : "bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600"
            )}
          >
            All ({members.length})
          </button>
          {Object.keys(rolePermissions).map((role) => (
            <button
              key={role}
              onClick={() => setActiveRoleFilter(activeRoleFilter === role ? null : role)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
                activeRoleFilter === role
                  ? roleColors[role]
                  : "bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600"
              )}
            >
              {role} ({members.filter((m) => m.role === role).length})
            </button>
          ))}
        </div>

        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Member</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Role</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Last Active</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Joined</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-gray-700/30 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#7C3AED] flex items-center justify-center text-sm font-bold text-white">
                          {member.initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{member.name}</p>
                          <p className="text-xs text-gray-400">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize",
                          roleColors[member.role]
                        )}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", statusColors[member.status])} />
                        <span className="text-sm text-gray-300 capitalize">{member.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-400">{member.lastActive}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-400">{member.joinedDate}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {member.role !== "owner" && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-sm text-red-400 hover:text-red-300 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredMembers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No team members found with this role.
            </div>
          )}
        </GlassCard>
      </motion.div>

      <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={5}>
        <h2 className="text-xl font-semibold text-white mb-4">Role Permissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(rolePermissions).map(([role, permissions]) => (
            <GlassCard key={role} className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    role === "owner" && "bg-yellow-500/20",
                    role === "admin" && "bg-purple-500/20",
                    role === "analyst" && "bg-cyan-500/20",
                    role === "developer" && "bg-green-500/20",
                    role === "viewer" && "bg-gray-500/20"
                  )}
                >
                  {role === "owner" && <Crown className="w-4 h-4 text-yellow-400" />}
                  {role === "admin" && <Settings className="w-4 h-4 text-purple-400" />}
                  {role === "analyst" && <Shield className="w-4 h-4 text-cyan-400" />}
                  {role === "developer" && <Code className="w-4 h-4 text-green-400" />}
                  {role === "viewer" && <Eye className="w-4 h-4 text-gray-400" />}
                </div>
                <h3 className="text-sm font-semibold text-white capitalize">{role}</h3>
                <span className="ml-auto text-xs text-gray-500">
                  {members.filter((m) => m.role === role).length} members
                </span>
              </div>
              <ul className="space-y-1.5">
                {permissions.map((perm) => (
                  <li key={perm} className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-1 h-1 rounded-full bg-[#00E5FF]" />
                    {perm}
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
