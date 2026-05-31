"use client";

import { useState } from "react";
import { Check, Zap } from "lucide-react";

const PLANS = [
  {
    id: "STARTER",
    name: "Starter",
    yearlyPrice: 9,
    monthlyPrice: 14,
    credits: 50,
    description: "Perfect for solo marketers and indie makers.",
    features: [
      "50 credits / month",
      "All connectors — GSC, GA4, GMB",
      "All Claude Skills included",
      "Email support",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    yearlyPrice: 24,
    monthlyPrice: 29,
    credits: 125,
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
    id: "AGENCY",
    name: "Agency",
    yearlyPrice: 49,
    monthlyPrice: 59,
    credits: 275,
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

interface BillingPlansProps {
  currentPlanId: string;
}

export function BillingPlans({ currentPlanId }: BillingPlansProps) {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Upgrade your plan</h2>
          <p className="text-xs text-muted-foreground mt-0.5">More credits, more connectors, more power.</p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              !isYearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              isYearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly
            <span className="px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 text-[10px] font-bold">
              Save ~36%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-5 flex flex-col gap-4 transition-all ${
                plan.highlight
                  ? "border-primary ring-1 ring-primary bg-primary/5"
                  : isCurrent
                    ? "border-primary/50 bg-card"
                    : "border-border bg-card"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold whitespace-nowrap">
                    <Zap className="w-2.5 h-2.5" /> Most popular
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
                  {isCurrent && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">Current</span>
                  )}
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-foreground">${price}</span>
                  <span className="text-xs text-muted-foreground mb-1">/mo</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isYearly ? `Billed $${price * 12}/year` : "Billed monthly"}
                </p>
                <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-sm font-bold text-primary">{plan.credits}</span>
                  <span className="text-xs text-primary/80">credits/mo</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 leading-snug">{plan.description}</p>
              </div>

              <ul className="space-y-1.5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-1.5 text-[11px] text-foreground">
                    <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrent}
                className={`w-full py-2 px-3 rounded-md text-xs font-semibold transition-colors ${
                  isCurrent
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : plan.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-primary text-primary hover:bg-primary/10"
                }`}
              >
                {isCurrent ? "Current plan" : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
