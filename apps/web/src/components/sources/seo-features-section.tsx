import { BarChart2, Globe, Search, TrendingUp, Link2, Bot } from "lucide-react";

const SEO_FEATURES = [
  {
    icon: BarChart2,
    name: "Rank Tracker",
    description: "Check live Google search positions for any domain and keywords across 8 countries. No setup required.",
    example: '"Check rankings for amitservices.in for \'laptop repair\' in India"',
    live: true,
  },
  {
    icon: Link2,
    name: "Backlink Checker",
    description: "Get total backlinks, referring domains, domain authority, and top referring sites for any domain.",
    example: '"Check backlinks for amitservices.in"',
    live: true,
  },
  {
    icon: Bot,
    name: "AI Overview & Citations",
    description: "See if your domain appears in Google AI Overviews and AI-generated answers for specific keywords.",
    example: '"Is amitservices.in cited in AI Overviews for \'laptop repair chennai\'?"',
    live: true,
  },
  {
    icon: Globe,
    name: "Traffic Data",
    description: "Get estimated monthly visits, organic vs paid traffic breakdown, top countries, and top pages.",
    example: '"What is the traffic for amitservices.in?"',
    live: true,
  },
  {
    icon: Search,
    name: "Keyword Volume",
    description: "Get search volume, CPC, competition score, and keyword difficulty for any keywords.",
    example: '"What is the search volume for \'laptop repair chennai\'?"',
    live: true,
  },
  {
    icon: TrendingUp,
    name: "Keyword List Tracking",
    description: "Save keyword lists per domain and run scheduled rank checks. Track position history over time.",
    example: '"Show me my saved keyword rankings"',
    live: true,
  },
];

export function SeoFeaturesSection() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">SEO Tools</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Built-in SEO features available directly through Claude — no extra connections needed.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SEO_FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.name}
              className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground leading-tight">{feature.name}</h3>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-green-500/15 text-green-600 dark:text-green-400 shrink-0">
                  Live
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>

              <div className="rounded-md bg-muted/60 px-3 py-2 mt-auto">
                <p className="text-[10px] text-muted-foreground mb-0.5 font-medium">Try in Claude</p>
                <p className="text-[11px] text-foreground font-mono leading-relaxed">{feature.example}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
