"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckSquare, Square, Globe, Loader2 } from "lucide-react";

interface Site {
  siteUrl: string;
  permissionLevel?: string;
  displayName?: string;
}

function friendlyLabel(site: Site): string {
  return site.displayName ?? site.siteUrl
    .replace("sc-domain:", "")
    .replace("https://", "")
    .replace("http://", "")
    .replace(/\/$/, "");
}

export default function PickSitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pendingId = searchParams.get("pendingId");

  const [sites, setSites] = useState<Site[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingId) { setError("Missing session. Please try connecting again."); setLoading(false); return; }
    fetch(`/api/connect/pending-sites?pendingId=${pendingId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setSites(data.sites);
      })
      .catch(() => setError("Failed to load sites."))
      .finally(() => setLoading(false));
  }, [pendingId]);

  function toggle(siteUrl: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(siteUrl) ? next.delete(siteUrl) : next.add(siteUrl);
      return next;
    });
  }

  async function handleConfirm() {
    if (selected.size === 0) return;
    setSaving(true);
    const siteUrl = [...selected].map(encodeURIComponent).join(",");
    router.push(`/api/connect/confirm?pendingId=${pendingId}&siteUrl=${siteUrl}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center">
        <p className="text-sm text-destructive mb-4">{error}</p>
        <a href="/dashboard/sources" className="text-sm text-primary hover:underline">Back to sources</a>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-8">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-base font-semibold text-foreground mb-1">Select websites to connect</h1>
        <p className="text-sm text-muted-foreground mb-5">
          Choose which sites Claude can access. You can add more sites later.
        </p>

        <div className="space-y-2 mb-6">
          {sites.map((site) => {
            const isSelected = selected.has(site.siteUrl);
            return (
              <button
                key={site.siteUrl}
                onClick={() => toggle(site.siteUrl)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent"
                }`}
              >
                {isSelected
                  ? <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                  : <Square className="w-4 h-4 text-muted-foreground shrink-0" />}
                <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">
                  {friendlyLabel(site)}
                </span>
                {site.permissionLevel && site.permissionLevel !== "siteUnverifiedUser" && (
                  <span className="ml-auto text-xs text-green-600 dark:text-green-400 shrink-0">Verified</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/dashboard/sources"
            className="flex-1 py-2 px-4 rounded-md border border-border text-sm font-medium text-foreground text-center hover:bg-accent transition-colors"
          >
            Cancel
          </a>
          <button
            onClick={handleConfirm}
            disabled={selected.size === 0 || saving}
            className="flex-1 py-2 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Connect {selected.size > 0 ? `${selected.size} site${selected.size > 1 ? "s" : ""}` : "selected"}
          </button>
        </div>
      </div>
    </div>
  );
}
