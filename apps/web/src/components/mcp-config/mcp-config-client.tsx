"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

const MCP_URL = "https://mcp.easyfetcher.com/mcp";

const CLAUDE_STEPS = [
  { num: 1, title: "Copy the MCP URL", detail: "Copy the URL from the box below." },
  { num: 2, title: "Open a Project in Claude.ai", detail: "Go to your Claude.ai workspace, open a Project, and go to the Developer tab." },
  { num: 3, title: "Add Custom Integration", detail: "Click 'Add Custom Integration', paste the URL, and click Connect. You'll be prompted to log in to EasyFetcher." },
];

const IDE_STEPS = [
  { num: 1, title: "Copy the MCP URL", detail: "Copy the URL from the box below." },
  { num: 2, title: "Open IDE settings", detail: "Go to settings in Cursor, Windsurf, or other MCP-compatible editors." },
  { num: 3, title: "Add SSE server", detail: "Add a new MCP server, select SSE (or HTTP) type, and paste the URL. Log in when prompted." },
];

export function McpConfigClient() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"claude" | "ide">("claude");

  const copy = async () => {
    await navigator.clipboard.writeText(MCP_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = activeTab === "claude" ? CLAUDE_STEPS : IDE_STEPS;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("claude")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-[2px] transition-colors ${
            activeTab === "claude"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Claude.ai Projects
        </button>
        <button
          onClick={() => setActiveTab("ide")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-[2px] transition-colors ${
            activeTab === "ide"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Cursor / IDEs
        </button>
      </div>

      {/* Steps */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">How to connect</h2>
        {steps.map((step) => (
          <div key={step.num} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[11px] font-bold text-primary">{step.num}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{step.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* URL block */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">MCP Server URL</h2>
          <button
            onClick={copy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy URL"}
          </button>
        </div>
        <div className="flex items-center gap-3 bg-muted rounded-lg px-4 py-3 border border-border">
          <code className="text-[13px] font-mono text-foreground flex-1 select-all">{MCP_URL}</code>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Works with Claude.ai Projects, Cursor (SSE), and any MCP-compatible client.
        </p>
      </div>
    </div>
  );
}
