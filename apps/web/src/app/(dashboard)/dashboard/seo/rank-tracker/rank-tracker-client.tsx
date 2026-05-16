"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, RefreshCw, Search, ChevronDown, ChevronUp, Globe, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const LOCATIONS = [
  "United States", "United Kingdom", "India", "Canada",
  "Australia", "Germany", "France", "Singapore",
];

const SCHEDULES = [
  { value: "MANUAL", label: "Manual only" },
  { value: "WEEKLY", label: "Weekly (every 7 days)" },
  { value: "BIWEEKLY", label: "Bi-weekly (every 14 days)" },
  { value: "MONTHLY", label: "Monthly (every 30 days)" },
];

interface KeywordRank {
  keyword: string;
  rank: number | null;
  rankUrl: string | null;
  rankTitle: string | null;
  checkedAt: string | null;
}

interface KeywordList {
  id: string;
  name: string;
  domain: string;
  location: string;
  device: string;
  schedule: string;
  lastCheckedAt: string | null;
  nextCheckAt: string | null;
  createdAt: string;
  keywordRanks: KeywordRank[];
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function RankTrackerClient() {
  const [lists, setLists] = useState<KeywordList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "", domain: "", keywordsRaw: "",
    location: "United States", device: "desktop", schedule: "MANUAL",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function fetchLists() {
    setLoading(true);
    try {
      const res = await fetch("/api/seo/keyword-lists");
      const data = await res.json();
      setLists(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchLists(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const keywords = form.keywordsRaw
      .split("\n")
      .map((k) => k.trim())
      .filter(Boolean);
    if (keywords.length === 0) { setFormError("Add at least one keyword."); return; }
    if (keywords.length > 500) { setFormError("Maximum 500 keywords per list."); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/seo/keyword-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, keywords }),
      });
      if (!res.ok) { setFormError("Failed to save. Try again."); return; }
      setForm({ name: "", domain: "", keywordsRaw: "", location: "United States", device: "desktop", schedule: "MANUAL" });
      setShowForm(false);
      await fetchLists();
    } finally {
      setSaving(false);
    }
  }

  async function handleCheckNow(listId: string) {
    setCheckingId(listId);
    try {
      const res = await fetch("/api/seo/rank-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywordListId: listId }),
      });
      const { jobId } = await res.json();

      // Poll job until done
      let done = false;
      while (!done) {
        await new Promise((r) => setTimeout(r, 5000));
        const statusRes = await fetch(`/api/seo/jobs/${jobId}`);
        const { status } = await statusRes.json();
        if (status === "DONE" || status === "ERROR") done = true;
      }
      await fetchLists();
    } finally {
      setCheckingId(null);
    }
  }

  async function handleDelete(listId: string) {
    if (!confirm("Delete this keyword list and all its rank history?")) return;
    setDeletingId(listId);
    try {
      await fetch(`/api/seo/keyword-lists/${listId}`, { method: "DELETE" });
      await fetchLists();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rank Tracker</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage keyword lists. Ask Claude to check rankings or set a schedule for automatic checks.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Keywords
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground mb-4">New Keyword List</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">List Name</Label>
                <Input
                  id="name" placeholder="e.g. Priority Keywords"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain" placeholder="e.g. easyfetcher.com"
                  value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="keywords">Keywords <span className="text-muted-foreground font-normal">(one per line, max 500)</span></Label>
              <Textarea
                id="keywords" placeholder={"keyword rank tracker\nai seo tool\nbest seo software"}
                rows={6} value={form.keywordsRaw}
                onChange={(e) => setForm({ ...form, keywordsRaw: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {form.keywordsRaw.split("\n").filter((k) => k.trim()).length} keywords
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Select
                  id="location" value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                >
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="device">Device</Label>
                <Select
                  id="device" value={form.device}
                  onChange={(e) => setForm({ ...form, device: e.target.value })}
                >
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="schedule">Auto-check Schedule</Label>
                <Select
                  id="schedule" value={form.schedule}
                  onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                >
                  {SCHEDULES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </div>
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save List"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Keyword lists */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Loading…</div>
      ) : lists.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
            <Search className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No keyword lists yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Add your first list above, then ask Claude to check rankings or wait for your scheduled check.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Note: Positions beyond 50 are reported as <strong>Not Ranked</strong>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {lists.map((list) => (
            <div key={list.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* List header */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setExpandedId(expandedId === list.id ? null : list.id)}
                    className="flex items-center gap-2 text-left min-w-0"
                  >
                    {expandedId === list.id
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{list.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{list.domain}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-1.5 ml-2 shrink-0">
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Globe className="w-3 h-3" />{list.location}
                    </Badge>
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Calendar className="w-3 h-3" />
                      {SCHEDULES.find((s) => s.value === list.schedule)?.label ?? list.schedule}
                    </Badge>
                    {list.lastCheckedAt && (
                      <span className="text-xs text-muted-foreground">
                        Checked {timeAgo(list.lastCheckedAt)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <Button
                    size="sm" variant="outline"
                    onClick={() => handleCheckNow(list.id)}
                    disabled={checkingId === list.id}
                    className="gap-1.5"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", checkingId === list.id && "animate-spin")} />
                    {checkingId === list.id ? "Checking…" : "Check Now"}
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    onClick={() => handleDelete(list.id)}
                    disabled={deletingId === list.id}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Keyword rank table */}
              {expandedId === list.id && (
                <div className="border-t border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground w-[40%]">Keyword</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-20">Rank</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Ranking URL</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-28">Checked</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {list.keywordRanks.map((kw) => (
                        <tr key={kw.keyword} className="hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-3 font-medium text-foreground">{kw.keyword}</td>
                          <td className="px-4 py-3">
                            {kw.rank === null ? (
                              <span className="text-muted-foreground text-xs">Not Ranked</span>
                            ) : (
                              <span className={cn(
                                "font-semibold",
                                kw.rank <= 3 ? "text-green-600 dark:text-green-400" :
                                kw.rank <= 10 ? "text-primary" : "text-muted-foreground"
                              )}>
                                #{kw.rank}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            {kw.rankUrl ? (
                              <span className="text-xs text-muted-foreground truncate block" title={kw.rankUrl}>
                                {kw.rankUrl.replace(/^https?:\/\//, "")}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {timeAgo(kw.checkedAt) ?? "Never"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {list.keywordRanks.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-6">
                      No rank data yet — click <strong>Check Now</strong> or ask Claude to check rankings.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
