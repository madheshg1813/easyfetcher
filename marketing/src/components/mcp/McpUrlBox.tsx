"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

// The universal Easy Fetcher MCP Server URL. Auth is per-user via OAuth, so the
// URL is the same for everyone — safe to show publicly. Single source of truth.
export const MCP_SERVER_URL = "https://mcp.easyfetcher.com/mcp";

export default function McpUrlBox() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(MCP_SERVER_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <div className="mt-10 max-w-2xl mx-auto">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 text-center">
        MCP Server URL
      </p>
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-1.5 pl-4 shadow-sm">
        <code className="flex-1 font-mono text-sm sm:text-[15px] text-gray-800 truncate">{MCP_SERVER_URL}</code>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy MCP Server URL"
          className="inline-flex items-center gap-1.5 shrink-0 px-3.5 py-2 rounded-lg bg-[#171717] text-white text-sm font-bold hover:bg-[#2b2b2b] transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
