import { z } from "zod";
import { google } from "googleapis";
import { prisma, decrypt } from "@easyfetcher/db";

function makeOAuth2Client(accessToken: string, refreshToken: string | null, expiresAt: Date | null) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  client.setCredentials({
    access_token: decrypt(accessToken),
    refresh_token: refreshToken ? decrypt(refreshToken) : undefined,
    expiry_date: expiresAt ? expiresAt.getTime() : undefined,
  });
  return client;
}

export function registerGscTools(server: any) {
  // ─── search_console_top_queries ───────────────────────────────────────────────
  server.tool(
    "search_console_top_queries",
    "Get top search queries from Google Search Console with clicks, impressions, CTR and position",
    {
      days: z.number().min(1).max(90).default(28).describe("Days to look back (default 28)"),
      limit: z.number().min(1).max(100).default(20).describe("Number of queries to return"),
      page: z.string().optional().describe("Filter by a specific page URL (optional)"),
    },
    async (args: { days: number; limit: number; page?: string }) => {
      const { days, limit, page } = args;
      const user = await prisma.user.findFirst({
        where: { apiKey: process.env.EASYFETCHER_API_KEY! },
        include: { connections: { where: { status: "CONNECTED" } } },
      });
      if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };

      const gscConn = user.connections.find((c: (typeof user.connections)[number]) => c.platform === "GSC");
      if (!gscConn) return { content: [{ type: "text" as const, text: "Google Search Console is not connected. Visit your EasyFetcher dashboard to connect it." }] };
      if (!gscConn.siteUrl) return { content: [{ type: "text" as const, text: "GSC connected but no site URL found. Try re-authenticating." }] };

      const auth = makeOAuth2Client(gscConn.accessToken, gscConn.refreshToken, gscConn.expiresAt);
      const sc = google.webmasters({ version: "v3", auth });

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const fmt = (d: Date) => d.toISOString().split("T")[0];

      const res = await sc.searchanalytics.query({
        siteUrl: gscConn.siteUrl,
        requestBody: {
          startDate: fmt(startDate),
          endDate: fmt(endDate),
          dimensions: ["query"],
          rowLimit: limit,
          ...(page && {
            dimensionFilterGroups: [{ filters: [{ dimension: "page", operator: "equals", expression: page }] }],
          }),
        },
      });

      const rows = res.data.rows ?? [];
      if (rows.length === 0) {
        return { content: [{ type: "text" as const, text: `No search data found for ${gscConn.siteUrl} in the last ${days} days.` }] };
      }

      const header = `Top ${rows.length} queries for ${gscConn.siteUrl} (last ${days} days):\n\n`;
      const table = rows.map((r, i) => {
        const query = r.keys?.[0] ?? "unknown";
        const clicks = r.clicks?.toFixed(0) ?? "0";
        const impressions = r.impressions?.toFixed(0) ?? "0";
        const ctr = r.ctr != null ? (r.ctr * 100).toFixed(1) + "%" : "0%";
        const pos = r.position?.toFixed(1) ?? "0";
        return `${i + 1}. "${query}"\n   Clicks: ${clicks} | Impressions: ${impressions} | CTR: ${ctr} | Position: ${pos}`;
      }).join("\n\n");

      return { content: [{ type: "text" as const, text: header + table }] };
    }
  );

  // ─── search_console_top_pages ─────────────────────────────────────────────────
  server.tool(
    "search_console_top_pages",
    "Get top performing pages from Google Search Console",
    {
      days: z.number().min(1).max(90).default(28).describe("Days to look back (default 28)"),
      limit: z.number().min(1).max(100).default(20).describe("Number of pages to return"),
    },
    async (args: { days: number; limit: number }) => {
      const { days, limit } = args;
      const user = await prisma.user.findFirst({
        where: { apiKey: process.env.EASYFETCHER_API_KEY! },
        include: { connections: { where: { status: "CONNECTED" } } },
      });
      if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };

      const gscConn = user.connections.find((c: (typeof user.connections)[number]) => c.platform === "GSC");
      if (!gscConn?.siteUrl) return { content: [{ type: "text" as const, text: "Google Search Console is not connected." }] };

      const auth = makeOAuth2Client(gscConn.accessToken, gscConn.refreshToken, gscConn.expiresAt);
      const sc = google.webmasters({ version: "v3", auth });

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const fmt = (d: Date) => d.toISOString().split("T")[0];

      const res = await sc.searchanalytics.query({
        siteUrl: gscConn.siteUrl,
        requestBody: {
          startDate: fmt(startDate),
          endDate: fmt(endDate),
          dimensions: ["page"],
          rowLimit: limit,
        },
      });

      const rows = res.data.rows ?? [];
      if (rows.length === 0) {
        return { content: [{ type: "text" as const, text: `No page data found for ${gscConn.siteUrl} in the last ${days} days.` }] };
      }

      const header = `Top ${rows.length} pages for ${gscConn.siteUrl} (last ${days} days):\n\n`;
      const table = rows.map((r, i) => {
        const url = r.keys?.[0] ?? "unknown";
        const clicks = r.clicks?.toFixed(0) ?? "0";
        const impressions = r.impressions?.toFixed(0) ?? "0";
        const ctr = r.ctr != null ? (r.ctr * 100).toFixed(1) + "%" : "0%";
        const pos = r.position?.toFixed(1) ?? "0";
        return `${i + 1}. ${url}\n   Clicks: ${clicks} | Impressions: ${impressions} | CTR: ${ctr} | Position: ${pos}`;
      }).join("\n\n");

      return { content: [{ type: "text" as const, text: header + table }] };
    }
  );

  // ─── search_console_keyword_detail ────────────────────────────────────────────
  server.tool(
    "search_console_keyword_detail",
    "Get which pages rank for a specific keyword with full metrics",
    {
      keyword: z.string().describe("The search keyword to analyze"),
      days: z.number().min(1).max(90).default(28).describe("Days to look back"),
    },
    async (args: { keyword: string; days: number }) => {
      const { keyword, days } = args;
      const user = await prisma.user.findFirst({
        where: { apiKey: process.env.EASYFETCHER_API_KEY! },
        include: { connections: { where: { status: "CONNECTED" } } },
      });
      if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };

      const gscConn = user.connections.find((c: (typeof user.connections)[number]) => c.platform === "GSC");
      if (!gscConn?.siteUrl) return { content: [{ type: "text" as const, text: "Google Search Console is not connected." }] };

      const auth = makeOAuth2Client(gscConn.accessToken, gscConn.refreshToken, gscConn.expiresAt);
      const sc = google.webmasters({ version: "v3", auth });

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const fmt = (d: Date) => d.toISOString().split("T")[0];

      const res = await sc.searchanalytics.query({
        siteUrl: gscConn.siteUrl,
        requestBody: {
          startDate: fmt(startDate),
          endDate: fmt(endDate),
          dimensions: ["page"],
          dimensionFilterGroups: [{ filters: [{ dimension: "query", operator: "equals", expression: keyword }] }],
          rowLimit: 10,
        },
      });

      const rows = res.data.rows ?? [];
      if (rows.length === 0) {
        return { content: [{ type: "text" as const, text: `No data found for keyword "${keyword}" in the last ${days} days.` }] };
      }

      const header = `Pages ranking for "${keyword}" (last ${days} days):\n\n`;
      const table = rows.map((r, i) => {
        const url = r.keys?.[0] ?? "unknown";
        const clicks = r.clicks?.toFixed(0) ?? "0";
        const impressions = r.impressions?.toFixed(0) ?? "0";
        const pos = r.position?.toFixed(1) ?? "0";
        return `${i + 1}. ${url}\n   Clicks: ${clicks} | Impressions: ${impressions} | Position: ${pos}`;
      }).join("\n\n");

      return { content: [{ type: "text" as const, text: header + table }] };
    }
  );
}