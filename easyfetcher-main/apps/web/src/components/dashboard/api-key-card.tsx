"use client";

import { useState } from "react";
import { Eye, EyeOff, RefreshCw, Copy, Check } from "lucide-react";

interface ApiKeyCardProps {
  maskedKey: string;
  mcpConfig: string;
}

export function ApiKeyCard({ maskedKey, mcpConfig }: ApiKeyCardProps) {
  const [revealed, setRevealed] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleReveal = async () => {
    if (revealed) {
      setRevealed(null);
      return;
    }
    const res = await fetch("/api/keys");
    const data = await res.json() as { maskedKey: string };
    // For Sprint 2 reveal is just showing the masked — full reveal requires a separate endpoint
    // We show a tooltip explaining the key was set at creation
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
      // Reload page after 10s to show new masked key
      setTimeout(() => window.location.reload(), 10500);
    } finally {
      setRotating(false);
    }
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
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground mb-1">MCP Config</h2>
      <p className="text-xs text-muted-foreground mb-3">
        Add this to your{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-[11px]">
          claude_desktop_config.json
        </code>:
      </p>

      {/* Config JSON */}
      <div className="relative">
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

      {/* API Key */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Your API key</p>
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
            title={revealed ? "Hide key" : "Info"}
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

        {/* Rotate */}
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
            <button
              onClick={handleRotate}
              disabled={rotating}
              className="text-xs text-destructive underline disabled:opacity-50"
            >
              {rotating ? "Rotating…" : "Confirm"}
            </button>
            <button
              onClick={() => setConfirmRotate(false)}
              className="text-xs text-muted-foreground"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
