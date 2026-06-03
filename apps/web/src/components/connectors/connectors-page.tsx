"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Copy, X, Lock, Gauge, Sparkles, ChevronRight, Coins } from "lucide-react";
import type { Plan } from "@easyfetcher/db";

interface Connection {
  id: string;
  platform: string;
  status: string;
  siteUrl: string | null;
  accountId: string | null;
  label: string | null;
}

interface ConnectorsPageProps {
  plan: Plan;
  connections: Connection[];
  workspaceId?: string;
  apiKey: string;
  params: { connected?: string; error?: string; requiredPlan?: string; detail?: string };
}

const CONNECTORS = [
  {
    id: "GSC",
    name: "Search Console",
    description: "GSC clicks, impressions, keywords",
    logo: "/connectors/gsc.svg",
    connectUrl: "/api/connect/google?platform=GSC",
    comingSoon: false,
  },
  {
    id: "GA4",
    name: "Google Analytics 4",
    description: "Sessions, events, conversions",
    logo: "/connectors/google-analytics.svg",
    connectUrl: "/api/connect/google?platform=GA4",
    comingSoon: false,
  },
  {
    id: "PAGESPEED",
    name: "PageSpeed Insights",
    description: "Core Web Vitals, performance scores",
    logo: "/connectors/pagespeed.svg",
    connectUrl: "/api/connect/free?platform=PAGESPEED",
    comingSoon: false,
  },
  {
    id: "GOOGLE_MY_BUSINESS",
    name: "Google My Business",
    description: "Reviews, local visibility",
    logo: "/connectors/google-my-business.svg",
    connectUrl: "/api/connect/google?platform=GOOGLE_MY_BUSINESS",
    comingSoon: true,
  },
] as const;

const PREVIEW_SKILLS = [
  { name: "Rank tracker", provider: "GSC", credits: null, description: "Track keyword positions across Google with daily refreshes." },
  { name: "AI citation tracker", provider: "Apify", credits: 8, description: "See when ChatGPT, Perplexity, and Claude cite your domain." },
  { name: "SEO audit", provider: "Apify", credits: 5, description: "Crawl any site for technical, on-page, and content issues." },
];

const CONNECTOR_LOGOS: Record<string, string> = {
  GSC: "/connectors/gsc.svg",
  GA4: "/connectors/google-analytics.svg",
  GMB: "/connectors/google-my-business.svg",
  PAGESPEED: "/connectors/pagespeed.svg",
};

