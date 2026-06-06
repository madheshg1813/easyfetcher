"use client";

import { useState } from "react";
import { Eye, EyeOff, RefreshCw, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

const MCP_URL = "https://mcp.easyfetcher.com/mcp";

interface ApiKeyCardProps {
  maskedKey: string;
  mcpConfig: string;
}

export function ApiKeyCard({ maskedKey, mcpConfig }: ApiKeyCardProps) {
  const [revealed, setRevealed] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);

  const handleReveal = async () => {
    if (revealed) { setRevealed(null); return; }
    setRevealed("To see full key, rotate it — it will be shown once.");
    setTimeout(() => setRevealed(null), 5000);
  };

  const handleRotate = async () => {
    setRotating(true);
    setConfirmRotate(false);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rotate" }),
      });
      const data = await res.json() as { newKey: string };
      setRevealed(data.newKey);
      setTimeout(() => setRevealed(null), 10000);
      setTimeout(() => window.location.reload(), 10500);
    } finally {
      setRotating(false);
    }
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(MCP_URL);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const copyConfig = async () => {
    await navigator.clipboard.writeText(mcpConfig);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const copyKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-5">
      {/* Primary: MCP Server URL */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-1">Your MCP Server URL</h2>
        <p className="text-xs text-muted-foreground mb-3">
          Paste this into{" "}
          <span className="font-medium text-foreground">Claude.ai → Projects → Custom integrations</span>
          {" "}to connect your data.
        </p>
        <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2">
          <code className="flex-1 text-xs font-mono text-foreground truncate">{MCP_URL}</code>
          <button
            onClick={copyUrl}
            className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {copiedUrl ? (
              <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-500">Copied!</span></>
            ) : (
              <><Copy className="w-3.5 h-3.5" />Copy</>
            )}
          </button>
        </div>
      </div>

      {/* Secondary: Claude Desktop toggle */}
      <div className="border-t border-border pt-4">
        <button
          onClick={() => setShowDesktop((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showDesktop ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          Using Claude Desktop instead?
        </button>
        {showDesktop && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">
              Add this to your{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-[11px]">claude_desktop_config.json</code>:
            </p>
            <pre className="text-[11px] leading-relaxed bg-muted rounded-md p-3 overflow-x-auto text-foreground">
              {mcpConfig}
            </pre>
            <button
              onClick={copyConfig}
              className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copiedConfig ? (
                <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-500">Copied!</span></>
              ) : (
                <><Copy className="w-3.5 h-3.5" />Copy config</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* API Key — advanced */}
      <div className="border-t border-border pt-4">
        <p className="text-xs text-muted-foreground mb-2">API key</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-muted px-3 py-2 rounded-md font-mono text-foreground truncate">
            {revealed ?? maskedKey}
          </code>
          {revealed && (
            <button onClick={() => copyKey(revealed)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              {copiedKey ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            onClick={handleReveal}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title={revealed ? "Hide" : "Info"}
          >
            {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
        {revealed && revealed.startsWith("To see") && (
          <p className="mt-1.5 text-[11px] text-muted-foreground">{revealed}</p>
        )}
        {revealed && !revealed.startsWith("To see") && (
          <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400">
            ⚠ Copy this key now — it won&apos;t be shown again. Hides in 10s.
          </p>
        )}
        {!confirmRotate ? (
          <button
            onClick={() => setConfirmRotate(true)}
            className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Rotate key
          </button>
        ) : (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-destructive">This will invalidate your current key.</span>
            <button onClick={handleRotate} disabled={rotating} className="text-xs text-destructive underline disabled:opacity-50">
              {rotating ? "Rotating…" : "Confirm"}
            </button>
            <button onClick={() => setConfirmRotate(false)} className="text-xs text-muted-foreground">Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
