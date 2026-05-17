const APIFY_TOKEN = process.env.APIFY_API_KEY;
const ACTOR_ID = "scraperlink~google-search-results-serp-scraper";

export interface RankResult {
  keyword: string;
  rank: number | null;
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
): Promise<{ pages: { page: number; results: unknown[] }[]; mergedResults: unknown[] }> {
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

  const items: unknown[] = await (
    await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}`)
  ).json();

  const typedItems = items as { page_number: string | number; results?: unknown[] }[];
  const pages = typedItems
    .filter((item) => item.page_number !== "all")
    .map((item) => ({ page: Number(item.page_number), results: item.results ?? [] }));

  const mergedItem = typedItems.find((item) => item.page_number === "all");
  const mergedResults: unknown[] = mergedItem?.results ?? pages.flatMap((p) => p.results);

  return { pages, mergedResults };
}

export async function checkKeywordRanks(
  domain: string,
  keywords: string[],
  location: string = "United States"
): Promise<RankResult[]> {
  if (!APIFY_TOKEN) throw new Error("APIFY_API_KEY not set");

  const country = LOCATION_TO_COUNTRY[location] ?? "US";
  const gl = country;
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];

  const results: RankResult[] = [];

  for (const keyword of keywords) {
    try {
      const { pages, mergedResults } = await runSingleKeyword(keyword, country, gl);
      const typed = mergedResults as { url?: string; position?: number; title?: string }[];

      const targetIdx = typed.findIndex((r) =>
        extractDomain(r.url ?? "").includes(cleanDomain)
      );

      const topCompetitors = typed.slice(0, 5).map((r) => ({
        domain: extractDomain(r.url ?? ""),
        rank: r.position ?? 0,
        title: r.title ?? "",
      }));

      if (targetIdx === -1) {
        results.push({
          keyword, rank: null, rankUrl: null, rankTitle: null,
          pagesChecked: pages.length,
          topCompetitors,
        });
      } else {
        const match = typed[targetIdx];
        results.push({
          keyword,
          rank: match.position ?? null,
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
