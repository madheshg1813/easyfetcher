"use client";

import { useState } from "react";
import { X, RefreshCw, Globe } from "lucide-react";
import { DisconnectButton } from "./disconnect-button";

interface ManageModalProps {
  connection: {
    id: string;
    platform: string;
    status: string;
    siteUrl: string | null;
    accountId: string | null;
    label?: string | null;
    updatedAt: Date;
    metadata: unknown;
  };
  onClose: () => void;
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

function friendlyUrl(siteUrl: string): string {
  return siteUrl.replace("sc-domain:", "").replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function ManageModal({ connection, onClose }: ManageModalProps) {
  const [reauthLoading, setReauthLoading] = useState(false);
  const metadata = connection.metadata as Record<string, unknown> | null;

  const handleReauth = () => {
    setReauthLoading(true);
    window.location.href = `/api/connect/google?platform=${connection.platform}`;
  };

  const displayName = connection.label ?? (connection.siteUrl ? friendlyUrl(connection.siteUrl) : connection.platform);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">{displayName}</h2>
              <p className="text-[10px] text-muted-foreground">{connection.platform}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="text-sm text-foreground font-medium">Connected</span>
            <span className="text-xs text-muted-foreground ml-auto">
              Updated {formatRelativeTime(connection.updatedAt)}
            </span>
          </div>

          <dl className="space-y-2.5 text-sm bg-muted/40 rounded-lg p-3">
            {connection.siteUrl && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">Site URL</dt>
                <dd className="text-foreground font-medium truncate text-right">
                  {friendlyUrl(connection.siteUrl)}
                </dd>
              </div>
            )}
            {connection.accountId && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">Account ID</dt>
                <dd className="text-foreground font-medium">{connection.accountId}</dd>
              </div>
            )}
            {metadata?.email != null && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">Google account</dt>
                <dd className="text-foreground font-medium truncate text-right">
                  {String(metadata.email)}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-border space-y-2">
          <button
            onClick={handleReauth}
            disabled={reauthLoading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reauthLoading ? "animate-spin" : ""}`} />
            Re-authenticate
          </button>
          <DisconnectButton platform={connection.platform} connectionId={connection.id} />
        </div>
      </div>
    </div>
  );
}
