const APIFY_TOKEN = process.env.APIFY_API_KEY;
const ACTOR_ID = "radeance~seranking-scraper";

// Country codes must be lowercase ISO for SE Ranking actor
const LOCATION_TO_COUNTRY: Record<string, string> = {
  "United States": "us",
  "United Kingdom": "gb",
  "India": "in",
  "Canada": "ca",
  "Australia": "au",
  "Germany": "de",
  "France": "fr",
  "Singapore": "sg",
  "Worldwide": "worldwide",
};

export function toCountryCode(country: string): string {
  return LOCATION_TO_COUNTRY[country] ?? country.toLowerCase();
}

async function runActor(input: Record<string, unknown>): Promise<unknown[]> {
  if (!APIFY_TOKEN) throw new Error("APIFY_API_KEY not set");

  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
  if (!runRes.ok) throw new Error(`SE Ranking actor start failed: ${await runRes.text()}`);

  const { data: run } = await runRes.json();
  const runId: string = run.id;

  // Poll up to 5 minutes
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const { data: status } = await (
      await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`)
    ).json();
    if (status.status === "SUCCEEDED") break;
    if (status.status === "FAILED" || status.status === "ABORTED")
      throw new Error(`SE Ranking actor ${status.status}`);
  }

  const items = await (
    await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}`)
  ).json();

  return Array.isArray(items) ? items : [];
}

function findByType(items: unknown[], type: string): Record<string, unknown> {
  const found = (items as Record<string, unknown>[]).find((i) => i.type === type);
  return found ?? {};
}

// ─── Backlinks ────────────────────────────────────────────────────────────────
export interface BacklinkResult {
  domain: string;
  totalBacklinks: number | null;
  referringDomains: number | null;
  domainAuthority: number | null;
  pageAuthority: number | null;
  backlinksHistory: { date: string; backlinks: number; new: number; lost: number }[];
}

export async function checkBacklinks(domain: string, country = "in"): Promise<BacklinkResult> {
  const items = await runActor({ urls: [domain], country, includeBacklinks: true });

  const overview = findByType(items, "domain_overview");
  const backlinks = findByType(items, "backlinks");
  const history = (backlinks.backlinks_history ?? []) as { date: string; backlinks: number; new_backlinks: number; lost_backlinks: number }[];

  return {
    domain,
    totalBacklinks: (overview.backlinks as number | null) ?? null,
    referringDomains: (overview.referal_domains as number | null) ?? null,
    domainAuthority: (overview.domain_authority_rank as number | null) ?? null,
    pageAuthority: (overview.page_authority_rank as number | null) ?? null,
    backlinksHistory: history.slice(0, 6).map((h) => ({
      date: h.date.split("T")[0],
      backlinks: h.backlinks,
      new: h.new_backlinks,
      lost: h.lost_backlinks,
    })),
  };
}

// ─── AI Overviews & Citations ─────────────────────────────────────────────────
export interface AiOverviewResult {
  domain: string;
  aiCitations: number | null;
  aimodeCitations: number | null;
  chatgptCitations: number | null;
  perplexityCitations: number | null;
  geminiCitations: number | null;
  totalAiOverviewTraffic: number | null;
}

export async function checkAiOverviews(domain: string, country = "in"): Promise<AiOverviewResult> {
  const items = await runActor({ urls: [domain], country, includeDomainOverview: true });
  const overview = findByType(items, "domain_overview");

  return {
    domain,
    aiCitations: (overview.ai_citations as number | null) ?? null,
    aimodeCitations: (overview.aimode_citations as number | null) ?? null,
    chatgptCitations: (overview.chatgpt_citations as number | null) ?? null,
    perplexityCitations: (overview.perplexity_citations as number | null) ?? null,
    geminiCitations: (overview.gemini_citations as number | null) ?? null,
    totalAiOverviewTraffic: (overview.total_ai_overview_traffic as number | null) ?? null,
  };
}

// ─── Traffic Data ─────────────────────────────────────────────────────────────
export interface TrafficResult {
  domain: string;
  organicTraffic: number | null;
  paidTraffic: number | null;
  organicKeywords: number | null;
  topCountries: { country: string; traffic: number; share: number }[];
}

export async function checkTrafficData(domain: string, country = "worldwide"): Promise<TrafficResult> {
  const items = await runActor({ urls: [domain], country, includeTraffic: true });
  const overview = findByType(items, "domain_overview");
  const trafficItem = findByType(items, "traffic");
  const topCountries = (trafficItem.top_countries_organic ?? []) as { country: string; traffic: number; traffic_share: number }[];

  return {
    domain,
    organicTraffic: (overview.organic_traffic as number | null) ?? null,
    paidTraffic: (overview.paid_traffic as number | null) ?? null,
    organicKeywords: (overview.organic_keywords as number | null) ?? null,
    topCountries: topCountries.slice(0, 5).map((c) => ({
      country: c.country,
      traffic: c.traffic,
      share: Math.round(c.traffic_share * 100),
    })),
  };
}

// ─── Keyword Volumes ──────────────────────────────────────────────────────────
export interface KeywordVolumeResult {
  keyword: string;
  searchVolume: number | null;
  cpc: number | null;
  competition: number | null;
  difficulty: number | null;
  intent: string | null;
}

export async function checkKeywordVolumes(keywords: string[], country = "in"): Promise<KeywordVolumeResult[]> {
  const results: KeywordVolumeResult[] = [];

  for (const keyword of keywords) {
    const items = await runActor({
      urls: [],
      keyword,
      country,
      includeKeywordOverview: true,
    });

    // Keyword overview data format TBD — extract best available fields
    const kw = (items[0] ?? {}) as Record<string, unknown>;
    const overview = (kw.keyword_overview ?? kw) as Record<string, unknown>;

    results.push({
      keyword,
      searchVolume: (overview.search_volume ?? overview.volume ?? null) as number | null,
      cpc: (overview.cpc ?? overview.cost_per_click ?? null) as number | null,
      competition: (overview.competition ?? null) as number | null,
      difficulty: (overview.difficulty ?? overview.keyword_difficulty ?? null) as number | null,
      intent: (overview.intent ?? overview.search_intent ?? null) as string | null,
    });
  }

  return results;
}
