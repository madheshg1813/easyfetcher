"use client";

import { useState } from "react";
import {
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Copy,
  Check,
  Zap,
  BarChart2,
  MapPin,
  Trophy,
  FileText,
  Wrench,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SKILL_TEMPLATES,
  SKILL_CATEGORIES,
  type SkillCategory,
  type SkillTemplate,
} from "@/lib/skills/templates";
import type { Plan } from "@easyfetcher/db";

// ─── Icon mapping for categories ──────────────────────────────────────────────
const CATEGORY_ICONS: Record<SkillCategory, React.ComponentType<{ className?: string }>> = {
  SEO: Zap,
  Analytics: BarChart2,
  "Local Business": MapPin,
  "Competitor Analysis": Trophy,
  Content: FileText,
  "Technical SEO": Wrench,
};

const PLAN_ORDER: Plan[] = ["FREE", "STARTER", "PRO", "AGENCY", "ENTERPRISE"];

const CONNECTOR_LOGOS: Record<string, { logo: string; name: string }> = {
  GSC: { logo: "/connectors/gsc.svg", name: "Search Console" },
  GA4: { logo: "/connectors/google-analytics.svg", name: "Google Analytics 4" },
  GMB: { logo: "/connectors/google-my-business.svg", name: "Google My Business" },
  PAGESPEED: { logo: "/connectors/pagespeed.svg", name: "PageSpeed Insights" },
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface SkillsLibraryProps {
  userPlan: Plan;
  apiKey: string;
}

export function SkillsLibrary({ userPlan, apiKey }: SkillsLibraryProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<SkillCategory | "All">("All");
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [setupOpen, setSetupOpen] = useState(false);

  const userPlanIndex = PLAN_ORDER.indexOf(userPlan);

  const filtered = SKILL_TEMPLATES.filter((s) => {
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = SKILL_CATEGORIES.filter((cat) =>
    filtered.some((s) => s.category === cat.id)
  );

  return (
    <div className="space-y-6">
      {/* Setup instructions */}
      <div className="rounded-xl border border-border bg-card">
        <button
          onClick={() => setSetupOpen(!setupOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            How to use skills in Claude Desktop
          </div>
          {setupOpen ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {setupOpen && (
          <div className="px-4 pb-4 text-sm text-muted-foreground space-y-3 border-t border-border pt-3">
            <p>Skills are markdown instruction files that tell Claude how to use your EasyFetcher data. Here&apos;s how to set them up:</p>
            <ol className="space-y-2 list-decimal list-inside">
              <li>
                <strong>Download a skill</strong> — click the download button on any skill below
              </li>
              <li>
                <strong>Save it</strong> — move the downloaded <code className="text-xs bg-muted px-1 py-0.5 rounded">.md</code> file to{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">~/.claude/skills/</code> (create the folder if it doesn&apos;t exist)
              </li>
              <li>
                <strong>Use it</strong> — open Claude Desktop and type something like{" "}
                <em>&ldquo;Run my weekly SEO health check&rdquo;</em>. Claude will automatically use the skill!
              </li>
            </ol>
            <p className="text-xs text-muted-foreground/70">
              Each downloaded skill is personalized with your MCP API key ({apiKey && apiKey !== "none" ? `${apiKey.slice(0, 8)}...` : "YOUR_API_KEY"}) so Claude can connect to your data automatically.
            </p>
          </div>
        )}
      </div>

      {/* Search + category filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search ${SKILL_TEMPLATES.length} skills...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg flex-wrap">
          <button
            onClick={() => setActiveCategory("All")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              activeCategory === "All"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          {SKILL_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id];
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5",
                  activeCategory === cat.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Skills grouped by category */}
      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          No skills match your search.
        </p>
      ) : (
        categories.map((category) => {
          const categorySkills = filtered.filter((s) => s.category === category.id);
          const CatIcon = CATEGORY_ICONS[category.id];
          return (
            <div key={category.id}>
              <div className="flex items-center gap-2 mb-3">
                <CatIcon className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">{category.label}</h2>
                <span className="text-xs text-muted-foreground">
                  {categorySkills.length} {categorySkills.length === 1 ? "skill" : "skills"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categorySkills.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    isExpanded={expandedSkill === skill.id}
                    onToggle={() =>
                      setExpandedSkill(expandedSkill === skill.id ? null : skill.id)
                    }
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Skill Card ───────────────────────────────────────────────────────────────

function SkillCard({
  skill,
  isExpanded,
  onToggle,
}: {
  skill: SkillTemplate;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const CatIcon = CATEGORY_ICONS[skill.category];

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/skills/download?id=${skill.id}`);
      if (!res.ok) {
        throw new Error("Download failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${skill.id}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyExample = async () => {
    if (skill.examplePrompts.length > 0) {
      await navigator.clipboard.writeText(skill.examplePrompts[0]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-card flex flex-col transition-all border-border hover:border-primary/30",
        isExpanded && "ring-1 ring-primary/20"
      )}
    >
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <CatIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            {/* Connector Logos */}
            {skill.requiredConnections.length > 0 && (
              <div className="flex -space-x-1.5 items-center mr-1">
                {skill.requiredConnections.map((conn) => {
                  const item = CONNECTOR_LOGOS[conn];
                  if (!item) return null;
                  return (
                    <div
                      key={conn}
                      className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center overflow-hidden shadow-sm shrink-0"
                      title={item.name}
                    >
                      <img src={item.logo} alt={item.name} className="w-4 h-4 object-contain" />
                    </div>
                  );
                })}
              </div>
            )}
            {/* Credits badge (Coin Symbol) */}
            {skill.credits !== null && skill.credits > 0 && (
              <div
                className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm shrink-0"
                title="Uses credits"
              >
                <Coins className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </div>

        {/* Name + description */}
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{skill.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
            {skill.description.split(". ")[0]}.
          </p>
        </div>

        {/* Tools used */}
        <div className="flex items-center gap-1 flex-wrap">
          {skill.requiredTools.slice(0, 3).map((tool) => (
            <span
              key={tool}
              className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium"
            >
              {tool}
            </span>
          ))}
          {skill.requiredTools.length > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{skill.requiredTools.length - 3} more
            </span>
          )}
        </div>

        {/* Expand button */}
        <button
          onClick={onToggle}
          className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
        >
          {isExpanded ? (
            <>
              Less <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              Details <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-3 border-t border-border pt-3 space-y-3">
          {/* Connections required */}
          {skill.requiredConnections.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Requires
              </p>
              <div className="flex gap-1">
                {skill.requiredConnections.map((conn) => (
                  <span
                    key={conn}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                  >
                    {conn} connected
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Example prompts */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Try saying
            </p>
            <div className="space-y-1">
              {skill.examplePrompts.map((prompt, i) => (
                <p key={i} className="text-xs text-foreground/80 italic">
                  &ldquo;{prompt}&rdquo;
                </p>
              ))}
            </div>
          </div>

          {/* Copy example button */}
          <button
            onClick={handleCopyExample}
            className="w-full py-1.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy example prompt
              </>
            )}
          </button>
        </div>
      )}

      {/* Download button */}
      <div className="px-4 pb-4 pt-1">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          {downloading ? (
            "Downloading..."
          ) : (
            <>
              <Download className="w-3.5 h-3.5" /> Download skill
            </>
          )}
        </button>
      </div>
    </div>
  );
}
