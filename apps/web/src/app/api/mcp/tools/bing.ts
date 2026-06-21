import { decrypt } from "@easyfetcher/db";
import type { McpTool, TextFn } from "./types";
import type { Connection } from "../route";

const BING_API = "https://ssl.bing.com/webmaster/api.svc/json";

export const bingWebmasterTool: McpTool = {
  name: "bing_webmaster_query",
  description:
    "Get organic search data from Bing Webmaster Tools — top queries or top pages with clicks, impressions, and average position. Requires Bing Webmaster to be connected in your EasyFetcher dashboard.",
  inputSchema: {
    type: "object",
    properties: {
      metric: {
        type: "string",
        enum: ["top_queries", "top_pages"],
        description: "'top_queries' returns keyword-level data. 'top_pages' returns page-level data.",
      },
      site_url: {
        type: "string",
        description:
          "Your site URL exactly as registered in Bing Webmaster Tools, e.g. 'https://example.com/'.",
      },
      days: {
        type: "number",
        description: "Days to look back (default 28, max 90).",
      },
      limit: {
        type: "number",
        description: "Number of rows to return (default 20, max 50).",
      },
    },
    required: ["metric", "site_url"],
  },
};

export async function executeBingWebmasterTool(
  metric: "top_queries" | "top_pages",
  args: Record<string, unknown>,
  conn: Connection,
  text: TextFn
) {
  const apiKey = decrypt(conn.accessToken);
  const siteUrl = args.site_url as string;
  const days = Math.min(Number(args.days ?? 28), 90);
  const limit = Math.min(Number(args.limit ?? 20), 50);

  const endDate = new Date();
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;

  const params = new URLSearchParams({
    siteUrl,
    startDate: fmt(startDate),
    endDate: fmt(endDate),
    apikey: apiKey,
  });

  const endpoint = metric === "top_queries" ? "GetKeywordStats" : "GetPageStats";

  let res: Response;
  try {
    res = await fetch(`${BING_API}/${endpoint}?${params.toString()}`);
  } catch (err) {
    return text(`Bing API network error: ${(err as Error).message}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return text(`Bing API error ${res.status}: ${body.slice(0, 200)}`);
  }

  if (metric === "top_queries") {
    const data = await res.json() as { d?: Array<{ Query?: string; Impressions?: number; Clicks?: number; Position?: number }> };
    const rows = (data.d ?? []).slice(0, limit);
    if (rows.length === 0) return text(`No Bing query data found for ${siteUrl} in the last ${days} days.`);

    const header = `Top ${rows.length} Bing queries for ${siteUrl} (last ${days} days):\n\n`;
    const table = rows.map((r, i) => {
      const ctr = r.Impressions ? ((r.Clicks ?? 0) / r.Impressions * 100).toFixed(1) + "%" : "0%";
      return `${i + 1}. "${r.Query ?? "unknown"}"\n   Clicks: ${r.Clicks ?? 0} | Impressions: ${r.Impressions ?? 0} | CTR: ${ctr} | Position: ${(r.Position ?? 0).toFixed(1)}`;
    }).join("\n\n");
    return text(header + table);
  }

  // top_pages
  const data = await res.json() as { d?: Array<{ Page?: string; Impressions?: number; Clicks?: number; Position?: number }> };
  const rows = (data.d ?? []).slice(0, limit);
  if (rows.length === 0) return text(`No Bing page data found for ${siteUrl} in the last ${days} days.`);

  const header = `Top ${rows.length} Bing pages for ${siteUrl} (last ${days} days):\n\n`;
  const table = rows.map((r, i) => {
    const ctr = r.Impressions ? ((r.Clicks ?? 0) / r.Impressions * 100).toFixed(1) + "%" : "0%";
    return `${i + 1}. ${r.Page ?? "unknown"}\n   Clicks: ${r.Clicks ?? 0} | Impressions: ${r.Impressions ?? 0} | CTR: ${ctr} | Position: ${(r.Position ?? 0).toFixed(1)}`;
  }).join("\n\n");
  return text(header + table);
}
