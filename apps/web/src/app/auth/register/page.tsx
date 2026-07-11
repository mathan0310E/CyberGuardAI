"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Shield, User, Mail, Lock, Building, Globe, Phone, Users, Briefcase, Eye, EyeOff, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    companyName: "",
    companyWebsite: "",
    companySize: "1-10",
    industry: "",
    password: "",
    confirmPassword: "",
  });

  if (isAuthenticated) {
    router.push("/");
    return null;
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      await register(form);
      toast.success("Account created!", { description: "Welcome to CyberGuard AI." });
      router.push("/");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Registration failed";
      toast.error("Registration failed", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Welcome!", { description: "Signed in with Google." });
      router.push("/");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Google sign-in failed";
      toast.error("Google sign-in failed", { description: msg });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/20 ring-1 ring-primary/30 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text">Create Account</h1>
          <p className="text-sm text-muted mt-1">Get started with CyberGuard AI</p>
        </div>

        <GlassCard glow>
          <GlowButton
            variant="secondary"
            className="w-full"
            onClick={handleGoogleRegister}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Sign up with Google
          </GlowButton>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 text-muted bg-surface">or fill in details</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                  <input type="text" value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} placeholder="John Doe" required className="w-full rounded-xl bg-background border border-border pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Username *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                  <input type="text" value={form.username} onChange={(e) => updateField("username", e.target.value)} placeholder="johndoe" required className="w-full rounded-xl bg-background border border-border pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Work Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="you@company.com" required className="w-full rounded-xl bg-background border border-border pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+1 (555) 000-0000" className="w-full rounded-xl bg-background border border-border pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Company Name *</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input type="text" value={form.companyName} onChange={(e) => updateField("companyName", e.target.value)} placeholder="Acme Corp" required className="w-full rounded-xl bg-background border border-border pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Company Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input type="url" value={form.companyWebsite} onChange={(e) => updateField("companyWebsite", e.target.value)} placeholder="https://acme.com" className="w-full rounded-xl bg-background border border-border pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Company Size *</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                  <select value={form.companySize} onChange={(e) => updateField("companySize", e.target.value)} className="w-full rounded-xl bg-background border border-border pl-10 pr-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all">
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Industry *</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                  <input type="text" value={form.industry} onChange={(e) => updateField("industry", e.target.value)} placeholder="Technology" required className="w-full rounded-xl bg-background border border-border pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="w-full rounded-xl bg-background border border-border pl-10 pr-10 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input type="password" value={form.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} placeholder="Confirm your password" required className="w-full rounded-xl bg-background border border-border pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
            </div>

            <GlowButton type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
            </GlowButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:text-primary-light transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
