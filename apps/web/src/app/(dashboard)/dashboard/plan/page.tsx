"use client";

import { useState } from "react";
import { Check, Zap } from "lucide-react";
import Image from "next/image";

export const metadata = { title: "Plan" };

export default function PlanPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">Choose your plan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your marketing data and run AI-powered prompts
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center gap-3">
        <span className={`text-xs font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative w-10 h-5 rounded-full transition-colors ${annual ? "bg-primary" : "bg-muted-foreground/30"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${annual ? "translate-x-5" : ""}`} />
        </button>
        <span className={`text-xs font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
          Annual <span className="ml-1 px-1.5 py-0.5 rounded bg-green-500/15 text-green-600 dark:text-green-400 text-[10px] font-semibold">Save $24</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FreePlanCard />
        <ProPlanCard annual={annual} />
      </div>
    </div>
  );
}

function FreePlanCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Free</p>
        <div className="flex items-end gap-1">
          <span className="text-3xl font-bold text-foreground">$0</span>
          <span className="text-sm text-muted-foreground mb-1">forever</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          Start querying your search data with AI — no credit card needed.
        </p>
      </div>

      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Connectors included</p>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
            <Image src="/connectors/gsc.svg" alt="GSC" width={18} height={18} />
          </div>
        </div>
      </div>

      <ul className="space-y-1.5 flex-1">
        {[
          "Google Search Console",
          "1 workspace · 1 site",
          "Claude & MCP compatible",
        ].map((f) => (
          <li key={f} className="flex items-start gap-1.5 text-xs text-foreground">
            <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      <div className="w-full py-2 px-4 rounded-md bg-muted text-muted-foreground text-xs font-semibold text-center cursor-default">
        Current plan
      </div>
    </div>
  );
}

function ProPlanCard({ annual }: { annual: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    const res = await fetch("/api/dodo/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ billing: annual ? "annual" : "monthly" }),
    });
    const data = await res.json() as { url?: string; error?: string };
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error ?? "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative rounded-xl border border-primary ring-1 ring-primary bg-card p-6 flex flex-col gap-4">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <span className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold whitespace-nowrap">
          <Zap className="w-2.5 h-2.5" /> Most Popular
        </span>
      </div>

      <div>
        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Pro</p>
        <div className="flex items-end gap-1">
          <span className="text-3xl font-bold text-foreground">{annual ? "$5" : "$7"}</span>
          <span className="text-sm text-muted-foreground mb-1">/month</span>
        </div>
        {annual ? (
          <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-0.5">Billed $60/year</p>
        ) : (
          <p className="text-xs text-muted-foreground mt-0.5">or $60/yr — save $24</p>
        )}
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          Unlock GA4 and Shopify alongside Search Console — all in one AI workspace.
        </p>
      </div>

      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Connectors included</p>
        <div className="flex items-center gap-2">
          {[
            { src: "/connectors/gsc.svg", alt: "GSC" },
            { src: "/connectors/google-analytics.svg", alt: "GA4" },
            { src: "/connectors/shopify.svg", alt: "Shopify" },
          ].map((c) => (
            <div key={c.alt} className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
              <Image src={c.src} alt={c.alt} width={18} height={18} />
            </div>
          ))}
        </div>
      </div>

      <ul className="space-y-1.5 flex-1">
        {[
          "Google Search Console",
          "Google Analytics 4",
          "Shopify",
          "Unlimited sites & accounts",
          "Claude & MCP compatible",
          "Priority email support",
        ].map((f) => (
          <li key={f} className="flex items-start gap-1.5 text-xs text-foreground">
            <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Redirecting…" : annual ? "Start Pro for $60/yr →" : "Start Pro for $7/mo →"}
      </button>
      <p className="text-[10px] text-muted-foreground text-center -mt-2">No credit card required to start</p>
    </div>
  );
}
