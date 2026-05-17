import { NextRequest, NextResponse } from "next/server";
import { prisma, decrypt } from "@easyfetcher/db";
import { google } from "googleapis";

// ─── Connector tool imports ───────────────────────────────────────────────────
import { gscTool, executeGscTool } from "./tools/gsc";
import { ga4Tool, executeGa4Tool } from "./tools/ga4";
import { gmbTool, executeGmbTool } from "./tools/gmb";
import { trendsTool, executeTrendsTool } from "./tools/trends";
import { rankCheckDirectTool, executeRankCheckDirect } from "./tools/rank-tracker";
import {
  backlinkCheckTool, aiOverviewTool, trafficDataTool, keywordVolumeTool,
  executeBacklinkCheck, executeAiOverviewCheck, executeTrafficData, executeKeywordVolume,
} from "./tools/seranking";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ─── Auth ─────────────────────────────────────────────────────────────────────
async function getUserFromToken(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (!token) return null;
  return prisma.user.findFirst({
    where: { apiKey: token },
    include: {
      workspaces: {
        orderBy: { sortOrder: "asc" },
        include: { connections: { where: { status: "CONNECTED" } } },
      },
    },
  });
}

// ─── OAuth client factory ─────────────────────────────────────────────────────
function makeOAuth2Client(accessToken: string, refreshToken: string | null, expiresAt: Date | null) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/callback/google`
  );
  client.setCredentials({
    access_token: decrypt(accessToken),
    refresh_token: refreshToken ? decrypt(refreshToken) : undefined,
    expiry_date: expiresAt ? expiresAt.getTime() : undefined,
  });
  return client;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type UserWithWorkspaces = NonNullable<Awaited<ReturnType<typeof getUserFromToken>>>;
type Connection = UserWithWorkspaces["workspaces"][0]["connections"][0];

// ─── All tools list ───────────────────────────────────────────────────────────
const TOOLS = [
  trendsTool,
  {
    name: "list_connections",
    description: "List all connected data sources grouped by workspace. Call this first to discover what workspaces and platforms are available before querying data.",
    inputSchema: { type: "object", properties: {} },
  },
  gscTool,
  ga4Tool,
  gmbTool,
  rankCheckDirectTool,
  backlinkCheckTool,
  aiOverviewTool,
  trafficDataTool,
  keywordVolumeTool,
];

// ─── Connection resolver ───────────────────────────────────────────────────────
type ResolveResult = { conn: Connection } | { error: string };

function resolveConnection(
  platform: "GSC" | "GA4" | "GOOGLE_MY_BUSINESS",
  labelArg: string | undefined,
  workspaceNameArg: string | undefined,
  user: UserWithWorkspaces
): ResolveResult {
  let workspace: UserWithWorkspaces["workspaces"][0];

  if (workspaceNameArg) {
    const match = user.workspaces.find((ws) =>
      ws.name.toLowerCase().includes(workspaceNameArg.toLowerCase())
    );
    if (!match) {
      const names = user.workspaces.map((ws) => `"${ws.name}"`).join(", ");
      return { error: `No workspace matching "${workspaceNameArg}" found. Available: ${names}. Call list_connections to confirm.` };
    }
    workspace = match;
  } else if (user.workspaces.length === 1) {
    workspace = user.workspaces[0];
  } else if (user.workspaces.length === 0) {
    return { error: "No workspaces found. Visit your EasyFetcher dashboard to create one and connect data sources." };
  } else {
    const names = user.workspaces.map((ws) => `"${ws.name}"`).join(", ");
    return { error: `You have multiple workspaces: ${names}. Please call list_connections and specify workspace_name.` };
  }

  const platformConns = workspace.connections.filter((c) => (c.platform as string) === platform);
  if (platformConns.length === 0) {
    const platformLabel = platform === "GOOGLE_MY_BUSINESS" ? "Google My Business" : platform;
    return { error: `${platformLabel} is not connected for workspace "${workspace.name}". Visit your EasyFetcher dashboard to connect it.` };
  }

  if (labelArg) {
    const match = platformConns.find((c) => {
      const label = (c.label ?? c.siteUrl ?? c.accountId ?? "").toLowerCase();
      return label.includes(labelArg.toLowerCase());
    });
    if (!match) {
      const available = platformConns.map((c) => `"${c.label ?? c.siteUrl ?? c.accountId}"`).join(", ");
      return { error: `No ${platform} connection matching "${labelArg}" in workspace "${workspace.name}". Available: ${available}.` };
    }
    return { conn: match };
  }

  if (platformConns.length === 1) return { conn: platformConns[0] };

  const paramName = platform === "GSC" ? "site_url" : platform === "GA4" ? "property_name" : "account_name";
  const available = platformConns.map((c) => `"${c.label ?? c.siteUrl ?? c.accountId}"`).join(", ");
  return { error: `Workspace "${workspace.name}" has multiple ${platform} connections: ${available}. Please specify ${paramName}.` };
}

// ─── Tool execution ────────────────────────────────────────────────────────────
async function executeTool(name: string, args: Record<string, unknown>, user: UserWithWorkspaces) {
  const text = (t: string) => ({ content: [{ type: "text", text: t }] });

  // Google Trends — no auth needed
  if (name === "trends_query") {
    return executeTrendsTool(args, text);
  }

  // List all connections
  if (name === "list_connections") {
    if (user.workspaces.length === 0) {
      return text("No workspaces found. Visit your EasyFetcher dashboard to create one and connect data sources.");
    }
    const lines: string[] = ["**Connected workspaces and data sources:**\n"];
    for (const ws of user.workspaces) {
      lines.push(`📁 **${ws.name}**`);
      if (ws.connections.length === 0) {
        lines.push("   (no sources connected)");
      } else {
        for (const c of ws.connections) {
          const p = c.platform as string;
          const label = c.label ?? c.siteUrl ?? c.accountId ?? p;
          if (p === "GSC") lines.push(`   • GSC: ${label} → use gsc_query with workspace_name="${ws.name}", site_url="${label}"`);
          else if (p === "GA4") lines.push(`   • GA4: ${label} → use ga4_query with workspace_name="${ws.name}", property_name="${label}"`);
          else if (p === "GOOGLE_MY_BUSINESS") lines.push(`   • Google My Business: ${label} → use gmb_query with workspace_name="${ws.name}", account_name="${label}"`);
          else if (p === "GOOGLE_TRENDS") lines.push(`   • Google Trends: connected (use trends_query with any keyword)`);
          else lines.push(`   • ${p}: ${label}`);
        }
      }
      lines.push("");
    }
    lines.push("Use the appropriate query tool with the workspace_name and site identifier shown above.");
    return text(lines.join("\n"));
  }

  // GSC
  if (name === "gsc_query") {
    const result = resolveConnection("GSC", args.site_url as string | undefined, args.workspace_name as string | undefined, user);
    if ("error" in result) return text(result.error);
    return executeGscTool(args.metric as "top_queries" | "top_pages" | "keyword_detail", args, result.conn, text, makeOAuth2Client);
  }

  // GA4
  if (name === "ga4_query") {
    const result = resolveConnection("GA4", args.property_name as string | undefined, args.workspace_name as string | undefined, user);
    if ("error" in result) return text(result.error);
    return executeGa4Tool(args.metric as "traffic" | "top_pages" | "traffic_sources" | "devices" | "geo", args, result.conn, text, makeOAuth2Client);
  }

  // GMB
  if (name === "gmb_query") {
    const result = resolveConnection("GOOGLE_MY_BUSINESS", args.account_name as string | undefined, args.workspace_name as string | undefined, user);
    if ("error" in result) return text(result.error);
    return executeGmbTool(args.metric as "overview" | "reviews", args, result.conn, text, makeOAuth2Client);
  }

  // Rank tracker
  if (name === "rank_check_direct") {
    const domain = args.domain as string;
    const keywords = args.keywords as string[];
    const location = (args.location as string | undefined) ?? "United States";
    return executeRankCheckDirect(domain, keywords, location, text);
  }

  // SE Ranking tools
  if (name === "backlink_check")
    return executeBacklinkCheck(args.domain as string, (args.country as string | undefined) ?? "US", text);
  if (name === "ai_overview_check")
    return executeAiOverviewCheck(args.domain as string, (args.country as string | undefined) ?? "in", text);
  if (name === "traffic_data")
    return executeTrafficData(args.domain as string, (args.country as string | undefined) ?? "US", text);
  if (name === "keyword_volume")
    return executeKeywordVolume(args.keywords as string[], (args.country as string | undefined) ?? "US", text);

  return text(`Unknown tool: ${name}`);
}

// ─── JSON-RPC helpers ─────────────────────────────────────────────────────────
function rpcResult(id: unknown, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id, result });
}
function rpcError(id: unknown, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } });
}

// ─── HEAD ─────────────────────────────────────────────────────────────────────
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: { "MCP-Protocol-Version": "2025-06-18" },
  });
}

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET(_request: NextRequest) {
  return new NextResponse(null, {
    status: 405,
    headers: {
      Allow: "POST, HEAD",
      "WWW-Authenticate": `Bearer resource_metadata="${BASE}/.well-known/oauth-protected-resource"`,
    },
  });
}

// ─── POST ─────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  let body: { jsonrpc: string; id: unknown; method: string; params?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return rpcError(null, -32700, "Parse error");
  }

  const { id, method, params = {} } = body;

  if (method === "initialize") {
    return rpcResult(id, {
      protocolVersion: "2025-06-18",
      capabilities: { tools: {} },
      serverInfo: { name: "easyfetcher", version: "2.0.0" },
      instructions: "EasyFetcher provides marketing data from Google Search Console, Google Analytics 4, Google My Business, Google Trends, real-time SERP rank checking, and SE Ranking data (backlinks, AI overviews, traffic, keyword volumes).\n\nTOOL SELECTION RULES:\n- User asks to check keyword rankings / positions / where a site ranks → use rank_check_direct\n- User asks about backlinks / link profile / who links to a domain → use backlink_check\n- User asks about AI Overviews / AI citations / SGE presence → use ai_overview_check\n- User asks about website traffic / monthly visitors / audience → use traffic_data\n- User asks about keyword volume / search demand / CPC / difficulty → use keyword_volume\n- User asks about GSC traffic, impressions, clicks, CTR → use gsc_query\n- User asks about website analytics, sessions, pageviews → use ga4_query\n- User asks about Google Business Profile / reviews → use gmb_query\n- User asks about search trends → use trends_query\n\nIMPORTANT: Only call the tool that matches what the user asked. Do not call multiple tools unless explicitly asked.\nrank_check_direct, backlink_check, ai_overview_check, traffic_data, keyword_volume, and trends_query need no connection — call them directly.\nFor GSC/GA4/GMB: call list_connections first, then the query tool.",
    });
  }

  if (method === "notifications/initialized") {
    return new NextResponse(null, { status: 204 });
  }

  if (method === "tools/list") {
    return rpcResult(id, { tools: TOOLS });
  }

  const user = await getUserFromToken(request);
  if (!user) {
    return new NextResponse(
      JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32001, message: "Unauthorized" } }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "WWW-Authenticate": `Bearer resource_metadata="${BASE}/.well-known/oauth-protected-resource"`,
        },
      }
    );
  }

  if (method === "tools/call") {
    const toolName = params.name as string;
    const toolArgs = (params.arguments ?? {}) as Record<string, unknown>;
    try {
      const result = await executeTool(toolName, toolArgs, user);
      return rpcResult(id, result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return rpcError(id, -32000, `Tool error: ${msg}`);
    }
  }

  return rpcError(id, -32601, `Method not found: ${method}`);
}
