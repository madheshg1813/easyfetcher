import { Search } from "lucide-react";

export const metadata = { title: "Rank Tracker — EasyFetcher" };

export default function RankTrackerPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rank Tracker</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track keyword positions across Google Search. Up to 50 positions checked per keyword — anything beyond is reported as Not Ranked.
        </p>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
          <Search className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground">No keyword lists yet</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Add your domain and keywords to start tracking positions. Ask Claude to check your rankings anytime.
          </p>
        </div>
        <button
          disabled
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium opacity-60 cursor-not-allowed"
        >
          Add Keywords — Coming Soon
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Note: Positions beyond 50 are reported as <strong>Not Ranked</strong>. Each keyword check costs 1–5 credits depending on how many SERP pages are scanned.
      </p>
    </div>
  );
}
