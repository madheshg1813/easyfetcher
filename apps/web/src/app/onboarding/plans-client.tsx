"use client";

import { useState } from "react";
import { Zap, Check, Shield, RefreshCw, Headphones, Lock, Sparkles } from "lucide-react";

const DODO_BASE = "https://checkout.dodopayments.com/buy";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.easyfetcher.com";

const PLANS = [
  {
    id: "STARTER",
    name: "Starter",
    yearlyPrice: 9,
    monthlyPrice: 14,
    credits: 50,
    yearlyProductId: "pdt_0Ng5wo22oONBlqDIQvQQH",
    monthlyProductId: "pdt_0Ng5y8DYr4SO7bAbztKe1",
    features: [
      "50 credits / month",
      "GSC, GA4 & Google My Business",
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
    yearlyProductId: "pdt_0Ng5xPsUKdHXhvmQOsEz9",
    monthlyProductId: "pdt_0Ng5yT8aBWnSvfhryKLOC",
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
    yearlyProductId: "pdt_0Ng5xi9BNGdxE9t2akkwK",
    monthlyProductId: "pdt_0Ng5ykFTysYI4D73Jx37I",
    features: [
      "275 credits / month",
      "All connectors — GSC, GA4, GMB",
      "All Claude Skills included",
      "Unlimited workspaces",
      "Dedicated Slack support",
    ],
  },
];

function checkoutUrl(productId: string, email: string, next: string) {
  const params = new URLSearchParams({
    email,
    redirect_url: next,
    quantity: "1",
  });
  return `${DODO_BASE}/${productId}?${params.toString()}`;
}

export function PlansClient({ email, next }: { email: string; next: string }) {
  const [billing, setBilling] = useState<"yearly" | "monthly">("yearly");
  const fromClaude = next.includes("/api/oauth/authorize");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Brand logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Zap className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-base tracking-tight">EasyFetcher</span>
          </div>
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
            <span className="text-xs font-semibold text-primary">One step away from your marketing AI stack</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Choose your plan</h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Connect your data sources and query them with Claude — GSC, GA4, Google My Business and more.
          </p>
          {fromClaude && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              After purchasing, you&apos;ll be automatically connected to Claude
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
            { icon: Shield,      label: "Secure payment", sub: "256-bit SSL" },
            { icon: RefreshCw,   label: "Cancel anytime", sub: "No lock-in" },
            { icon: Zap,         label: "Instant access", sub: "After payment" },
            { icon: Headphones,  label: "Email support",  sub: "We reply fast" },
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
                      ? `Billed $${plan.yearlyPrice * 12}/year · Save $${(plan.monthlyPrice - plan.yearlyPrice) * 12}/yr`
                      : "Billed monthly · cancel anytime"}
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

                <a
                  href={checkoutUrl(productId, email, next)}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold text-center transition-colors mt-1 ${
                    plan.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  }`}
                >
                  Get {plan.name}
                </a>
              </div>
            );
          })}
        </div>

        {/* Bottom trust */}
        <div className="text-center space-y-3">
          <p className="text-[11px] text-muted-foreground">
            {fromClaude
              ? "After completing your purchase you will be automatically connected to Claude."
              : "After completing your purchase you will be redirected back to the dashboard automatically."}
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Payments processed securely by <span className="font-medium text-foreground">Dodo Payments</span></span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Cancel anytime · No hidden fees · Instant access after payment
          </p>
        </div>
      </div>
    </div>
  );
}
