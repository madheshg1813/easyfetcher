"use client";

import { useState } from "react";
import { SourceCard, type SourceConfig } from "./source-card";
import type { Plan } from "@easyfetcher/db";
import type { ConnectionRow } from "./source-card";

type FilterTab = "all" | "connected" | "available";

interface SourcesGridProps {
  sources: SourceConfig[];
  userPlan: Plan;
  connections: ConnectionRow[];
  workspaceId?: string;
}

export function SourcesGrid({ sources, userPlan, connections, workspaceId }: SourcesGridProps) {
  const [filter, setFilter] = useState<FilterTab>("all");

  // Group connections by platform — multiple per platform are allowed (e.g. multiple GSC sites)
  const connectionsByPlatform = new Map<string, ConnectionRow[]>();
  for (const c of connections) {
    if (!connectionsByPlatform.has(c.platform)) connectionsByPlatform.set(c.platform, []);
    connectionsByPlatform.get(c.platform)!.push(c);
  }

  const connectedPlatforms = new Set(
    connections.filter((c) => c.status === "CONNECTED").map((c) => c.platform)
  );

  const filtered = sources.filter((s) => {
    const isConnected = connectedPlatforms.has(s.platform);
    if (filter === "connected") return isConnected;
    if (filter === "available") return !isConnected;
    return true;
  });

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All sources" },
    { id: "connected", label: `Connected (${connectedPlatforms.size})` },
    { id: "available", label: "Available" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          {filter === "connected" ? "No sources connected yet." : "No sources available."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              userPlan={userPlan}
              connections={connectionsByPlatform.get(source.platform) ?? []}
              workspaceId={workspaceId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
