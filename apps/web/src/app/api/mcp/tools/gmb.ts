import { prisma, decrypt } from "@easyfetcher/db";
import type { McpTool, Connection, TextFn } from "./types";

export const gmbTool: McpTool = {
  name: "gmb_query",
  description: "Query Google My Business data. metric='overview' to list business locations, 'reviews' to fetch recent customer reviews.",
  inputSchema: {
    type: "object",
    properties: {
      metric: { type: "string", enum: ["overview", "reviews"], description: "Type of GMB data to fetch" },
      limit: { type: "number", description: "Number of reviews (default 10, only for metric='reviews')", default: 10 },
      workspace_name: { type: "string", description: "Workspace name. Required if you have multiple workspaces." },
      account_name: { type: "string", description: "GMB account label. Required if workspace has multiple GMB accounts." },
    },
    required: ["metric"],
  },
};

async function gmbFetch(url: string, token: string, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      signal: ctrl.signal,
    });
    const data = await res.json();
    if (!res.ok) {
      const apiMsg = data?.error?.message ?? data?.error?.status ?? `HTTP ${res.status}`;
      console.error(`[gmb] API error ${res.status} for ${url}:`, apiMsg);
      if (res.status === 401) throw new Error(`GMB token expired or revoked (${res.status}). Re-connect Google My Business from your EasyFetcher dashboard.`);
      if (res.status === 403) throw new Error(`Permission denied for GMB API (${res.status}). Make sure the connected Google account has a verified Business Profile.`);
      throw new Error(`GMB API error ${res.status}: ${apiMsg}`);
    }
    return data;
  } catch (err) {
    if ((err as Error).name === "AbortError") throw new Error("GMB API timed out after 8s");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function resolveGmbLocation(conn: Connection, token: string): Promise<{ locationName: string; label: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta = (conn.metadata as any) ?? {};
  const label = conn.label ?? "My Business";

  if (meta.locationId) return { locationName: meta.locationId, label };

  let accountName = conn.siteUrl ?? conn.accountId;
  if (!accountName || accountName === "gmb_account") {
    const data = await gmbFetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", token);
    const accounts = data.accounts ?? [];
    if (accounts.length === 0) throw new Error("No Google My Business accounts found. Make sure you have a verified business profile.");
    accountName = accounts[0].name as string;
    await prisma.connection.update({ where: { id: conn.id }, data: { siteUrl: accountName } });
  }

  const locData = await gmbFetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title`,
    token
  );
  const locations = locData.locations ?? [];
  if (locations.length === 0) throw new Error(`No locations found for account ${accountName}.`);
  const locationName = locations[0].name as string;

  await prisma.connection.update({
    where: { id: conn.id },
    data: { metadata: { ...meta, locationId: locationName, accountId: accountName } },
  });

  return { locationName, label };
}

export async function executeGmbTool(
  base: "overview" | "reviews",
  args: Record<string, unknown>,
  conn: Connection,
  text: TextFn,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  makeOAuth2Client: (a: string, r: string | null, e: Date | null) => any
) {
  let authClient: ReturnType<typeof makeOAuth2Client>;
  try {
    authClient = makeOAuth2Client(conn.accessToken, conn.refreshToken, conn.expiresAt);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return text(`Token decryption failed: ${msg}. Re-connect Google My Business from your EasyFetcher dashboard.`);
  }

  let token: string;
  try {
    // getAccessToken() auto-refreshes if expired
    const tokenRes = await authClient.getAccessToken();
    if (!tokenRes.token) throw new Error("empty token returned");
    token = tokenRes.token;
  } catch (err) {
    // Fallback to stored access token (may be expired — will surface a 401 from the API)
    console.warn("[gmb] getAccessToken failed, using stored token:", (err as Error).message);
    token = decrypt(conn.accessToken);
  }

  let locationName: string;
  let label: string;
  try {
    ({ locationName, label } = await resolveGmbLocation(conn, token));
  } catch (err) {
    return text(`GMB setup error: ${(err as Error).message}`);
  }

  if (base === "overview") {
    try {
      const days = typeof args.days === "number" ? args.days : 7;
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      const pad = (n: number) => String(n).padStart(2, "0");
      const startStr = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
      const endStr = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;

      const metrics = [
        "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
        "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
        "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
        "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
        "CALL_CLICKS",
        "WEBSITE_CLICKS",
        "BUSINESS_DIRECTION_REQUESTS",
      ].map(m => `dailyMetrics=${m}`).join("&");

      const [sy, sm, sd] = startStr.split("-");
      const [ey, em, ed] = endStr.split("-");
      const dateParams = `dailyRange.startDate.year=${sy}&dailyRange.startDate.month=${Number(sm)}&dailyRange.startDate.day=${Number(sd)}&dailyRange.endDate.year=${ey}&dailyRange.endDate.month=${Number(em)}&dailyRange.endDate.day=${Number(ed)}`;
      const url = `https://businessprofileperformance.googleapis.com/v1/${locationName}:fetchMultiDailyMetricsSummary?${metrics}&${dateParams}`;
      const data = await gmbFetch(url, token);

      if (!data.multiDailyMetricTimeSeries) {
        return text(`No performance data found for ${label} in the last ${days} days.`);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totals: Record<string, number> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const series of data.multiDailyMetricTimeSeries as any[]) {
        const metricName = series.dailyMetricTimeSeries?.dailyMetric as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const total = (series.dailyMetricTimeSeries?.timeSeries?.datedValues ?? []).reduce((sum: number, v: any) => sum + (parseInt(v.value ?? "0") || 0), 0);
        totals[metricName] = total;
      }

      const impressions =
        (totals["BUSINESS_IMPRESSIONS_DESKTOP_MAPS"] ?? 0) +
        (totals["BUSINESS_IMPRESSIONS_DESKTOP_SEARCH"] ?? 0) +
        (totals["BUSINESS_IMPRESSIONS_MOBILE_MAPS"] ?? 0) +
        (totals["BUSINESS_IMPRESSIONS_MOBILE_SEARCH"] ?? 0);

      return text(
        `GMB Performance for ${label} (last ${days} days: ${startStr} → ${endStr}):\n\n` +
        `Total Impressions: ${impressions}\n` +
        `  • Desktop Maps: ${totals["BUSINESS_IMPRESSIONS_DESKTOP_MAPS"] ?? 0}\n` +
        `  • Desktop Search: ${totals["BUSINESS_IMPRESSIONS_DESKTOP_SEARCH"] ?? 0}\n` +
        `  • Mobile Maps: ${totals["BUSINESS_IMPRESSIONS_MOBILE_MAPS"] ?? 0}\n` +
        `  • Mobile Search: ${totals["BUSINESS_IMPRESSIONS_MOBILE_SEARCH"] ?? 0}\n\n` +
        `Actions:\n` +
        `  • Phone calls: ${totals["CALL_CLICKS"] ?? 0}\n` +
        `  • Website clicks: ${totals["WEBSITE_CLICKS"] ?? 0}\n` +
        `  • Direction requests: ${totals["BUSINESS_DIRECTION_REQUESTS"] ?? 0}`
      );
    } catch (err) {
      return text(`Could not fetch GMB performance: ${(err as Error).message}`);
    }
  }

  if (base === "reviews") {
    const limit = typeof args.limit === "number" ? args.limit : 10;
    try {
      const data = await gmbFetch(
        `https://mybusiness.googleapis.com/v4/${locationName}/reviews?pageSize=${limit}`,
        token
      );
      const reviews = data.reviews ?? [];
      if (reviews.length === 0) return text(`No reviews found for ${label}.`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const table = reviews.map((r: any, i: number) => {
        const stars = "★".repeat(r.starRating ?? 0);
        const comment = r.comment ? r.comment.slice(0, 150) : "(no comment)";
        const date = r.createTime ? new Date(r.createTime).toLocaleDateString() : "";
        return `${i + 1}. ${stars} — ${date}\n   "${comment}"`;
      }).join("\n\n");
      return text(`Recent ${reviews.length} reviews for ${label}:\n\n${table}`);
    } catch (err) {
      return text(`Could not fetch reviews: ${(err as Error).message}`);
    }
  }

  return text("Unknown GMB operation");
}
