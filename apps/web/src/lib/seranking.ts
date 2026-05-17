const APIFY_TOKEN = process.env.APIFY_API_KEY;
const ACTOR_ID = "radeance~seranking-scraper";

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

// ─── Backlinks ────────────────────────────────────────────────────────────────
export interface BacklinkResult {
  domain: string;
  totalBacklinks: number | null;
  referringDomains: number | null;
  domainAuthority: number | null;
  topReferrers: { domain: string; backlinks: number }[];
}

export async function checkBacklinks(domain: string, country = "US"): Promise<BacklinkResult> {
  const items = await runActor({
    urls: [domain],
    country,
    includeBacklinks: true,
    includeDomainOverview: false,
    includeTraffic: false,
    includeKeywordOverview: false,
  });

  const data = (items[0] ?? {}) as Record<string, unknown>;
  const backlinks = (data.backlinks ?? data.backlinkData ?? {}) as Record<string, unknown>;
  const refs = (backlinks.topReferrers ?? backlinks.referrers ?? []) as { domain: string; backlinks: number }[];

  return {
    domain,
    totalBacklinks: (backlinks.total ?? backlinks.totalBacklinks ?? null) as number | null,
    referringDomains: (backlinks.referringDomains ?? backlinks.domains ?? null) as number | null,
    domainAuthority: (data.domainAuthority ?? data.da ?? null) as number | null,
    topReferrers: refs.slice(0, 10),
  };
}

// ─── AI Overviews & Citations ─────────────────────────────────────────────────
export interface AiOverviewResult {
  domain: string;
  keyword: string;
  appearsInAiOverview: boolean | null;
  aiTrafficEstimate: number | null;
  citations: { keyword: string; url: string }[];
}

export async function checkAiOverviews(domain: string, keyword: string, country = "US"): Promise<AiOverviewResult> {
  const items = await runActor({
    urls: [domain],
    keyword,
    country,
    includeDomainOverview: true,
    includeTraffic: false,
    includeBacklinks: false,
    includeKeywordOverview: false,
  });

  const data = (items[0] ?? {}) as Record<string, unknown>;
  const overview = (data.domainOverview ?? data.aiOverview ?? data) as Record<string, unknown>;
  const citations = (overview.citations ?? overview.aiCitations ?? []) as { keyword: string; url: string }[];

  return {
    domain,
    keyword,
    appearsInAiOverview: (overview.appearsInAi ?? overview.inAiOverview ?? null) as boolean | null,
    aiTrafficEstimate: (overview.aiTraffic ?? overview.estimatedAiTraffic ?? null) as number | null,
    citations: citations.slice(0, 10),
  };
}

// ─── Traffic Data ─────────────────────────────────────────────────────────────
export interface TrafficResult {
  domain: string;
  monthlyVisits: number | null;
  organicTraffic: number | null;
  paidTraffic: number | null;
  topCountries: { country: string; share: number }[];
  topPages: { url: string; traffic: number }[];
}

export async function checkTrafficData(domain: string, country = "US"): Promise<TrafficResult> {
  const items = await runActor({
    urls: [domain],
    country,
    includeTraffic: true,
    includeDomainOverview: false,
    includeBacklinks: false,
    includeKeywordOverview: false,
  });

  const data = (items[0] ?? {}) as Record<string, unknown>;
  const traffic = (data.traffic ?? data.trafficData ?? data) as Record<string, unknown>;
  const topCountries = (traffic.topCountries ?? traffic.countries ?? []) as { country: string; share: number }[];
  const topPages = (traffic.topPages ?? traffic.pages ?? []) as { url: string; traffic: number }[];

  return {
    domain,
    monthlyVisits: (traffic.monthlyVisits ?? traffic.totalVisits ?? null) as number | null,
    organicTraffic: (traffic.organic ?? traffic.organicTraffic ?? null) as number | null,
    paidTraffic: (traffic.paid ?? traffic.paidTraffic ?? null) as number | null,
    topCountries: topCountries.slice(0, 5),
    topPages: topPages.slice(0, 10),
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

export async function checkKeywordVolumes(keywords: string[], country = "US"): Promise<KeywordVolumeResult[]> {
  const results: KeywordVolumeResult[] = [];

  for (const keyword of keywords) {
    const items = await runActor({
      urls: [],
      keyword,
      country,
      includeKeywordOverview: true,
      includeDomainOverview: false,
      includeTraffic: false,
      includeBacklinks: false,
    });

    const data = (items[0] ?? {}) as Record<string, unknown>;
    const kw = (data.keywordOverview ?? data.keyword ?? data) as Record<string, unknown>;

    results.push({
      keyword,
      searchVolume: (kw.searchVolume ?? kw.volume ?? null) as number | null,
      cpc: (kw.cpc ?? kw.costPerClick ?? null) as number | null,
      competition: (kw.competition ?? kw.competitionLevel ?? null) as number | null,
      difficulty: (kw.difficulty ?? kw.keywordDifficulty ?? null) as number | null,
      intent: (kw.intent ?? kw.searchIntent ?? null) as string | null,
    });
  }

  return results;
}
