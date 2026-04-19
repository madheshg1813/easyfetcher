import type { McpTool, Connection, TextFn } from "./types";

export const ga4Tool: McpTool = {
  name: "ga4_query",
  description: "Query Google Analytics 4 data. metric='traffic' for sessions/users overview, 'top_pages' for most visited pages, 'traffic_sources' for channel breakdown (organic/direct/social/paid).",
  inputSchema: {
    type: "object",
    properties: {
      metric: { type: "string", enum: ["traffic", "top_pages", "traffic_sources"], description: "Type of GA4 data to fetch" },
      days: { type: "number", description: "Days to look back (default 28)", default: 28 },
      limit: { type: "number", description: "Number of results for top_pages (default 20)", default: 20 },
      workspace_name: { type: "string", description: "Workspace name. Required if you have multiple workspaces." },
      property_name: { type: "string", description: "GA4 property label. Required if workspace has multiple GA4 properties." },
    },
    required: ["metric"],
  },
};

export async function executeGa4Tool(
  base: "traffic" | "top_pages" | "traffic_sources",
  args: Record<string, unknown>,
  conn: Connection,
  text: TextFn,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  makeOAuth2Client: (a: string, r: string | null, e: Date | null) => any
) {
  const propertyId = conn.siteUrl ?? conn.accountId;
  if (!propertyId) return text("GA4 connected but no property ID found. Try re-authenticating.");

  const authClient = makeOAuth2Client(conn.accessToken, conn.refreshToken, conn.expiresAt);
  const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
  const analyticsData = new BetaAnalyticsDataClient({ authClient });

  const days = typeof args.days === "number" ? args.days : 28;
  const limit = typeof args.limit === "number" ? args.limit : 20;
  const endDate = "today";
  const startDate = `${days}daysAgo`;
  const label = conn.label ?? propertyId;
  const numericId = propertyId.replace("properties/", "");

  if (base === "traffic") {
    const [res] = await analyticsData.runReport({
      property: `properties/${numericId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
      ],
    });
    const row = res.rows?.[0]?.metricValues ?? [];
    const sessions = row[0]?.value ?? "0";
    const users = row[1]?.value ?? "0";
    const pageviews = row[2]?.value ?? "0";
    const bounceRate = row[3]?.value ? (parseFloat(row[3].value) * 100).toFixed(1) + "%" : "0%";
    const avgDuration = row[4]?.value ? Math.round(parseFloat(row[4].value)) + "s" : "0s";
    return text(`GA4 Traffic Overview for ${label} (last ${days} days):\n\nSessions: ${sessions}\nUsers: ${users}\nPageviews: ${pageviews}\nBounce Rate: ${bounceRate}\nAvg Session Duration: ${avgDuration}`);
  }

  if (base === "top_pages") {
    const [res] = await analyticsData.runReport({
      property: `properties/${numericId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "sessions" }, { name: "screenPageViews" }, { name: "bounceRate" }],
      limit,
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    });
    const rows = res.rows ?? [];
    if (rows.length === 0) return text(`No page data for ${label} in the last ${days} days.`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = rows.map((r: any, i: number) => {
      const path = r.dimensionValues?.[0]?.value ?? "/";
      const s = r.metricValues?.[0]?.value ?? "0";
      const pv = r.metricValues?.[1]?.value ?? "0";
      return `${i + 1}. ${path}\n   Sessions: ${s} | Pageviews: ${pv}`;
    }).join("\n\n");
    return text(`Top ${rows.length} pages for ${label} (last ${days} days):\n\n${table}`);
  }

  if (base === "traffic_sources") {
    const [res] = await analyticsData.runReport({
      property: `properties/${numericId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    });
    const rows = res.rows ?? [];
    if (rows.length === 0) return text(`No traffic source data for ${label} in the last ${days} days.`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = rows.map((r: any, i: number) => {
      const channel = r.dimensionValues?.[0]?.value ?? "Unknown";
      const s = r.metricValues?.[0]?.value ?? "0";
      const u = r.metricValues?.[1]?.value ?? "0";
      return `${i + 1}. ${channel}\n   Sessions: ${s} | Users: ${u}`;
    }).join("\n\n");
    return text(`Traffic Sources for ${label} (last ${days} days):\n\n${table}`);
  }

  return text("Unknown GA4 operation");
}
