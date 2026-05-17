"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface McpConfigClientProps {
  mcpConfig: string;
  maskedKey: string;
}

const STEPS = [
  { num: 1, title: "Open Claude Desktop", detail: 'Go to Settings → Developer → "Edit Config"' },
  { num: 2, title: "Paste the config", detail: "Copy the JSON below and paste it into your config file." },
  { num: 3, title: "Restart Claude", detail: "Quit and reopen Claude Desktop. EasyFetcher will appear as a connected integration." },
];

export function McpConfigClient({ mcpConfig, maskedKey }: McpConfigClientProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(mcpConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Steps */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">How to connect</h2>
        {STEPS.map((step) => (
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

      {/* Config block */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">Your MCP config</h2>
          <button
            onClick={copy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy config"}
          </button>
        </div>
        <pre className="text-[12px] font-mono leading-relaxed bg-muted rounded-lg p-4 overflow-x-auto text-foreground border border-border">
          {mcpConfig}
        </pre>
        <p className="text-[11px] text-muted-foreground mt-2">
          Your token: <code className="font-mono">{maskedKey}</code> — keep this private.
        </p>
      </div>
    </div>
  );
}
