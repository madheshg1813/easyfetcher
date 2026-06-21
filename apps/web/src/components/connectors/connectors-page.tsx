"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Copy, X, Lock, Gauge, Sparkles, ChevronRight, ChevronDown, Coins } from "lucide-react";
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
  params: { connected?: string; error?: string; requiredPlan?: string; detail?: string };
}

const MCP_URL = "https://mcp.easyfetcher.com/mcp";

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
    connectUrl: "",
    comingSoon: false,
  },
  {
    id: "GOOGLE_MY_BUSINESS",
    name: "Google My Business",
    description: "Reviews, local visibility",
    logo: "/connectors/google-my-business.svg",
    connectUrl: "/api/connect/google?platform=GOOGLE_MY_BUSINESS",
    comingSoon: false,
  },
  {
    id: "BING_WEBMASTER",
    name: "Bing Webmaster",
    description: "Bing organic clicks, impressions, rankings",
    logo: "/connectors/bing.svg",
    connectUrl: "",
    comingSoon: false,
  },
] as const;

const CONNECTOR_LOGOS: Record<string, string> = {
  GSC: "/connectors/gsc.svg",
  GA4: "/connectors/google-analytics.svg",
  GMB: "/connectors/google-my-business.svg",
  PAGESPEED: "/connectors/pagespeed.svg",
};

const PREVIEW_SKILLS = [
  { name: "Rank tracker", provider: "GSC", credits: null, description: "Track keyword positions across Google with daily refreshes." },
  { name: "AI citation tracker", provider: "Apify", credits: 8, description: "See when ChatGPT, Perplexity, and Claude cite your domain." },
  { name: "SEO audit", provider: "Apify", credits: 5, description: "Crawl any site for technical, on-page, and content issues." },
];

