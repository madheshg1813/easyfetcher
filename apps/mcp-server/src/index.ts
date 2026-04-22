import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { google } from "googleapis";
import { prisma, decrypt } from "@easyfetcher/db";
import { registerGscTools } from "./tools/gsc.js";
import { registerMetaTools } from "./tools/meta.js";

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

// Register tool modules
registerGscTools(server);
registerMetaTools(server);

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
    if (!conn?.siteUrl) return { content: [{ type: "text" as const, text: "Shopify is not connected. Visit your EasyFetcher dashboard to connect it." }] };

    const accessToken = decrypt(conn.accessToken);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const res = await fetch(
      `https://${conn.siteUrl}/admin/api/2024-01/orders.json?limit=${limit}&status=${status}&created_at_min=${since}&fields=id,name,total_price,financial_status,created_at,line_items_count`,
      { headers: { "X-Shopify-Access-Token": accessToken } }
    );

    if (!res.ok) {
      return { content: [{ type: "text" as const, text: `Shopify API error: ${res.status} ${res.statusText}` }] };
    }

    const data = await res.json() as { orders: Array<{ id: number; name: string; total_price: string; financial_status: string; created_at: string }> };
    const orders = data.orders ?? [];

    if (orders.length === 0) {
      return { content: [{ type: "text" as const, text: `No orders found in the last ${days} days.` }] };
    }

    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_price || "0"), 0);
    const header = `Shopify orders for ${conn.label ?? conn.siteUrl} (last ${days} days):\nTotal: ${orders.length} orders | Revenue: $${totalRevenue.toFixed(2)}\n\n`;

    const rows = orders.slice(0, 20).map((o, i) => {
      const date = new Date(o.created_at).toLocaleDateString();
      return `${i + 1}. ${o.name} — $${parseFloat(o.total_price).toFixed(2)} (${o.financial_status}) — ${date}`;
    }).join("\n");

    const trailer = orders.length > 20 ? `\n…and ${orders.length - 20} more orders` : "";

    return { content: [{ type: "text" as const, text: header + rows + trailer }] };
  }
);

// ─── shopify_products ─────────────────────────────────────────────────────────
server.tool(
  "shopify_products",
  "Get product catalog and inventory data from Shopify",
  {
    limit: z.number().min(1).max(250).default(50).describe("Max products to return (default 50)"),
    status: z.enum(["active", "archived", "draft"]).default("active").describe("Product status filter"),
  },
  async ({ limit, status }) => {
    const user = await getUser();
    if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };

    const conn = user.connections.find((c) => c.platform === "SHOPIFY");
    if (!conn?.siteUrl) return { content: [{ type: "text" as const, text: "Shopify is not connected." }] };

    const accessToken = decrypt(conn.accessToken);

    const res = await fetch(
      `https://${conn.siteUrl}/admin/api/2024-01/products.json?limit=${limit}&status=${status}&fields=id,title,status,variants,created_at,updated_at`,
      { headers: { "X-Shopify-Access-Token": accessToken } }
    );

    if (!res.ok) {
      return { content: [{ type: "text" as const, text: `Shopify API error: ${res.status} ${res.statusText}` }] };
    }

    const data = await res.json() as { products: Array<{ id: number; title: string; status: string; variants: Array<{ price: string; inventory_quantity: number }> }> };
    const products = data.products ?? [];

    if (products.length === 0) {
      return { content: [{ type: "text" as const, text: `No ${status} products found.` }] };
    }

    const header = `${products.length} ${status} products in ${conn.label ?? conn.siteUrl}:\n\n`;
    const rows = products.map((p, i) => {
      const prices = p.variants?.map((v) => parseFloat(v.price)) ?? [];
      const minPrice = prices.length ? Math.min(...prices).toFixed(2) : "—";
      const maxPrice = prices.length ? Math.max(...prices).toFixed(2) : "—";
      const stock = p.variants?.reduce((s, v) => s + (v.inventory_quantity ?? 0), 0) ?? 0;
      const priceStr = minPrice === maxPrice ? `$${minPrice}` : `$${minPrice}–$${maxPrice}`;
      return `${i + 1}. ${p.title} — ${priceStr} | Stock: ${stock}`;
    }).join("\n");

    return { content: [{ type: "text" as const, text: header + rows }] };
  }
);

// ─── shopify_revenue_summary ──────────────────────────────────────────────────
server.tool(
  "shopify_revenue_summary",
  "Get revenue summary metrics from Shopify — total sales, AOV, order count",
  {
    days: z.number().min(1).max(365).default(30).describe("Days to look back (default 30)"),
  },
  async ({ days }) => {
    const user = await getUser();
    if (!user) return { content: [{ type: "text" as const, text: "Invalid API key" }] };

    const conn = user.connections.find((c) => c.platform === "SHOPIFY");
    if (!conn?.siteUrl) return { content: [{ type: "text" as const, text: "Shopify is not connected." }] };

    const accessToken = decrypt(conn.accessToken);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const res = await fetch(
      `https://${conn.siteUrl}/admin/api/2024-01/orders.json?limit=250&status=any&created_at_min=${since}&fields=total_price,financial_status,cancelled_at`,
      { headers: { "X-Shopify-Access-Token": accessToken } }
    );

    if (!res.ok) {
      return { content: [{ type: "text" as const, text: `Shopify API error: ${res.status}` }] };
    }

    const data = await res.json() as { orders: Array<{ total_price: string; financial_status: string; cancelled_at: string | null }> };
    const orders = (data.orders ?? []).filter((o) => !o.cancelled_at);
    const paid = orders.filter((o) => o.financial_status === "paid" || o.financial_status === "partially_paid");

    const totalRevenue = paid.reduce((s, o) => s + parseFloat(o.total_price || "0"), 0);
    const aov = paid.length > 0 ? totalRevenue / paid.length : 0;

    const summary = [
      `Revenue summary for ${conn.label ?? conn.siteUrl} (last ${days} days):`,
      ``,
      `Total orders:  ${orders.length}`,
      `Paid orders:   ${paid.length}`,
      `Total revenue: $${totalRevenue.toFixed(2)}`,
      `Avg order value (AOV): $${aov.toFixed(2)}`,
    ].join("\n");

    return { content: [{ type: "text" as const, text: summary }] };
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
