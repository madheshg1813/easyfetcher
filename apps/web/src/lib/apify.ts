const APIFY_TOKEN = process.env.APIFY_API_KEY;
const ACTOR_ID = "scraperlink~google-search-results-serp-scraper";
const MAX_PAGES = 5; // 5 pages = 50 results max

export interface RankResult {
  keyword: string;
  rank: number | null;      // null = not ranked in top 50
  rankUrl: string | null;
  rankTitle: string | null;
  pagesChecked: number;
  topCompetitors: { domain: string; rank: number; title: string }[];
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Maps human-readable location to Apify countryCode
const LOCATION_TO_COUNTRY: Record<string, string> = {
  "United States": "US",
  "United Kingdom": "GB",
  "India": "IN",
  "Canada": "CA",
  "Australia": "AU",
  "Germany": "DE",
  "France": "FR",
  "Singapore": "SG",
};

export async function checkKeywordRanks(
  domain: string,
  keywords: string[],
  location: string = "United States"
): Promise<RankResult[]> {
  if (!APIFY_TOKEN) throw new Error("APIFY_API_KEY not set");

  const countryCode = LOCATION_TO_COUNTRY[location] ?? "US";
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];

  // Start Apify actor run
  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        searchKeywords: keywords.join("\n"),
        maxPagesPerQuery: MAX_PAGES,
        countryCode,
        includeMergedResults: true,
      }),
    }
  );

  if (!runRes.ok) {
    const err = await runRes.text();
    throw new Error(`Apify run failed: ${err}`);
  }

  const { data: run } = await runRes.json();
  const runId: string = run.id;

  // Poll until finished (max 3 minutes)
  let attempts = 0;
  while (attempts < 36) {
    await new Promise((r) => setTimeout(r, 5000));
    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
    );
    const { data: status } = await statusRes.json();
    if (status.status === "SUCCEEDED") break;
    if (status.status === "FAILED" || status.status === "ABORTED") {
      throw new Error(`Apify run ${status.status}`);
    }
    attempts++;
  }

  // Fetch dataset items
  const dataRes = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}`
  );
  const items: any[] = await dataRes.json();

  // Build result per keyword
  const results: RankResult[] = keywords.map((keyword) => {
    const pages = items.filter(
      (item) => item.search_term?.toLowerCase() === keyword.toLowerCase()
    );

    const allResults: any[] = pages.flatMap((p) => p.results ?? []);
    const pagesChecked = pages.length || 1;

    const targetIdx = allResults.findIndex((r) =>
      extractDomain(r.url ?? "").includes(cleanDomain)
    );

    const topCompetitors = allResults.slice(0, 5).map((r) => ({
      domain: extractDomain(r.url ?? ""),
      rank: r.position,
      title: r.title ?? "",
    }));

    if (targetIdx === -1) {
      return { keyword, rank: null, rankUrl: null, rankTitle: null, pagesChecked, topCompetitors };
    }

    const match = allResults[targetIdx];
    return {
      keyword,
      rank: match.position,
      rankUrl: match.url ?? null,
      rankTitle: match.title ?? null,
      pagesChecked,
      topCompetitors: topCompetitors.filter((c) => !c.domain.includes(cleanDomain)),
    };
  });

  return results;
}
