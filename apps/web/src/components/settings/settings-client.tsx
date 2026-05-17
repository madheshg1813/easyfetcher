"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Check, RefreshCw } from "lucide-react";

interface SettingsClientProps {
  workspaceName: string;
  email: string;
  displayName: string;
  maskedKey: string;
  keyCreatedAt: string;
}

export function SettingsClient({ workspaceName, email, displayName, maskedKey, keyCreatedAt }: SettingsClientProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const [notifs, setNotifs] = useState({
    lowCredit: true,
    weeklyDigest: true,
    productUpdates: false,
  });

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
      setNewKey(data.newKey);
      setRevealed(true);
      setTimeout(() => {
        setNewKey(null);
        setRevealed(false);
        window.location.reload();
      }, 10000);
    } finally {
      setRotating(false);
    }
  };

  const copyKey = async () => {
    const key = newKey ?? maskedKey;
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayKey = newKey ?? maskedKey;

  return (
    <div className="space-y-4">
      {/* Profile */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Profile</h2>
        <div className="space-y-4">
          <Field label="Workspace name" value={workspaceName} editable />
          <Field label="Email" value={email} action={<button className="text-xs text-primary hover:underline">Change</button>} />
          <Field label="Display name" value={displayName} editable />
        </div>
      </section>

      {/* API Token */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">API token</h2>
          <span className="text-[11px] text-muted-foreground">Used in your MCP config</span>
        </div>

        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-muted px-3 py-2.5 rounded-lg font-mono text-foreground truncate border border-border">
            {revealed || newKey ? displayKey : maskedKey}
          </code>
          <button
            onClick={() => setRevealed(!revealed)}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
          >
            {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={copyKey}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {newKey && (
          <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">
            ⚠ Copy this key now — it won&apos;t be shown again. Hides in 10s.
          </p>
        )}

        {keyCreatedAt && (
          <p className="text-[11px] text-muted-foreground mt-2">Created {keyCreatedAt}</p>
        )}

        <div className="mt-3 pt-3 border-t border-border">
          {!confirmRotate ? (
            <button
              onClick={() => setConfirmRotate(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate token
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs text-destructive">This will invalidate your current token.</span>
              <button
                onClick={handleRotate}
                disabled={rotating}
                className="text-xs text-destructive underline disabled:opacity-50"
              >
                {rotating ? "Regenerating…" : "Confirm"}
              </button>
              <button onClick={() => setConfirmRotate(false)} className="text-xs text-muted-foreground">
                Cancel
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Notifications</h2>
        <div className="space-y-4">
          <Toggle
            label="Low credit alerts"
            description="Email when you drop below 10 credits"
            checked={notifs.lowCredit}
            onChange={(v) => setNotifs((n) => ({ ...n, lowCredit: v }))}
          />
          <Toggle
            label="Weekly usage digest"
            description="Sent every Monday morning"
            checked={notifs.weeklyDigest}
            onChange={(v) => setNotifs((n) => ({ ...n, weeklyDigest: v }))}
          />
          <Toggle
            label="Product updates"
            description="Occasional emails about new connectors and skills"
            checked={notifs.productUpdates}
            onChange={(v) => setNotifs((n) => ({ ...n, productUpdates: v }))}
          />
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-destructive/30 bg-card p-5">
        <h2 className="text-sm font-semibold text-destructive mb-1">Danger zone</h2>
        <p className="text-xs text-muted-foreground mb-4">Permanently delete your account and all associated data.</p>
        <button
          disabled
          className="px-4 py-2 rounded-lg border border-destructive/40 text-destructive text-xs font-medium opacity-50 cursor-not-allowed"
        >
          Delete account
        </button>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  editable,
  action,
}: {
  label: string;
  value: string;
  editable?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm text-muted-foreground shrink-0 w-32">{label}</label>
      <div className="flex items-center gap-2 flex-1 justify-end">
        {editable ? (
          <input
            defaultValue={value}
            className="flex-1 max-w-xs text-sm px-3 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-right"
          />
        ) : (
          <span className="text-sm text-foreground">{value}</span>
        )}
        {action}
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${checked ? "bg-primary" : "bg-muted"}`}
        style={{ height: "22px", width: "40px" }}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[18px]" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}
