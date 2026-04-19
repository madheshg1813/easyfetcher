"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Lock, Globe } from "lucide-react";
import Image from "next/image";
import { ManageModal } from "./manage-modal";
import type { Plan, Platform } from "@easyfetcher/db";

export interface SourceConfig {
  id: string;          // unique display key — used for React keys and routing
  platform: Platform;  // actual DB platform — used for OAuth and connection lookup
  name: string;
  description: string;
  logo: string;        // path to SVG in /public/connectors/
  requiredPlan: Plan;
  sharedNote?: string; // shown when two cards share the same OAuth connection
}

export interface ConnectionRow {
  id: string;
  platform: Platform;
  status: string;
  siteUrl: string | null;
  accountId: string | null;
  label?: string | null;
  updatedAt: Date;
  metadata: unknown;
}

const planOrder: Plan[] = ["FREE", "STARTER", "PRO", "AGENCY", "ENTERPRISE"];

const planColors: Record<Plan, string> = {
  FREE: "bg-green-500/15 text-green-600 dark:text-green-400",
  STARTER: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  PRO: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
  AGENCY: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
  ENTERPRISE: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
};

const GOOGLE_PLATFORMS: string[] = ["GSC", "GA4", "GOOGLE_ADS", "GOOGLE_MY_BUSINESS"];
const META_PLATFORMS: string[] = ["META_ADS", "INSTAGRAM"];
const FREE_PLATFORMS: string[] = ["GOOGLE_TRENDS"];

function siteLabel(conn: ConnectionRow): string {
  if (conn.label) return conn.label;
  if (conn.siteUrl) return conn.siteUrl.replace("sc-domain:", "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (conn.accountId) return `Account ${conn.accountId}`;
  return conn.platform;
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Inline remove button used in the multi-site list
function DisconnectInline({ platform, connectionId }: { platform: string; connectionId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    setLoading(true);
    await fetch("/api/connect/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, connectionId }),
    });
    setLoading(false);
    setConfirming(false);
    router.refresh();
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleRemove}
          disabled={loading}
          className="text-[10px] text-destructive font-medium hover:underline disabled:opacity-50"
        >
          {loading ? "Removing…" : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-[10px] text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-[10px] text-destructive hover:underline"
    >
      Remove
    </button>
  );
}

interface SourceCardProps {
  source: SourceConfig;
  userPlan: Plan;
  connections: ConnectionRow[];
  workspaceId?: string;
}

export function SourceCard({ source, userPlan, connections, workspaceId }: SourceCardProps) {
  const [modalConn, setModalConn] = useState<ConnectionRow | null>(null);

  const connected = connections.filter((c) => c.status === "CONNECTED");
  const isConnected = connected.length > 0;
  const userPlanIndex = planOrder.indexOf(userPlan);
  const requiredPlanIndex = planOrder.indexOf(source.requiredPlan);
  const canAccess = userPlanIndex >= requiredPlanIndex;
  const isGooglePlatform = GOOGLE_PLATFORMS.includes(source.platform as string);
  const isMetaPlatform = META_PLATFORMS.includes(source.platform as string);

  const handleConnect = () => {
    if (isGooglePlatform) {
      const url = `/api/connect/google?platform=${source.platform}${workspaceId ? `&workspaceId=${workspaceId}` : ""}`;
      window.location.href = url;
    } else if (isMetaPlatform) {
      const url = `/api/connect/meta?platform=${source.platform}${workspaceId ? `&workspaceId=${workspaceId}` : ""}`;
      window.location.href = url;
    } else if (FREE_PLATFORMS.includes(source.platform as string)) {
      const url = `/api/connect/free?platform=${source.platform}${workspaceId ? `&workspaceId=${workspaceId}` : ""}`;
      window.location.href = url;
    } else {
      alert(`${source.name} integration is coming soon!`);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4 hover:border-primary/30 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
              <Image src={source.logo} alt={source.name} width={28} height={28} className="object-contain" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{source.name}</h3>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${planColors[source.requiredPlan]}`}>
                {source.requiredPlan}
              </span>
            </div>
          </div>
          {isConnected && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                {connected.length > 1 ? `${connected.length} sites` : "Connected"}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed">{source.description}</p>
        {source.sharedNote && (
          <p className="text-[10px] text-muted-foreground/70 bg-muted/60 rounded px-2 py-1 -mt-2">
            {source.sharedNote}
          </p>
        )}

        {/* Single site */}
        {isConnected && connected.length === 1 && (
          <div className="flex items-center gap-2 py-1.5 px-2 rounded-md bg-muted/50">
            <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-foreground font-medium truncate flex-1">{siteLabel(connected[0])}</span>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {formatRelativeTime(connected[0].updatedAt)}
            </span>
          </div>
        )}

        {/* Multiple sites — always expanded, remove button on each row */}
        {isConnected && connected.length > 1 && (
          <div className="rounded-md border border-border divide-y divide-border overflow-hidden">
            {connected.map((conn) => (
              <div key={conn.id} className="flex items-center gap-2 px-3 py-2.5">
                <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-xs text-foreground truncate flex-1">{siteLabel(conn)}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setModalConn(conn)}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Manage
                  </button>
                  <span className="text-muted-foreground/40">·</span>
                  <DisconnectInline platform={conn.platform} connectionId={conn.id} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto">
          {isConnected ? (
            <>
              {connected.length === 1 && (
                <button
                  onClick={() => setModalConn(connected[0])}
                  className="w-full py-2 px-4 rounded-md border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-medium hover:bg-green-500/10 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Manage
                </button>
              )}
            </>
          ) : canAccess ? (
            <button
              onClick={handleConnect}
              className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              Connect {source.name}
            </button>
          ) : (
            <button
              disabled
              className="w-full py-2 px-4 rounded-md bg-muted text-muted-foreground text-xs font-medium cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              Upgrade to {source.requiredPlan}
            </button>
          )}
        </div>
      </div>

      {modalConn && (
        <ManageModal connection={modalConn} onClose={() => setModalConn(null)} />
      )}
    </>
  );
}
