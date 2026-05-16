const APIFY_TOKEN = process.env.APIFY_API_KEY;
const ACTOR_ID = "scraperlink~google-search-results-serp-scraper";
const MAX_RESULTS = 50; // 50 results = 5 pages, positions 1–50

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


async function runSingleKeyword(
  keyword: string,
  country: string,
  gl: string
): Promise<{ pages: { page: number; results: any[] }[]; mergedResults: any[] }> {
  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keyword,
        country,
        gl,
        limit: "all",
        include_merged: true,
      }),
    }
  );

  if (!runRes.ok) throw new Error(`Apify start failed: ${await runRes.text()}`);

  const { data: run } = await runRes.json();
  const runId: string = run.id;

  // Poll until finished (max 3 minutes)
  for (let i = 0; i < 36; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const { data: status } = await (
      await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`)
    ).json();
    if (status.status === "SUCCEEDED") break;
    if (status.status === "FAILED" || status.status === "ABORTED") {
      throw new Error(`Apify run ${status.status}`);
    }
  }

  const items: any[] = await (
    await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}`)
  ).json();

  const pages = items
    .filter((item) => item.page_number !== "all")
    .map((item) => ({ page: Number(item.page_number), results: item.results ?? [] }));

  // Use merged results for reliable absolute positioning
  const mergedItem = items.find((item) => item.page_number === "all");
  const mergedResults: any[] = mergedItem?.results ?? pages.flatMap((p) => p.results);

  return { pages, mergedResults };
}

export async function checkKeywordRanks(
  domain: string,
  keywords: string[],
  location: string = "United States"
): Promise<RankResult[]> {
  if (!APIFY_TOKEN) throw new Error("APIFY_API_KEY not set");

  const country = LOCATION_TO_COUNTRY[location] ?? "US";
  const gl = country; // gl uses same uppercase country code as country
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  console.log(`[apify] checking ${keywords.length} keywords for ${cleanDomain} in ${country} (gl=${gl})`);

  // Run sequentially to avoid hammering the API
  const results: RankResult[] = [];

  for (const keyword of keywords) {
    try {
      const { pages, mergedResults } = await runSingleKeyword(keyword, country, gl);
      console.log(`[apify] "${keyword}" → ${mergedResults.length} merged results`);

      // Merged results have accurate absolute positions (1–50)
      const targetIdx = mergedResults.findIndex((r) =>
        extractDomain(r.url ?? "").includes(cleanDomain)
      );
      console.log(`[apify] "${keyword}" domain match idx: ${targetIdx} (looking for "${cleanDomain}")`);

      const topCompetitors = mergedResults.slice(0, 5).map((r) => ({
        domain: extractDomain(r.url ?? ""),
        rank: r.position,
        title: r.title ?? "",
      }));

      if (targetIdx === -1) {
        results.push({
          keyword, rank: null, rankUrl: null, rankTitle: null,
          pagesChecked: pages.length,
          topCompetitors,
        });
      } else {
        const match = mergedResults[targetIdx];
        results.push({
          keyword,
          rank: match.position,
          rankUrl: match.url ?? null,
          rankTitle: match.title ?? null,
          pagesChecked: pages.length,
          topCompetitors: topCompetitors.filter((c) => !c.domain.includes(cleanDomain)),
        });
      }
    } catch (err) {
      console.error(`[apify] keyword "${keyword}" failed:`, err);
      results.push({
        keyword, rank: null, rankUrl: null, rankTitle: null,
        pagesChecked: 0, topCompetitors: [],
      });
    }
  }

  return results;
}
