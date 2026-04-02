"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DisconnectButtonProps {
  platform: string;
  connectionId: string; // disconnect just this one site
}

export function DisconnectButton({ platform, connectionId }: DisconnectButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await fetch("/api/connect/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, connectionId }),
      });
      router.refresh();
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex gap-2 w-full">
        <button
          onClick={handleDisconnect}
          disabled={loading}
          className="flex-1 py-2 px-3 rounded-md bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Disconnecting…" : "Confirm disconnect"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="py-2 px-3 rounded-md border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="w-full py-2 px-3 rounded-md border border-destructive/40 text-destructive text-xs font-medium hover:bg-destructive/10 transition-colors"
    >
      Disconnect this site
    </button>
  );
}
