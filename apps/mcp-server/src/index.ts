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

// ─── Start ─────────────────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`MCP Server error: ${err}\n`);
  process.exit(1);
});