export function ConnectorsPage({ plan: _plan, connections, params }: ConnectorsPageProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const connectedSet = new Set(connections.map((c) => c.platform));
  connectedSet.add("PAGESPEED");
  const connectedCount = CONNECTORS.filter((c) => connectedSet.has(c.id)).length;

  const copyUrl = async () => {
    await navigator.clipboard.writeText(MCP_URL);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const step3Done = false;
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
                onClick={copyUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedUrl ? "Copied!" : "Copy URL →"}
              </button>
              <button onClick={() => setShowOnboarding(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MCP URL card */}
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
            <div className="relative flex items-center gap-2 bg-background border border-border rounded-lg px-4 py-3">
              <code className="text-[12px] font-mono text-foreground flex-1 select-all">{MCP_URL}</code>
              <button
                onClick={copyUrl}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground hover:text-foreground border border-border transition-colors shrink-0"
              >
                {copiedUrl ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
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
            const platformConns = connections.filter((c) => c.platform === connector.id);
            const isConnected = connectedSet.has(connector.id);

            if (connector.id === "PAGESPEED") {
              return (
                <div key={connector.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                  <div className="w-10 h-10 rounded-lg border border-border bg-background flex items-center justify-center shrink-0">
                    <img src={connector.logo} alt={connector.name} className="w-6 h-6 object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{connector.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{connector.description}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 shrink-0">
                    <Check className="w-3.5 h-3.5" /> Connected
                  </span>
                </div>
              );
            }

            return (
              <ConnectorCard
                key={connector.id}
                connector={connector}
                connections={platformConns}
                isConnected={isConnected}
              />
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
                    {logo && (
                      <div className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                        <img src={logo} alt={skill.provider} className="w-4 h-4 object-contain" />
                      </div>
                    )}
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

// ─── Subcomponents ────────────────────────────────────────────────────────────

function ConnectorCard({
  connector,
  connections,
  isConnected,
}: {
  connector: typeof CONNECTORS[number];
  connections: Connection[];
  isConnected: boolean;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [showApiForm, setShowApiForm] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  const isApiKeyConnector = connector.id === "BING_WEBMASTER";

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setLoading("submit");
    setApiError(null);
    try {
      const res = await fetch("/api/connect/bing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error ?? "Connection failed. Please try again.");
        return;
      }
      setShowApiForm(false);
      setApiKey("");
      router.refresh();
    } catch {
      setApiError("Connection failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async (connectionId?: string) => {
    if (loading) return;
    if (!confirm(connectionId ? "Disconnect this site?" : `Disconnect all ${connector.name} connections?`)) return;

    setLoading(connectionId ?? "all");
    try {
      const res = await fetch("/api/connect/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: connector.id, connectionId }),
      });
      if (!res.ok) throw new Error("Failed to disconnect");
      router.refresh();
    } catch {
      alert("Failed to disconnect. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card transition-colors overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 p-4">
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
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 shrink-0 hover:opacity-80 transition-opacity"
          >
            <Check className="w-3.5 h-3.5" />
            Connected
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>
        ) : connector.comingSoon ? (
          <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-muted text-muted-foreground font-medium shrink-0">
            <Lock className="w-3 h-3" /> Coming soon
          </span>
        ) : isApiKeyConnector ? (
          <button
            onClick={() => { setShowApiForm((v) => !v); setApiError(null); }}
            className="px-3 py-1.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors shrink-0"
          >
            Connect
          </button>
        ) : (
          <a
            href={connector.connectUrl}
            className="px-3 py-1.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors shrink-0"
          >
            Connect
          </a>
        )}
      </div>

      {/* API key form (Bing Webmaster) */}
      {!isConnected && isApiKeyConnector && showApiForm && (
        <div className="border-t border-border bg-muted/30 px-4 py-3">
          <form onSubmit={handleApiKeySubmit} className="space-y-2.5">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                API key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your Bing Webmaster API key"
                className="w-full px-3 py-2 text-xs rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                autoFocus
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Get it from{" "}
                <a
                  href="https://www.bing.com/webmasters/home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Bing Webmaster Tools
                </a>
                {" "}→ Settings → API access
              </p>
            </div>
            {apiError && (
              <p className="text-[11px] text-destructive">{apiError}</p>
            )}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={loading === "submit" || !apiKey.trim()}
                className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading === "submit" ? "Connecting…" : "Connect"}
              </button>
              <button
                type="button"
                onClick={() => { setShowApiForm(false); setApiError(null); setApiKey(""); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Connected sites dropdown */}
      {isConnected && open && (
        <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-2">
          {connections.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                <span className="text-xs text-foreground font-medium truncate">
                  {c.label ?? c.siteUrl ?? c.accountId ?? "Unknown"}
                </span>
              </div>
              <button
                onClick={() => handleDisconnect(c.id)}
                disabled={loading === c.id}
                className="text-[11px] text-muted-foreground hover:text-destructive transition-colors shrink-0 disabled:opacity-40"
              >
                {loading === c.id ? "…" : "Remove"}
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between pt-1">
            {!isApiKeyConnector && (
              <a
                href={connector.connectUrl}
                className="text-[11px] text-primary hover:underline font-medium"
              >
                + Add another site
              </a>
            )}
            {connections.length > 1 && (
              <button
                onClick={() => handleDisconnect()}
                disabled={loading === "all"}
                className="text-[11px] text-destructive hover:underline disabled:opacity-40"
              >
                Disconnect all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Step({ num, done, label, active }: { num: number; done: boolean; label: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 ${active ? "opacity-100" : "opacity-70"}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${done ? "bg-green-500 text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
        {done ? <Check className="w-3 h-3" /> : num}
      </div>
      <span className={`text-[11px] whitespace-nowrap ${active ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>{label}</span>
    </div>
  );
}

function Connector({ done }: { done: boolean }) {
  return <div className={`w-3 h-[1px] mx-1.5 ${done ? "bg-green-500" : "bg-border"}`} />;
}