export function ConnectorsPage({ plan: _plan, connections, workspaceId, apiKey, params }: ConnectorsPageProps) {
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const mcpUrl = (() => {
    if (origin.includes("hub-beta")) {
      return `https://hub-beta.easyfetcher.com/mcp`;
    }
    return `https://mcp.easyfetcher.com/mcp`;
  })();

  const connectedSet = new Set(connections.map((c) => c.platform));
  connectedSet.add("PAGESPEED");
  const connectedCount = CONNECTORS.filter((c) => connectedSet.has(c.id)).length;

  const copyConfig = async () => {
    if (!mcpUrl) return;
    await navigator.clipboard.writeText(mcpUrl);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const step3Done = false; // would persist in localStorage in a real implementation
  const hasFirstSource = connectedCount > 0;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Connectors &amp; Skills</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your sources, then download Claude Skills to start asking questions inside Claude.
        </p>
      </div>

      {/* Alerts */}
      {params.connected && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 text-sm">
          <Check className="w-4 h-4 shrink-0" />
          <span><strong>{params.connected}</strong> connected successfully!</span>
        </div>
      )}
      {params.error === "plan_limit" && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <span>You need to upgrade to <strong>{params.requiredPlan}</strong> to connect this source.{" "}
            <Link href="/dashboard/billing" className="underline">View plans →</Link></span>
        </div>
      )}
      {params.error && params.error !== "plan_limit" && (
        <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          Connection failed: {params.error.replace(/_/g, " ")}.
        </div>
      )}

      {/* Onboarding stepper */}
      {showOnboarding && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-0">
              <Step num={1} done label="Create account" />
              <Connector done />
              <Step num={2} done label="Choose plan" />
              <Connector done={false} />
              <Step num={3} done={step3Done} active={!step3Done} label="Copy MCP URL" />
              <Connector done={false} />
              <Step num={4} done={hasFirstSource} label="Connect first source" />
            </div>
            <div className="flex items-center gap-3 ml-4">
              <button
                onClick={copyConfig}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                {copiedConfig ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedConfig ? "Copied!" : "Copy URL →"}
              </button>
              <button onClick={() => setShowOnboarding(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MCP config card */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                  <span className="text-[10px] font-mono text-muted-foreground">&gt;_</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Your MCP Server URL</p>
                  <p className="text-[10px] text-muted-foreground">STEP 3</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Paste this into Claude.ai Projects (Custom Integration) or Cursor (SSE).{" "}
                <Link href="/dashboard/mcp-config" className="text-primary hover:underline">Full instructions →</Link>
              </p>
            </div>
            <div className="relative">
              <pre className="text-[11px] font-mono leading-relaxed bg-background border border-border rounded-lg p-4 overflow-x-auto text-foreground select-all">
                {mcpUrl || "Loading..."}
              </pre>
              <button
                onClick={copyConfig}
                className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground hover:text-foreground border border-border transition-colors"
              >
                {copiedConfig ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Connectors */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Data connectors</h2>
            <p className="text-xs text-muted-foreground">{connectedCount} of {CONNECTORS.length} connected</p>
          </div>
          <Link href="/dashboard/sources" className="text-xs text-primary hover:underline">
            Manage all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONNECTORS.map((connector) => {
            const isConnected = connectedSet.has(connector.id);
            return (
              <div key={connector.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <div className="w-10 h-10 rounded-lg border border-border bg-background flex items-center justify-center shrink-0">
                  {connector.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={connector.logo} alt={connector.name} className="w-6 h-6 object-contain" />
                  ) : (
                    <Gauge className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{connector.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{connector.description}</p>
                </div>
                {isConnected ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 shrink-0">
                    <Check className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : connector.comingSoon ? (
                  <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-muted text-muted-foreground font-medium shrink-0">
                    <Lock className="w-3 h-3" /> Coming soon
                  </span>
                ) : (
                  <a
                    href={`${connector.connectUrl}${workspaceId ? `&workspaceId=${workspaceId}` : ""}`}
                    className="px-3 py-1.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors shrink-0"
                  >
                    Connect
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Claude Skills preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Claude Skills</h2>
            <p className="text-xs text-muted-foreground">100+ SEO skills</p>
          </div>
          <Link href="/dashboard/skills" className="text-xs text-primary hover:underline flex items-center gap-0.5">
            Browse all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PREVIEW_SKILLS.map((skill) => {
            const logo = CONNECTOR_LOGOS[skill.provider];
            return (
              <div key={skill.name} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" strokeWidth={1.75} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Connector Logo */}
                    {logo && (
                      <div className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                        <img src={logo} alt={skill.provider} className="w-4 h-4 object-contain" />
                      </div>
                    )}
                    {/* Credits badge (Coin Symbol) */}
                    {skill.credits !== null && skill.credits > 0 && (
                      <div
                        className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm shrink-0"
                        title="Uses credits"
                      >
                        <Coins className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{skill.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{skill.description}</p>
                </div>
                <button className="mt-auto w-full py-1.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-1.5">
                  Download skill
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Step({ num, done, active, label }: { num: number; done: boolean; active?: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
          done
            ? "bg-primary border-primary text-primary-foreground"
            : active
              ? "border-primary text-primary bg-background"
              : "border-border text-muted-foreground bg-background"
        }`}
      >
        {done ? <Check className="w-3.5 h-3.5" /> : num}
      </div>
      <span className="text-[10px] text-muted-foreground whitespace-nowrap hidden sm:block">{label}</span>
    </div>
  );
}

function Connector({ done }: { done: boolean }) {
  return (
    <div className={`w-12 h-0.5 mx-1 mb-4 rounded-full transition-colors ${done ? "bg-primary" : "bg-border"}`} />
  );
}
