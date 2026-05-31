"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Zap, Sparkles, Building2 } from "lucide-react";

const PLANS = [
  {
    id: "STARTER" as const,
    name: "Starter",
    monthlyPrice: 14,
    yearlyPrice: 9,
    credits: 50,
    icon: Sparkles,
    description: "Perfect for solo marketers and indie makers.",
    features: [
      "50 credits / month",
      "All connectors — GSC, GA4, GMB",
      "All Claude Skills included",
      "Email support",
    ],
  },
  {
    id: "PRO" as const,
    name: "Pro",
    monthlyPrice: 29,
    yearlyPrice: 24,
    credits: 125,
    icon: Zap,
    highlight: true,
    description: "For freelancers managing multiple clients.",
    features: [
      "125 credits / month",
      "All connectors — GSC, GA4, GMB",
      "All Claude Skills included",
      "OAuth calls always free",
      "Priority email support",
    ],
  },
  {
    id: "AGENCY" as const,
    name: "Agency",
    monthlyPrice: 59,
    yearlyPrice: 49,
    credits: 275,
    icon: Building2,
    description: "For agencies running at scale.",
    features: [
      "275 credits / month",
      "All connectors — GSC, GA4, GMB",
      "All Claude Skills included",
      "Unlimited workspaces",
      "Dedicated Slack support",
      "1 year data retention",
    ],
  },
];

export default function PlanSelectionPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<"STARTER" | "PRO" | "AGENCY">("PRO");
  const [billing, setBilling] = useState<"yearly" | "monthly">("yearly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/select-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selected }),
      });
      if (!res.ok) throw new Error("Failed to save plan");
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">7-day free trial · No credit card required</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Choose your plan</h1>
          <p className="text-sm text-muted-foreground">
            Start your free trial today. Pick the plan that fits your workflow.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${
                billing === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                billing === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <span className="px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 text-[10px] font-bold">
                Save ~36%
              </span>
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const price = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
            const isSelected = selected === plan.id;

            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`relative rounded-xl border-2 p-5 flex flex-col gap-4 text-left transition-all cursor-pointer ${
                  isSelected
                    ? plan.highlight
                      ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                      : "border-primary ring-2 ring-primary/20 bg-primary/5"
                    : plan.highlight
                      ? "border-primary/40 bg-card hover:border-primary/70"
                      : "border-border bg-card hover:border-primary/40"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold whitespace-nowrap">
                      <Zap className="w-2.5 h-2.5" /> Most popular
                    </span>
                  </div>
                )}

                {/* Selection indicator */}
                <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? "border-primary bg-primary" : "border-border bg-transparent"
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
                  </div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-3xl font-bold text-foreground">${price}</span>
                    <span className="text-xs text-muted-foreground mb-1">/mo</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {billing === "yearly" ? `Billed $${price * 12}/year` : "Billed monthly"}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                    <span className="text-xs font-bold text-primary">{plan.credits}</span>
                    <span className="text-[10px] text-primary/80">credits/mo</span>
                  </div>
                </div>

                <ul className="space-y-1.5 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-1.5 text-[11px] text-foreground">
                      <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        {error && (
          <p className="text-center text-xs text-destructive mb-3">{error}</p>
        )}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full max-w-sm py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Starting trial…" : `Start free trial on ${PLANS.find(p => p.id === selected)?.name}`}
          </button>
          <p className="text-[11px] text-muted-foreground">
            Cancel anytime · No credit card needed to start
          </p>
        </div>
      </div>
    </div>
  );
}
