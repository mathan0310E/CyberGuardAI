"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Check, Zap, Shield, Building2, Star } from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  featureDescription: string;
}

const PLANS = [
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    icon: <Zap className="h-5 w-5" />,
    color: "from-blue-500 to-cyan-500",
    features: ["5 websites", "Daily scans", "Basic reports", "Email support", "1 team member"],
  },
  {
    name: "Professional",
    price: "$79",
    period: "/mo",
    icon: <Shield className="h-5 w-5" />,
    color: "from-primary to-accent",
    popular: true,
    features: ["25 websites", "Hourly scans", "Advanced reports", "AI Security Center", "5 team members", "API access", "Priority support"],
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/mo",
    icon: <Building2 className="h-5 w-5" />,
    color: "from-amber-500 to-orange-500",
    features: ["Unlimited websites", "Real-time monitoring", "Executive dashboard", "SOC dashboard", "Unlimited team", "Custom integrations", "Dedicated support", "SLA guarantee"],
  },
];

export function UpgradeModal({ isOpen, onClose, featureName, featureDescription }: UpgradeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl glass-strong rounded-2xl border border-border/50 overflow-hidden"
          >
            {/* Aurora gradient top bar */}
            <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary aurora" />

            {/* Header */}
            <div className="relative px-8 pt-8 pb-4">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl text-muted hover:text-text hover:bg-surface transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                  <Crown className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text">Upgrade to Premium</h2>
                  <p className="text-sm text-muted">Unlock {featureName} and more</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-primary/5 border border-primary/10 p-4">
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-text">{featureName}</p>
                    <p className="text-xs text-muted mt-1">{featureDescription}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan) => (
                <motion.div
                  key={plan.name}
                  whileHover={{ y: -4 }}
                  className={`relative rounded-2xl border p-6 transition-all ${
                    plan.popular
                      ? "border-primary/30 bg-primary/5 shadow-[0_0_30px_rgba(0,229,255,0.1)]"
                      : "border-border/50 bg-surface/30 hover:border-border-light"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#07090D]">
                      Most Popular
                    </div>
                  )}

                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${plan.color} text-white mb-4`}>
                    {plan.icon}
                  </div>

                  <h3 className="text-lg font-bold text-text">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-text">{plan.price}</span>
                    <span className="text-sm text-muted">{plan.period}</span>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted">
                        <Check className="h-4 w-4 text-success shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <GlowButton
                    variant={plan.popular ? "primary" : "secondary"}
                    className="w-full mt-6"
                    size="sm"
                  >
                    {plan.popular ? "Get Started" : "Choose Plan"}
                  </GlowButton>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-8 pb-6 text-center">
              <p className="text-xs text-muted">
                All plans include a 14-day free trial. No credit card required.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
