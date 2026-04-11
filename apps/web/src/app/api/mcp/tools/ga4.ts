import type { McpTool, Connection, TextFn } from "./types";

export const ga4Tool: McpTool = {
  name: "ga4_query",
  description: "Query Google Analytics 4 data. metric='traffic' for sessions/users overview, 'top_pages' for most visited pages, 'traffic_sources' for channel breakdown, 'devices' for device breakdown, 'geo' for top countries.",
  inputSchema: {
    type: "object",
    properties: {
      metric: {
        type: "string",
        enum: ["traffic", "top_pages", "traffic_sources", "devices", "geo"],
        description: "Type of GA4 data to fetch",
      },
      days: { type: "number", description: "Days to look back (default 28)", default: 28 },
      limit: { type: "number", description: "Number of results for top_pages/geo (default 20)", default: 20 },
      workspace_name: { type: "string", description: "Workspace name. Required if you have multiple workspaces." },
      property_name: { type: "string", description: "GA4 property label. Required if workspace has multiple GA4 properties." },
    },
    required: ["metric"],
  },
};

export async function executeGa4Tool(
  base: "traffic" | "top_pages" | "traffic_sources" | "devices" | "geo",
  args: Record<string, unknown>,
  conn: Connection,
  text: TextFn,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  makeOAuth2Client: (a: string, r: string | null, e: Date | null) => any
) {
  const propertyId = conn.siteUrl ?? conn.accountId;
  if (!propertyId) return text("GA4 connected but no property ID found. Try re-authenticating.");

  let authClient: ReturnType<typeof makeOAuth2Client>;
  try {
    authClient = makeOAuth2Client(conn.accessToken, conn.refreshToken, conn.expiresAt);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[ga4] token decrypt failed:", msg);
    return text(`Token decryption failed: ${msg}. Try reconnecting GA4 from your EasyFetcher dashboard.`);
  }

  const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
  const analyticsData = new BetaAnalyticsDataClient({ authClient });

  const days = typeof args.days === "number" ? args.days : 28;
  const limit = typeof args.limit === "number" ? args.limit : 20;
  const startDate = `${days}daysAgo`;
  const endDate = "today";
  const label = conn.label ?? propertyId;
  const numericId = propertyId.replace("properties/", "");
  const property = `properties/${numericId}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function ga4Report(request: Record<string, any>) {
    try {
      return await analyticsData.runReport({ property, ...request });
    } catch (err: unknown) {
      const gErr = err as { code?: number; message?: string; details?: string };
      const msg = gErr?.message ?? String(err);
      console.error(`[ga4] API error for ${property}:`, msg);
      if (gErr?.code === 403) {
        throw new Error(`Google account does not have access to GA4 property ${label}. Re-connect GA4 from your EasyFetcher dashboard.`);
      }
      if (gErr?.code === 401) {
        throw new Error(`GA4 token expired or revoked. Re-connect GA4 from your EasyFetcher dashboard.`);
      }
      throw new Error(msg);
    }
  }

  if (base === "traffic") {
    const [res] = await ga4Report({
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "newUsers" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
        { name: "engagementRate" },
      ],
    });
    const row = res.rows?.[0]?.metricValues ?? [];
    const sessions = row[0]?.value ?? "0";
    const users = row[1]?.value ?? "0";
    const newUsers = row[2]?.value ?? "0";
    const pageviews = row[3]?.value ?? "0";
    const bounceRate = row[4]?.value ? (parseFloat(row[4].value) * 100).toFixed(1) + "%" : "0%";
    const avgDuration = row[5]?.value ? formatDuration(parseFloat(row[5].value)) : "0s";
    const engagementRate = row[6]?.value ? (parseFloat(row[6].value) * 100).toFixed(1) + "%" : "0%";
    return text(
      `GA4 Traffic Overview — ${label} (last ${days} days):\n\n` +
      `Sessions:            ${sessions}\n` +
      `Total Users:         ${users}\n` +
      `New Users:           ${newUsers}\n` +
      `Pageviews:           ${pageviews}\n` +
      `Bounce Rate:         ${bounceRate}\n` +
      `Engagement Rate:     ${engagementRate}\n` +
      `Avg Session Duration: ${avgDuration}`
    );
  }

  if (base === "top_pages") {
    const [res] = await ga4Report({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [{ name: "sessions" }, { name: "screenPageViews" }, { name: "averageSessionDuration" }, { name: "bounceRate" }],
      limit,
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    });
    const rows = res.rows ?? [];
    if (rows.length === 0) return text(`No page data for ${label} in the last ${days} days.`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = rows.map((r: any, i: number) => {
      const path = r.dimensionValues?.[0]?.value ?? "/";
      const title = r.dimensionValues?.[1]?.value ?? "";
      const sessions = r.metricValues?.[0]?.value ?? "0";
      const pv = r.metricValues?.[1]?.value ?? "0";
      const dur = r.metricValues?.[2]?.value ? formatDuration(parseFloat(r.metricValues[2].value)) : "0s";
      const br = r.metricValues?.[3]?.value ? (parseFloat(r.metricValues[3].value) * 100).toFixed(1) + "%" : "0%";
      return `${i + 1}. ${path}${title ? ` (${title})` : ""}\n   Sessions: ${sessions} | Pageviews: ${pv} | Avg Duration: ${dur} | Bounce: ${br}`;
    }).join("\n\n");
    return text(`Top ${rows.length} pages — ${label} (last ${days} days):\n\n${table}`);
  }

  if (base === "traffic_sources") {
    const [res] = await ga4Report({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "newUsers" }, { name: "bounceRate" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    });
    const rows = res.rows ?? [];
    if (rows.length === 0) return text(`No traffic source data for ${label} in the last ${days} days.`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = rows.map((r: any, i: number) => {
      const channel = r.dimensionValues?.[0]?.value ?? "Unknown";
      const s = r.metricValues?.[0]?.value ?? "0";
      const u = r.metricValues?.[1]?.value ?? "0";
      const nu = r.metricValues?.[2]?.value ?? "0";
      const br = r.metricValues?.[3]?.value ? (parseFloat(r.metricValues[3].value) * 100).toFixed(1) + "%" : "0%";
      return `${i + 1}. ${channel}\n   Sessions: ${s} | Users: ${u} | New Users: ${nu} | Bounce: ${br}`;
    }).join("\n\n");
    return text(`Traffic Sources — ${label} (last ${days} days):\n\n${table}`);
  }

  if (base === "devices") {
    const [res] = await ga4Report({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "bounceRate" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    });
    const rows = res.rows ?? [];
    if (rows.length === 0) return text(`No device data for ${label} in the last ${days} days.`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalSessions = rows.reduce((sum: number, r: any) => sum + parseInt(r.metricValues?.[0]?.value ?? "0"), 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = rows.map((r: any, i: number) => {
      const device = r.dimensionValues?.[0]?.value ?? "Unknown";
      const s = parseInt(r.metricValues?.[0]?.value ?? "0");
      const u = r.metricValues?.[1]?.value ?? "0";
      const br = r.metricValues?.[2]?.value ? (parseFloat(r.metricValues[2].value) * 100).toFixed(1) + "%" : "0%";
      const share = totalSessions > 0 ? ((s / totalSessions) * 100).toFixed(1) + "%" : "0%";
      return `${i + 1}. ${device.charAt(0).toUpperCase() + device.slice(1)}\n   Sessions: ${s} (${share}) | Users: ${u} | Bounce: ${br}`;
    }).join("\n\n");
    return text(`Device Breakdown — ${label} (last ${days} days):\n\n${table}`);
  }

  if (base === "geo") {
    const [res] = await ga4Report({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "newUsers" }],
      limit,
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    });
    const rows = res.rows ?? [];
    if (rows.length === 0) return text(`No geo data for ${label} in the last ${days} days.`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = rows.map((r: any, i: number) => {
      const country = r.dimensionValues?.[0]?.value ?? "Unknown";
      const s = r.metricValues?.[0]?.value ?? "0";
      const u = r.metricValues?.[1]?.value ?? "0";
      const nu = r.metricValues?.[2]?.value ?? "0";
      return `${i + 1}. ${country}\n   Sessions: ${s} | Users: ${u} | New Users: ${nu}`;
    }).join("\n\n");
    return text(`Top ${rows.length} countries — ${label} (last ${days} days):\n\n${table}`);
  }

  return text("Unknown GA4 operation");
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}
