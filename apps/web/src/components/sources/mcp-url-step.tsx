"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

const MCP_URL = "https://mcp.easyfetcher.com/mcp";

export function McpUrlStep() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(MCP_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground mb-0.5">
            Next: add your MCP URL to Claude
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Go to{" "}
            <span className="font-medium text-foreground">
              Claude.ai → Projects → Custom integrations
            </span>{" "}
            and paste this URL to start querying your data.
          </p>
          <div className="flex items-center gap-2 bg-background rounded-md border border-border px-3 py-2">
            <code className="flex-1 text-xs font-mono text-foreground truncate">{MCP_URL}</code>
            <button
              onClick={handleCopy}
              className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {copied ? (
                <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-500">Copied!</span></>
              ) : (
                <><Copy className="w-3.5 h-3.5" />Copy URL</>
              )}
            </button>
          </div>
        </div>
        <a
          href="https://claude.ai/projects"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          Open Claude
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
