"use client";

import { useState } from "react";
import { Zap, Check, Shield, CreditCard, RefreshCw, Loader2 } from "lucide-react";
import { PLANS, TRIAL_DAYS } from "@/lib/billing/plans";

export function StartTrialPlans() {
  const [billing, setBilling] = useState<"yearly" | "monthly">("yearly");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startTrial(productId: string) {
    setLoadingId(productId);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Something went wrong");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoadingId(null);
    }
  }

  return (
    <div className="rounded-xl border-2 border-primary/40 bg-card p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-3">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">Try EasyFetcher free for {TRIAL_DAYS} days</span>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1.5">Start your free trial</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Add a payment method to unlock the full dashboard. <span className="font-semibold text-foreground">$0 today</span> — your
          first charge is after {TRIAL_DAYS} days, and you can cancel anytime before that.
        </p>
      </div>

      {/* Trust row */}
      <div className="flex items-center justify-center gap-5 mb-6 flex-wrap">
        {[
          { icon: CreditCard, label: "$0 charged today" },
          { icon: RefreshCw,  label: "Cancel anytime in 1 click" },
          { icon: Shield,     label: "Secure checkout via Dodo Payments" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Icon className="w-3.5 h-3.5 text-primary" />
            {label}
          </div>
        ))}
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-5 py-2 rounded-md text-xs font-semibold transition-colors ${
              billing === "monthly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`px-5 py-2 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
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

      {/* Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {PLANS.map((plan) => {
          const price = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
          const productId = billing === "yearly" ? plan.yearlyProductId : plan.monthlyProductId;
          const isLoading = loadingId === productId;

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border-2 p-5 flex flex-col gap-4 bg-card ${
                plan.highlight ? "border-primary shadow-lg shadow-primary/10" : "border-border"
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
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{plan.name}</p>
                <div className="flex items-end gap-1 mb-0.5">
                  <span className="text-3xl font-bold text-foreground">${price}</span>
                  <span className="text-xs text-muted-foreground mb-1">/mo</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {billing === "yearly"
                    ? `After trial: $${plan.yearlyPrice * 12}/year`
                    : `After trial: $${plan.monthlyPrice}/month`}
                </p>
                <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                  <span className="text-xs font-bold text-primary">{plan.credits}</span>
                  <span className="text-[10px] text-primary/80">credits/mo</span>
                </div>
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-[11px] text-foreground">
                    <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-primary" />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => startTrial(productId)}
                disabled={loadingId !== null}
                className={`w-full py-2.5 rounded-lg text-xs font-semibold text-center transition-colors mt-1 disabled:opacity-60 flex items-center justify-center gap-1.5 ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-foreground text-background hover:bg-foreground/90"
                }`}
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isLoading ? "Redirecting…" : `Start ${TRIAL_DAYS}-day free trial`}
              </button>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-center text-xs text-destructive mb-3">{error}</p>
      )}

      <p className="text-center text-[10px] text-muted-foreground">
        We&apos;ll email you before your trial ends · Cancel anytime from this page · No hidden fees
      </p>
    </div>
  );
}
