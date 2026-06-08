"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

const MCP_URL = "https://mcp.easyfetcher.com/mcp";

export function McpUrlCard() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(MCP_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground mb-1">MCP Server URL</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Paste this into Claude.ai → Settings → Integrations. You&apos;ll be prompted to log in — no API key needed.
      </p>

      <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2.5 border border-border">
        <code className="text-[12px] font-mono text-foreground flex-1 select-all truncate">{MCP_URL}</code>
        <button
          onClick={copy}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-background text-xs font-medium text-muted-foreground hover:text-foreground border border-border transition-colors shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground mt-3">
        Works with Claude.ai Projects, Cursor SSE, and any MCP-compatible client.
      </p>
    </div>
  );
}
