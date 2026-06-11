import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { google } from "googleapis";
import { prisma, decrypt } from "@easyfetcher/db";

const API_KEY = process.env.EASYFETCHER_API_KEY;
if (!API_KEY) {
  process.stderr.write("EASYFETCHER_API_KEY env var is required\n");
  process.exit(1);
}

async function getUser() {
  return prisma.user.findFirst({
    where: { apiKey: API_KEY! },
    include: { connections: { where: { status: "CONNECTED" } } },
  });
}

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

const server = new McpServer({ name: "easyfetcher", version: "1.0.0" });

// ─── list_connections ──────────────────────────────────────────────────────────
server.tool(
  "list_connections",
  "List all connected data sources for this EasyFetcher account",
  {},
  async () => {
    const user = await getUser();
    if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };
    if (user.connections.length === 0) {
      return { content: [{ type: "text" as const, text: "No data sources connected yet. Visit your EasyFetcher dashboard to connect Google Search Console." }] };
    }
    const lines = user.connections.map((c) => {
      const detail = c.siteUrl ? ` — ${c.siteUrl}` : c.accountId ? ` — Account ${c.accountId}` : "";
      return `• ${c.platform}${detail}`;
    });
    return { content: [{ type: "text" as const, text: `Connected sources:\n${lines.join("\n")}` }] };
  }
);

// ─── search_console_top_queries ───────────────────────────────────────────────
server.tool(
  "search_console_top_queries",
  "Get top search queries from Google Search Console with clicks, impressions, CTR and position",
  {
    days: z.number().min(1).max(90).default(28).describe("Days to look back (default 28)"),
    limit: z.number().min(1).max(100).default(20).describe("Number of queries to return"),
    page: z.string().optional().describe("Filter by a specific page URL (optional)"),
  },
  async ({ days, limit, page }) => {
    const user = await getUser();
    if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };

    const gscConn = user.connections.find((c) => c.platform === "GSC");
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
  async ({ days, limit }) => {
    const user = await getUser();
    if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };

    const gscConn = user.connections.find((c) => c.platform === "GSC");
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
  async ({ keyword, days }) => {
    const user = await getUser();
    if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };

    const gscConn = user.connections.find((c) => c.platform === "GSC");
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

// ─── shopify_orders ───────────────────────────────────────────────────────────
server.tool(
  "shopify_orders",
  "Get recent orders and revenue data from Shopify",
  {
    days: z.number().min(1).max(365).default(30).describe("Days to look back (default 30)"),
    limit: z.number().min(1).max(250).default(50).describe("Max orders to return (default 50)"),
    status: z.enum(["any", "open", "closed", "cancelled"]).default("any").describe("Order status filter"),
  },
  async ({ days, limit, status }) => {
    const user = await getUser();
    if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };
    const conn = user.connections.find((c) => c.platform === "SHOPIFY");
    if (!conn?.siteUrl) return { content: [{ type: "text" as const, text: "Shopify is not connected." }] };
    const accessToken = decrypt(conn.accessToken);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const res = await fetch(`https://${conn.siteUrl}/admin/api/2024-01/orders.json?limit=${limit}&status=${status}&created_at_min=${since}&fields=id,name,total_price,financial_status,created_at`, { headers: { "X-Shopify-Access-Token": accessToken } });
    if (!res.ok) return { content: [{ type: "text" as const, text: `Shopify API error: ${res.status}` }] };
    const data = await res.json() as { orders: Array<{ name: string; total_price: string; financial_status: string; created_at: string }> };
    const orders = data.orders ?? [];
    if (orders.length === 0) return { content: [{ type: "text" as const, text: `No orders found in the last ${days} days.` }] };
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_price || "0"), 0);
    const rows = orders.slice(0, 20).map((o, i) => `${i + 1}. ${o.name} — $${parseFloat(o.total_price).toFixed(2)} (${o.financial_status}) — ${new Date(o.created_at).toLocaleDateString()}`).join("\n");
    return { content: [{ type: "text" as const, text: `Shopify orders for ${conn.label ?? conn.siteUrl} (last ${days} days):\nTotal: ${orders.length} | Revenue: $${totalRevenue.toFixed(2)}\n\n${rows}` }] };
  }
);

