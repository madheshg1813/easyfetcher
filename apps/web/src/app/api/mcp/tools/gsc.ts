import { google } from "googleapis";
import type { McpTool, Connection, TextFn } from "./types";

export const gscTool: McpTool = {
  name: "gsc_query",
  description: "Query Google Search Console data. metric='top_queries' for top keywords, 'top_pages' for best pages, 'keyword_detail' for pages ranking a specific keyword. Call list_connections first if unsure of workspace_name or site_url.",
  inputSchema: {
    type: "object",
    properties: {
      metric: { type: "string", enum: ["top_queries", "top_pages", "keyword_detail"], description: "Type of GSC data to fetch" },
      days: { type: "number", description: "Days to look back (default 28)", default: 28 },
      limit: { type: "number", description: "Number of results (default 20)", default: 20 },
      keyword: { type: "string", description: "Required for metric='keyword_detail': the keyword to analyze" },
      page: { type: "string", description: "Optional: filter top_queries by a specific page URL" },
      workspace_name: { type: "string", description: "Workspace name. Required if you have multiple workspaces." },
      site_url: { type: "string", description: "GSC site URL or label. Required if workspace has multiple GSC sites." },
    },
    required: ["metric"],
  },
};

export async function executeGscTool(
  base: "top_queries" | "top_pages" | "keyword_detail",
  args: Record<string, unknown>,
  conn: Connection,
  text: TextFn,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  makeOAuth2Client: (a: string, r: string | null, e: Date | null) => any
) {
  if (!conn.siteUrl) return text("GSC connected but no site URL found. Try re-authenticating.");

  const auth = makeOAuth2Client(conn.accessToken, conn.refreshToken, conn.expiresAt);
  const sc = google.webmasters({ version: "v3", auth });

  const days = typeof args.days === "number" ? args.days : 28;
  const limit = typeof args.limit === "number" ? args.limit : 20;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  if (base === "top_queries") {
    const page = typeof args.page === "string" ? args.page : undefined;
    const res = await sc.searchanalytics.query({
      siteUrl: conn.siteUrl,
      requestBody: {
        startDate: fmt(startDate),
        endDate: fmt(endDate),
        dimensions: ["query"],
        rowLimit: limit,
        ...(page && { dimensionFilterGroups: [{ filters: [{ dimension: "page", operator: "equals", expression: page }] }] }),
      },
    });
    const rows = res.data.rows ?? [];
    if (rows.length === 0) return text(`No search data for ${conn.siteUrl} in the last ${days} days.`);
    const table = rows.map((r, i) => {
      const query = r.keys?.[0] ?? "unknown";
      return `${i + 1}. "${query}"\n   Clicks: ${r.clicks?.toFixed(0) ?? 0} | Impressions: ${r.impressions?.toFixed(0) ?? 0} | CTR: ${r.ctr != null ? (r.ctr * 100).toFixed(1) + "%" : "0%"} | Position: ${r.position?.toFixed(1) ?? 0}`;
    }).join("\n\n");
    return text(`Top ${rows.length} queries for ${conn.label ?? conn.siteUrl} (last ${days} days):\n\n${table}`);
  }

  if (base === "top_pages") {
    const res = await sc.searchanalytics.query({
      siteUrl: conn.siteUrl,
      requestBody: { startDate: fmt(startDate), endDate: fmt(endDate), dimensions: ["page"], rowLimit: limit },
    });
    const rows = res.data.rows ?? [];
    if (rows.length === 0) return text(`No page data for ${conn.siteUrl} in the last ${days} days.`);
    const table = rows.map((r, i) => {
      const url = r.keys?.[0] ?? "unknown";
      return `${i + 1}. ${url}\n   Clicks: ${r.clicks?.toFixed(0) ?? 0} | Impressions: ${r.impressions?.toFixed(0) ?? 0} | CTR: ${r.ctr != null ? (r.ctr * 100).toFixed(1) + "%" : "0%"} | Position: ${r.position?.toFixed(1) ?? 0}`;
    }).join("\n\n");
    return text(`Top ${rows.length} pages for ${conn.label ?? conn.siteUrl} (last ${days} days):\n\n${table}`);
  }

  if (base === "keyword_detail") {
    const keyword = typeof args.keyword === "string" ? args.keyword : "";
    if (!keyword) return text("keyword argument is required");
    const res = await sc.searchanalytics.query({
      siteUrl: conn.siteUrl,
      requestBody: {
        startDate: fmt(startDate),
        endDate: fmt(endDate),
        dimensions: ["page"],
        dimensionFilterGroups: [{ filters: [{ dimension: "query", operator: "equals", expression: keyword }] }],
        rowLimit: 10,
      },
    });
    const rows = res.data.rows ?? [];
    if (rows.length === 0) return text(`No data found for keyword "${keyword}" on ${conn.label ?? conn.siteUrl} in the last ${days} days.`);
    const table = rows.map((r, i) => {
      const url = r.keys?.[0] ?? "unknown";
      return `${i + 1}. ${url}\n   Clicks: ${r.clicks?.toFixed(0) ?? 0} | Impressions: ${r.impressions?.toFixed(0) ?? 0} | Position: ${r.position?.toFixed(1) ?? 0}`;
    }).join("\n\n");
    return text(`Pages ranking for "${keyword}" on ${conn.label ?? conn.siteUrl} (last ${days} days):\n\n${table}`);
  }

  return text("Unknown GSC operation");
}
