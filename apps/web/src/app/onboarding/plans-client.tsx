"use client";

import { useState } from "react";
import Image from "next/image";
import { Zap, Check, Shield, RefreshCw, CreditCard, Lock, Sparkles, Loader2 } from "lucide-react";
import { PLANS } from "@/lib/billing/plans";

export function PlansClient({ email, next }: { email: string; next: string }) {
  const [billing, setBilling] = useState<"yearly" | "monthly">("yearly");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fromClaude = next.includes("/api/oauth/authorize");

  async function startTrial(productId: string) {
    setLoadingId(productId);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, next }),
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Brand logo */}
          <Image
            src="/logo.png"
            alt="EasyFetcher"
            width={140}
            height={40}
            className="h-9 w-auto object-contain"
            priority
          />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            Secure checkout
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Start using EasyFetcher today</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Choose your plan</h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Pick a plan that fits your needs. All plans include full access to Claude Skills and your connected data sources.
          </p>
          {fromClaude && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              After starting your trial, you&apos;ll be automatically connected to Claude
            </div>
          )}
          {email && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-xs text-muted-foreground">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">{email.charAt(0).toUpperCase()}</span>
              </div>
              Activating for <span className="font-medium text-foreground">{email}</span>
            </div>
          )}
        </div>

        {/* Trust bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: CreditCard,  label: "Secure payment", sub: "256-bit SSL encryption" },
            { icon: RefreshCw,   label: "Cancel anytime",   sub: "1 click, no questions" },
            { icon: Zap,         label: "Instant access",   sub: "Full dashboard unlocked" },
            { icon: Shield,      label: "Secure payment",   sub: "256-bit SSL" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3 text-center">
              <Icon className="w-4 h-4 text-primary mb-0.5" />
              <p className="text-xs font-semibold text-foreground">{label}</p>
              <p className="text-[10px] text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-8">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {PLANS.map((plan) => {
            const price = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
            const productId = billing === "yearly" ? plan.yearlyProductId : plan.monthlyProductId;
            const isLoading = loadingId === productId;

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border-2 p-5 flex flex-col gap-4 bg-card ${
                  plan.highlight
                    ? "border-primary shadow-lg shadow-primary/10"
                    : "border-border"
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
                      ? `$${plan.yearlyPrice * 12}/year · Save $${(plan.monthlyPrice - plan.yearlyPrice) * 12}/yr`
                      : `$${plan.monthlyPrice}/month · cancel anytime`}
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
                  {isLoading ? "Redirecting…" : "Subscribe"}
                </button>
              </div>
            );
          })}
        </div>

        {error && (
          <p className="text-center text-xs text-destructive mb-4">{error}</p>
        )}

        {/* Bottom trust */}
        <div className="text-center space-y-3">
          <p className="text-[11px] text-muted-foreground">
            {fromClaude
              ? "After subscribing you will be automatically connected to Claude."
              : "After subscribing you will be redirected back to the dashboard automatically."}
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Payments processed securely by <span className="font-medium text-foreground">Dodo Payments</span></span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Cancel anytime · No hidden fees
          </p>
        </div>
      </div>
    </div>
  );
}