// ─── shopify_products ─────────────────────────────────────────────────────────
server.tool(
  "shopify_products",
  "Get product catalog and inventory data from Shopify",
  {
    limit: z.number().min(1).max(250).default(50).describe("Max products to return"),
    status: z.enum(["active", "archived", "draft"]).default("active").describe("Product status filter"),
  },
  async ({ limit, status }) => {
    const user = await getUser();
    if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };
    const conn = user.connections.find((c) => c.platform === "SHOPIFY");
    if (!conn?.siteUrl) return { content: [{ type: "text" as const, text: "Shopify is not connected." }] };
    const accessToken = decrypt(conn.accessToken);
    const res = await fetch(`https://${conn.siteUrl}/admin/api/2024-01/products.json?limit=${limit}&status=${status}&fields=id,title,status,variants`, { headers: { "X-Shopify-Access-Token": accessToken } });
    if (!res.ok) return { content: [{ type: "text" as const, text: `Shopify API error: ${res.status}` }] };
    const data = await res.json() as { products: Array<{ title: string; variants: Array<{ price: string; inventory_quantity: number }> }> };
    const products = data.products ?? [];
    if (products.length === 0) return { content: [{ type: "text" as const, text: `No ${status} products found.` }] };
    const rows = products.map((p, i) => {
      const prices = p.variants?.map((v) => parseFloat(v.price)) ?? [];
      const min = prices.length ? Math.min(...prices).toFixed(2) : "—";
      const max = prices.length ? Math.max(...prices).toFixed(2) : "—";
      const stock = p.variants?.reduce((s, v) => s + (v.inventory_quantity ?? 0), 0) ?? 0;
      return `${i + 1}. ${p.title} — ${min === max ? `$${min}` : `$${min}–$${max}`} | Stock: ${stock}`;
    }).join("\n");
    return { content: [{ type: "text" as const, text: `${products.length} ${status} products in ${conn.label ?? conn.siteUrl}:\n\n${rows}` }] };
  }
);

// ─── shopify_revenue_summary ──────────────────────────────────────────────────
server.tool(
  "shopify_revenue_summary",
  "Get revenue summary — total sales, AOV, order count from Shopify",
  { days: z.number().min(1).max(365).default(30).describe("Days to look back") },
  async ({ days }) => {
    const user = await getUser();
    if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };
    const conn = user.connections.find((c) => c.platform === "SHOPIFY");
    if (!conn?.siteUrl) return { content: [{ type: "text" as const, text: "Shopify is not connected." }] };
    const accessToken = decrypt(conn.accessToken);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const res = await fetch(`https://${conn.siteUrl}/admin/api/2024-01/orders.json?limit=250&status=any&created_at_min=${since}&fields=total_price,financial_status,cancelled_at`, { headers: { "X-Shopify-Access-Token": accessToken } });
    if (!res.ok) return { content: [{ type: "text" as const, text: `Shopify API error: ${res.status}` }] };
    const data = await res.json() as { orders: Array<{ total_price: string; financial_status: string; cancelled_at: string | null }> };
    const orders = (data.orders ?? []).filter((o) => !o.cancelled_at);
    const paid = orders.filter((o) => o.financial_status === "paid" || o.financial_status === "partially_paid");
    const totalRevenue = paid.reduce((s, o) => s + parseFloat(o.total_price || "0"), 0);
    const aov = paid.length > 0 ? totalRevenue / paid.length : 0;
    return { content: [{ type: "text" as const, text: `Revenue summary for ${conn.label ?? conn.siteUrl} (last ${days} days):\nTotal orders: ${orders.length}\nPaid orders: ${paid.length}\nTotal revenue: $${totalRevenue.toFixed(2)}\nAOV: $${aov.toFixed(2)}` }] };
  }
);

