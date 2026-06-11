"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Loader2, XCircle, CheckCircle2 } from "lucide-react";

interface TrialManageCardProps {
  daysLeft: number;
  trialEnd: string; // ISO date
  planName: string;
  chargeAmount: string; // e.g. "$108/year"
  cancelScheduled: boolean;
}

export function TrialManageCard({
  daysLeft,
  trialEnd,
  planName,
  chargeAmount,
  cancelScheduled,
}: TrialManageCardProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endDate = new Date(trialEnd).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  async function cancelTrial() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to cancel");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (cancelScheduled) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-5">
        <div className="flex items-start gap-3">
          <XCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Trial cancelled</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your card will <span className="font-semibold text-foreground">not be charged</span>. You keep full access to the{" "}
              {planName} plan until <span className="font-semibold text-foreground">{endDate}</span>, then your account is
              deactivated. Changed your mind? Just start a new subscription after the trial ends.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Free trial — {daysLeft} {daysLeft === 1 ? "day" : "days"} remaining
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your {planName} plan trial ends on <span className="font-semibold text-foreground">{endDate}</span>. After that,
              you&apos;ll be charged <span className="font-semibold text-foreground">{chargeAmount}</span>. Cancel before then
              and you pay nothing.
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-3 h-3" />
              Full access unlocked during your trial
            </div>
          </div>
        </div>

        <div className="shrink-0">
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
            >
              Cancel trial
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={cancelTrial}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-60 flex items-center gap-1.5"
              >
                {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                Yes, cancel
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={loading}
                className="px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Keep trial
              </button>
            </div>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
}
