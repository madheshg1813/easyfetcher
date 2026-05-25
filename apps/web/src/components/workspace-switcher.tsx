"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, Check, Building2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getWorkspaceLimit } from "@/lib/plan-check";
import type { Plan } from "@easyfetcher/db";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  isDefault: boolean;
  faviconUrl?: string | null;
  websiteUrl?: string | null;
}

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  plan: Plan;
}

export function WorkspaceSwitcher({ workspaces, activeWorkspaceId, plan }: WorkspaceSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();

  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0];
  const canCreate = workspaces.length < getWorkspaceLimit(plan);

  async function switchWorkspace(id: string) {
    setOpen(false);
    await fetch(`/api/workspaces/${id}/active`, { method: "POST" });
    startTransition(() => router.refresh());
  }

  async function createWorkspace() {
    if (!newName.trim()) return;
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      setNewName("");
      setCreating(false);
      setOpen(false);
      startTransition(() => router.refresh());
    }
  }

  return (
    <div className="relative px-2 mb-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          "bg-accent/40 hover:bg-accent text-sidebar-foreground",
          isPending && "opacity-60"
        )}
      >
        {activeWs?.faviconUrl ? (
          <Image src={activeWs.faviconUrl} alt="" width={16} height={16} className="rounded shrink-0 object-contain" unoptimized />
        ) : (
          <Building2 className="w-4 h-4 shrink-0 text-primary" />
        )}
        <span className="flex-1 text-left truncate">{activeWs?.name ?? "Workspace"}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-2 right-2 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-lg overflow-hidden">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => switchWorkspace(ws.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left transition-colors"
            >
              <Check className={cn("w-3.5 h-3.5 shrink-0", ws.id === activeWorkspaceId ? "text-primary" : "opacity-0")} />
              {ws.faviconUrl ? (
                <Image src={ws.faviconUrl} alt="" width={14} height={14} className="rounded shrink-0 object-contain" unoptimized />
              ) : (
                <Building2 className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
              )}
              <span className="truncate">{ws.name}</span>
            </button>
          ))}

          {canCreate && (
            <div className="border-t border-border">
              {creating ? (
                <div className="p-2 flex gap-1.5">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") createWorkspace(); if (e.key === "Escape") setCreating(false); }}
                    placeholder="Workspace name"
                    className="flex-1 text-xs px-2 py-1.5 rounded border border-input bg-background outline-none focus:ring-1 ring-primary"
                  />
                  <button onClick={createWorkspace} className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground font-medium">Add</button>
                </div>
              ) : (
                <button
                  onClick={() => setCreating(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New workspace
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