// ─── youtube_channel_stats ────────────────────────────────────────────────────
server.tool(
  "youtube_channel_stats",
  "Get YouTube channel statistics: views, subscribers, watch time and video count",
  {
    days: z.number().min(1).max(90).default(28).describe("Days to look back (default 28)"),
  },
  async ({ days }) => {
    const user = await getUser();
    if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };

    const conn = user.connections.find((c) => c.platform === "YOUTUBE");
    if (!conn) return { content: [{ type: "text" as const, text: "YouTube Organic is not connected. Visit your EasyFetcher dashboard to connect it." }] };

    const auth = makeOAuth2Client(conn.accessToken, conn.refreshToken, conn.expiresAt);
    const youtube = google.youtube({ version: "v3", auth });
    const youtubeAnalytics = google.youtubeAnalytics({ version: "v2", auth });

    const channelId = conn.siteUrl && conn.siteUrl !== "youtube_channel" ? conn.siteUrl : undefined;

    const channelRes = await youtube.channels.list({
      part: ["snippet", "statistics"],
      ...(channelId ? { id: [channelId] } : { mine: true }),
      maxResults: 1,
    });

    const channel = channelRes.data.items?.[0];
    if (!channel) return { content: [{ type: "text" as const, text: "Could not fetch YouTube channel data." }] };

    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    let analyticsText = "";
    try {
      const analyticsRes = await youtubeAnalytics.reports.query({
        ids: `channel==${channelId ?? "MINE"}`,
        startDate,
        endDate,
        metrics: "views,estimatedMinutesWatched,subscribersGained,subscribersLost",
      });
      const row = analyticsRes.data.rows?.[0];
      if (row) {
        const [views, watchMins, gained, lost] = row as number[];
        analyticsText = `\nLast ${days} days:\n  Views: ${views?.toLocaleString() ?? 0}\n  Watch time: ${Math.round((watchMins ?? 0) / 60).toLocaleString()} hours\n  Subscribers gained: +${gained ?? 0} / lost: -${lost ?? 0}`;
      }
    } catch { /* analytics may fail for new channels */ }

    const stats = channel.statistics ?? {};
    const name = channel.snippet?.title ?? "YouTube Channel";
    const summary = `Channel: ${name}\nTotal subscribers: ${parseInt(stats.subscriberCount ?? "0").toLocaleString()}\nTotal views: ${parseInt(stats.viewCount ?? "0").toLocaleString()}\nTotal videos: ${stats.videoCount ?? 0}${analyticsText}`;

    return { content: [{ type: "text" as const, text: summary }] };
  }
);

// ─── youtube_top_videos ────────────────────────────────────────────────────────
server.tool(
  "youtube_top_videos",
  "Get top performing YouTube videos with views, watch time and engagement",
  {
    days: z.number().min(1).max(90).default(28).describe("Days to look back (default 28)"),
    limit: z.number().min(1).max(25).default(10).describe("Number of videos to return"),
  },
  async ({ days, limit }) => {
    const user = await getUser();
    if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };

    const conn = user.connections.find((c) => c.platform === "YOUTUBE");
    if (!conn) return { content: [{ type: "text" as const, text: "YouTube Organic is not connected." }] };

    const auth = makeOAuth2Client(conn.accessToken, conn.refreshToken, conn.expiresAt);
    const youtubeAnalytics = google.youtubeAnalytics({ version: "v2", auth });

    const channelId = conn.siteUrl && conn.siteUrl !== "youtube_channel" ? conn.siteUrl : "MINE";
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    try {
      const res = await youtubeAnalytics.reports.query({
        ids: `channel==${channelId}`,
        startDate,
        endDate,
        metrics: "views,estimatedMinutesWatched,likes,comments",
        dimensions: "video",
        sort: "-views",
        maxResults: limit,
      });

      const rows = res.data.rows ?? [];
      if (rows.length === 0) {
        return { content: [{ type: "text" as const, text: `No video data found in the last ${days} days.` }] };
      }

      const youtube = google.youtube({ version: "v3", auth });
      const videoIds = rows.map((r) => (r as unknown[])[0] as string);
      const videoRes = await youtube.videos.list({ part: ["snippet"], id: videoIds });
      const titles: Record<string, string> = {};
      for (const v of videoRes.data.items ?? []) {
        if (v.id) titles[v.id] = v.snippet?.title ?? v.id;
      }

      const header = `Top ${rows.length} YouTube videos (last ${days} days):\n\n`;
      const table = rows.map((row, i) => {
        const r = row as unknown[];
        const videoId = r[0] as string;
        const views = (r[1] as number)?.toLocaleString() ?? "0";
        const watchMins = r[2] as number;
        const watchHours = Math.round((watchMins ?? 0) / 60).toLocaleString();
        const likes = (r[3] as number)?.toLocaleString() ?? "0";
        const title = titles[videoId] ?? videoId;
        return `${i + 1}. ${title}\n   Views: ${views} | Watch time: ${watchHours}h | Likes: ${likes}`;
      }).join("\n\n");

      return { content: [{ type: "text" as const, text: header + table }] };
    } catch (err) {
      return { content: [{ type: "text" as const, text: `YouTube Analytics error: ${err instanceof Error ? err.message : String(err)}` }] };
    }
  }
);

// ─── youtube_ads_performance ──────────────────────────────────────────────────
server.tool(
  "youtube_ads_performance",
  "Get YouTube ad campaign performance: impressions, views, CPV and conversions via Google Ads",
  {
    days: z.number().min(1).max(90).default(28).describe("Days to look back (default 28)"),
  },
  async ({ days }) => {
    const user = await getUser();
    if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };

    const conn = user.connections.find((c) => c.platform === "YOUTUBE_ADS");
    if (!conn) return { content: [{ type: "text" as const, text: "YouTube Ads is not connected. Visit your EasyFetcher dashboard to connect it." }] };

    return {
      content: [{
        type: "text" as const,
        text: "YouTube Ads data is fetched via the Google Ads API (Customer ID required). Please provide your Google Ads Customer ID to query YouTube campaign data. Your YouTube Ads connector is connected — full Google Ads API querying will be available in the next release.",
      }],
    };
  }
);

