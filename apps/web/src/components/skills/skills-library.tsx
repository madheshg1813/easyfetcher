"use client";

import { useState } from "react";
import { Search, BarChart2, Bot, Link2, Globe, TrendingUp, FileSearch, Download } from "lucide-react";
import { cn } from "@/lib/utils";

type Provider = "GSC" | "GA4" | "Apify" | "GMB" | "PSI" | "Free";

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  credits: number | null;
  provider: Provider;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  requiresConnection?: string;
}

const SKILLS: Skill[] = [
  // Rankings
  {
    id: "rank-tracker",
    name: "Rank tracker",
    description: "Track keyword positions across Google with daily refreshes.",
    category: "Rankings",
    credits: null,
    provider: "GSC",
    icon: BarChart2,
    requiresConnection: "Search Console connected",
  },
  {
    id: "serp-snapshot",
    name: "SERP snapshot",
    description: "Capture the top 10 results and SERP features for any query.",
    category: "Rankings",
    credits: 3,
    provider: "Apify",
    icon: BarChart2,
  },
  {
    id: "competitor-rank-watch",
    name: "Competitor rank watch",
    description: "Compare your ranks against a list of competitor domains.",
    category: "Rankings",
    credits: 4,
    provider: "Apify",
    icon: BarChart2,
  },
  {
    id: "share-of-voice",
    name: "Share of voice",
    description: "Weighted ranking share across a keyword cluster.",
    category: "Rankings",
    credits: 5,
    provider: "Apify",
    icon: BarChart2,
  },
  // Citations
  {
    id: "ai-citation-tracker",
    name: "AI citation tracker",
    description: "See when ChatGPT, Perplexity, and Claude cite your domain.",
    category: "Citations",
    credits: 8,
    provider: "Apify",
    icon: Bot,
  },
  {
    id: "brand-mention-monitor",
    name: "Brand mention monitor",
    description: "Track unlinked brand mentions across the open web.",
    category: "Citations",
    credits: 4,
    provider: "Apify",
    icon: Bot,
  },
  // Backlinks
  {
    id: "backlink-profile",
    name: "Backlink profile",
    description: "Full backlink and referring domain overview with history.",
    category: "Backlinks",
    credits: 3,
    provider: "Apify",
    icon: Link2,
  },
  {
    id: "dr-checker",
    name: "DR checker",
    description: "Domain rating and authority score for any URL.",
    category: "Backlinks",
    credits: 2,
    provider: "Apify",
    icon: Link2,
  },
  {
    id: "link-gap-analysis",
    name: "Link gap analysis",
    description: "Find domains linking to competitors but not you.",
    category: "Backlinks",
    credits: 5,
    provider: "Apify",
    icon: Link2,
  },
  // Traffic
  {
    id: "traffic-overview",
    name: "Traffic overview",
    description: "Monthly visits, organic/paid split, top countries, and top pages.",
    category: "Traffic",
    credits: 3,
    provider: "Apify",
    icon: Globe,
  },
  {
    id: "ga4-traffic-report",
    name: "GA4 traffic report",
    description: "Sessions, users, bounce rate, and conversion data from GA4.",
    category: "Traffic",
    credits: null,
    provider: "GA4",
    icon: Globe,
  },
  {
    id: "top-pages",
    name: "Top pages report",
    description: "Highest-traffic pages with their impressions and average position.",
    category: "Traffic",
    credits: null,
    provider: "GSC",
    icon: Globe,
  },
  // Content
  {
    id: "content-gap",
    name: "Content gap",
    description: "Keywords competitors rank for that you don't cover yet.",
    category: "Content",
    credits: 4,
    provider: "Apify",
    icon: FileSearch,
  },
  {
    id: "seo-audit",
    name: "SEO audit",
    description: "Crawl any site for technical, on-page, and content issues.",
    category: "Content",
    credits: 5,
    provider: "Apify",
    icon: FileSearch,
  },
  {
    id: "keyword-volume",
    name: "Keyword volume",
    description: "Search volume, CPC, competition, and difficulty for any keyword.",
    category: "Content",
    credits: 2,
    provider: "Apify",
    icon: TrendingUp,
  },
];

const CATEGORIES = [...new Set(SKILLS.map((s) => s.category))];
const PROVIDERS: Provider[] = ["GSC", "GA4", "Apify", "GMB", "PSI"];


export function SkillsLibrary() {
  const [search, setSearch] = useState("");
  const [activeProvider, setActiveProvider] = useState<Provider | "All">("All");

  const filtered = SKILLS.filter((s) => {
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchesProvider = activeProvider === "All" || s.provider === activeProvider;
    return matchesSearch && matchesProvider;
  });

  const visibleCategories = CATEGORIES.filter((cat) => filtered.some((s) => s.category === cat));

  return (
    <div className="space-y-5">
      {/* Search + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search 100+ skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg flex-wrap">
          {(["All", ...PROVIDERS] as const).map((p) => (
            <button
              key={p}
              onClick={() => setActiveProvider(p)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                activeProvider === p
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Skills grouped by category */}
      {visibleCategories.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">No skills match your search.</p>
      ) : (
        visibleCategories.map((category) => {
          const categorySkills = filtered.filter((s) => s.category === category);
          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-foreground">{category}</h2>
                <span className="text-xs text-muted-foreground">{categorySkills.length} skills</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categorySkills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  const Icon = skill.icon;
  const creditLabel = skill.credits == null ? "Free" : `${skill.credits} cr`;
  const creditStyle = skill.credits == null ? "bg-green-500/15 text-green-600 dark:text-green-400" : "bg-primary/10 text-primary";

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" strokeWidth={1.75} />
        </div>
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0", creditStyle)}>
          {creditLabel}
        </span>
      </div>

      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{skill.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{skill.description}</p>
        {skill.requiresConnection && (
          <p className="text-[11px] text-muted-foreground mt-1.5">Requires: {skill.requiresConnection}</p>
        )}
      </div>

      <button className="w-full py-1.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-1.5">
        <Download className="w-3.5 h-3.5" />
        Download skill
      </button>
    </div>
  );
}
