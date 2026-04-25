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

// ─── Start ─────────────────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`MCP Server error: ${err}\n`);
  process.exit(1);
});