// ─── pagespeed_insights ───────────────────────────────────────────────────────
server.tool(
  "pagespeed_insights",
  "Analyze any URL's Core Web Vitals, Lighthouse performance scores, and PageSpeed metrics using Google's PageSpeed Insights API",
  {
    url: z.string().url().describe("The fully qualified URL to analyze (e.g. https://example.com/page)"),
    strategy: z.enum(["mobile", "desktop"]).default("mobile").describe("Device strategy: mobile (default) or desktop"),
  },
  async ({ url, strategy }) => {
    const user = await getUser();
    if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };


    const apiKey = process.env.PAGESPEED_API_KEY;
    if (!apiKey) {
      return { content: [{ type: "text" as const, text: "PageSpeed API key is not configured on the server. Please add PAGESPEED_API_KEY to your environment variables." }] };
    }

    const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${apiKey}`;

    let data: Record<string, unknown>;
    try {
      const res = await fetch(endpoint);
      if (!res.ok) {
        const errBody = await res.text();
        return { content: [{ type: "text" as const, text: `PageSpeed API error ${res.status}: ${errBody}` }] };
      }
      data = await res.json() as Record<string, unknown>;
    } catch (err) {
      return { content: [{ type: "text" as const, text: `Failed to call PageSpeed API: ${err instanceof Error ? err.message : String(err)}` }] };
    }

    // Extract Lighthouse categories
    const categories = (data.lighthouseResult as Record<string, unknown>)?.categories as Record<string, { score: number; title: string }> | undefined;
    const audits = (data.lighthouseResult as Record<string, unknown>)?.audits as Record<string, { numericValue?: number; displayValue?: string; title: string }> | undefined;

    const score = (key: string) => {
      const s = categories?.[key]?.score;
      return s != null ? Math.round(s * 100) : "N/A";
    };

    const metric = (key: string) => audits?.[key]?.displayValue ?? "N/A";

    const performanceScore = score("performance");
    const accessibilityScore = score("accessibility");
    const bestPracticesScore = score("best-practices");
    const seoScore = score("seo");

    // Core Web Vitals & key metrics
    const fcp = metric("first-contentful-paint");
    const lcp = metric("largest-contentful-paint");
    const cls = metric("cumulative-layout-shift");
    const tbt = metric("total-blocking-time");
    const si  = metric("speed-index");
    const tti = metric("interactive");

    // Opportunities (top failing audits)
    const opportunities: string[] = [];
    if (audits) {
      for (const [, audit] of Object.entries(audits)) {
        const a = audit as { score?: number; details?: { type?: string }; title: string; displayValue?: string };
        if (a.score != null && a.score < 0.9 && a.details?.type === "opportunity") {
          opportunities.push(`• ${a.title}${a.displayValue ? ` — ${a.displayValue}` : ""}`);
        }
      }
    }

    const strategyLabel = strategy.charAt(0).toUpperCase() + strategy.slice(1);

    const report = [
      `📊 PageSpeed Insights — ${strategyLabel}`,
      `URL: ${url}`,
      ``,
      `🏆 Lighthouse Scores`,
      `  Performance:    ${performanceScore}/100`,
      `  Accessibility:  ${accessibilityScore}/100`,
      `  Best Practices: ${bestPracticesScore}/100`,
      `  SEO:            ${seoScore}/100`,
      ``,
      `⚡ Core Web Vitals & Metrics`,
      `  First Contentful Paint (FCP):    ${fcp}`,
      `  Largest Contentful Paint (LCP):  ${lcp}`,
      `  Cumulative Layout Shift (CLS):   ${cls}`,
      `  Total Blocking Time (TBT):       ${tbt}`,
      `  Speed Index:                     ${si}`,
      `  Time to Interactive (TTI):       ${tti}`,
      ...(opportunities.length > 0 ? [``, `🔧 Top Improvement Opportunities`, ...opportunities.slice(0, 5)] : []),
    ].join("\n");

    return { content: [{ type: "text" as const, text: report }] };
  }
);

// ─── bing_top_queries ─────────────────────────────────────────────────────────
server.tool(
  "bing_top_queries",
  "Get top search queries from Bing Webmaster with clicks, impressions and position",
  {
    days: z.number().min(1).max(90).default(28).describe("Days to look back (default 28)"),
    limit: z.number().min(1).max(100).default(20).describe("Number of queries to return"),
  },
  async ({ days, limit }) => {
    const user = await getUser();
    if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };

    const conn = user.connections.find((c) => c.platform === "BING_WEBMASTER");
    if (!conn?.siteUrl) return { content: [{ type: "text" as const, text: "Bing Webmaster is not connected. Visit your EasyFetcher dashboard to connect it." }] };

    const accessToken = decrypt(conn.accessToken);
    const siteUrl = conn.siteUrl === "bing_webmaster" ? undefined : conn.siteUrl;
    if (!siteUrl) return { content: [{ type: "text" as const, text: "Bing site URL not found. Try reconnecting Bing Webmaster." }] };

    const endDate = new Date();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;

    const params = new URLSearchParams({
      siteUrl,
      startDate: fmt(startDate),
      endDate: fmt(endDate),
    });

    const res = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/GetKeywordStats?${params.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) {
      return { content: [{ type: "text" as const, text: `Bing API error: ${res.status}` }] };
    }

    const data = await res.json() as { d?: Array<{ Query?: string; Impressions?: number; Clicks?: number; Position?: number }> };
    const rows = (data.d ?? []).slice(0, limit);

    if (rows.length === 0) {
      return { content: [{ type: "text" as const, text: `No Bing query data found for ${siteUrl} in the last ${days} days.` }] };
    }

    const header = `Top ${rows.length} Bing queries for ${siteUrl} (last ${days} days):\n\n`;
    const table = rows.map((r, i) => {
      const query = r.Query ?? "unknown";
      const clicks = (r.Clicks ?? 0).toString();
      const impressions = (r.Impressions ?? 0).toString();
      const pos = (r.Position ?? 0).toFixed(1);
      const ctr = r.Impressions ? ((r.Clicks ?? 0) / r.Impressions * 100).toFixed(1) + "%" : "0%";
      return `${i + 1}. "${query}"\n   Clicks: ${clicks} | Impressions: ${impressions} | CTR: ${ctr} | Position: ${pos}`;
    }).join("\n\n");

    return { content: [{ type: "text" as const, text: header + table }] };
  }
);

// ─── bing_top_pages ───────────────────────────────────────────────────────────
server.tool(
  "bing_top_pages",
  "Get top performing pages from Bing Webmaster with clicks, impressions and position",
  {
    days: z.number().min(1).max(90).default(28).describe("Days to look back (default 28)"),
    limit: z.number().min(1).max(100).default(20).describe("Number of pages to return"),
  },
  async ({ days, limit }) => {
    const user = await getUser();
    if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };

    const conn = user.connections.find((c) => c.platform === "BING_WEBMASTER");
    if (!conn?.siteUrl) return { content: [{ type: "text" as const, text: "Bing Webmaster is not connected." }] };

    const accessToken = decrypt(conn.accessToken);
    const siteUrl = conn.siteUrl === "bing_webmaster" ? undefined : conn.siteUrl;
    if (!siteUrl) return { content: [{ type: "text" as const, text: "Bing site URL not found. Try reconnecting Bing Webmaster." }] };

    const endDate = new Date();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;

    const params = new URLSearchParams({
      siteUrl,
      startDate: fmt(startDate),
      endDate: fmt(endDate),
    });

    const res = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/GetPageStats?${params.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) {
      return { content: [{ type: "text" as const, text: `Bing API error: ${res.status}` }] };
    }

    const data = await res.json() as { d?: Array<{ Page?: string; Impressions?: number; Clicks?: number; Position?: number }> };
    const rows = (data.d ?? []).slice(0, limit);

    if (rows.length === 0) {
      return { content: [{ type: "text" as const, text: `No Bing page data found for ${siteUrl} in the last ${days} days.` }] };
    }

    const header = `Top ${rows.length} Bing pages for ${siteUrl} (last ${days} days):\n\n`;
    const table = rows.map((r, i) => {
      const page = r.Page ?? "unknown";
      const clicks = (r.Clicks ?? 0).toString();
      const impressions = (r.Impressions ?? 0).toString();
      const ctr = r.Impressions ? ((r.Clicks ?? 0) / r.Impressions * 100).toFixed(1) + "%" : "0%";
      const pos = (r.Position ?? 0).toFixed(1);
      return `${i + 1}. ${page}\n   Clicks: ${clicks} | Impressions: ${impressions} | CTR: ${ctr} | Position: ${pos}`;
    }).join("\n\n");

    return { content: [{ type: "text" as const, text: header + table }] };
  }
);

// ─── Start ─────────────────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`MCP Server error: ${err}\n`);
  process.exit(1);
});
