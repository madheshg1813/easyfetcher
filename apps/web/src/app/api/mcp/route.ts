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
import { urlInspectionTool, executeUrlInspection } from "./tools/url-inspection";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ─── Auth ─────────────────────────────────────────────────────────────────────
async function getUserFromToken(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? "";
  let token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  
  if (!token) {
    const url = new URL(request.url);
    token = url.searchParams.get("apiKey") || url.searchParams.get("token");
  }
  
  if (token) {
    const user = await prisma.user.findFirst({
      where: { apiKey: token },
      include: {
        connections: { where: { status: "CONNECTED" } },
      },
    });
    if (user) return user;
  }
  return null;
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
type UserWithConnections = NonNullable<Awaited<ReturnType<typeof getUserFromToken>>>;
type Connection = UserWithConnections["connections"][0];

// ─── All tools list ───────────────────────────────────────────────────────────
const TOOLS = [
  trendsTool,
  {
    name: "list_connections",
    description: "List all connected data sources. Call this first to discover what platforms and sites are available before querying data.",
    inputSchema: { type: "object", properties: {} },
  },
  gscTool,
  urlInspectionTool,
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
  user: UserWithConnections
): ResolveResult {
  const platformConns = user.connections.filter((c) => (c.platform as string) === platform);

  if (platformConns.length === 0) {
    const platformLabel = platform === "GOOGLE_MY_BUSINESS" ? "Google My Business" : platform;
    return { error: `${platformLabel} is not connected. Visit your EasyFetcher dashboard to connect it.` };
  }

  if (labelArg) {
    const match = platformConns.find((c) => {
      const label = (c.label ?? c.siteUrl ?? c.accountId ?? "").toLowerCase();
      return label.includes(labelArg.toLowerCase());
    });
    if (!match) {
      const available = platformConns.map((c) => `"${c.label ?? c.siteUrl ?? c.accountId}"`).join(", ");
      return { error: `No ${platform} connection matching "${labelArg}". Available: ${available}.` };
    }
    return { conn: match };
  }

  if (platformConns.length === 1) return { conn: platformConns[0] };

  const paramName = platform === "GSC" ? "site_url" : platform === "GA4" ? "property_name" : "account_name";
  const available = platformConns.map((c) => `"${c.label ?? c.siteUrl ?? c.accountId}"`).join(", ");
  return { error: `You have multiple ${platform} connections: ${available}. Please specify ${paramName}.` };
}

// ─── Tool execution ────────────────────────────────────────────────────────────
async function executeTool(name: string, args: Record<string, unknown>, user: UserWithConnections) {
  const text = (t: string) => ({ content: [{ type: "text", text: t }] });

  // Google Trends — no auth needed
  if (name === "trends_query") {
    return executeTrendsTool(args, text);
  }

  // List all connections
  if (name === "list_connections") {
    if (user.connections.length === 0) {
      return text("No data sources connected. Visit your EasyFetcher dashboard to connect Google Search Console, Google Analytics 4, etc.");
    }
    const lines: string[] = ["**Connected data sources:**\n"];
    for (const c of user.connections) {
      const p = c.platform as string;
      const label = c.label ?? c.siteUrl ?? c.accountId ?? p;
      if (p === "GSC") lines.push(`   • GSC: ${label} → use gsc_query with site_url="${label}"`);
      else if (p === "GA4") lines.push(`   • GA4: ${label} → use ga4_query with property_name="${label}"`);
      else if (p === "GOOGLE_MY_BUSINESS") lines.push(`   • Google My Business: ${label} → use gmb_query with account_name="${label}"`);
      else if (p === "GOOGLE_TRENDS") lines.push(`   • Google Trends: connected (use trends_query with any keyword)`);
      else lines.push(`   • ${p}: ${label}`);
    }
    lines.push("\nUse the appropriate query tool with the site identifier shown above.");
    return text(lines.join("\n"));
  }

  // GSC
  if (name === "gsc_query") {
    const result = resolveConnection("GSC", args.site_url as string | undefined, user);
    if ("error" in result) return text(result.error);
    return executeGscTool(args.metric as "top_queries" | "top_pages" | "keyword_detail", args, result.conn, text, makeOAuth2Client);
  }

  // GSC URL Inspection
  if (name === "gsc_url_inspect") {
    const result = resolveConnection("GSC", args.site_url as string | undefined, user);
    if ("error" in result) return text(result.error);
    return executeUrlInspection(args, result.conn, text, makeOAuth2Client);
  }

  // GA4
  if (name === "ga4_query") {
    const result = resolveConnection("GA4", args.property_name as string | undefined, user);
    if ("error" in result) return text(result.error);
    return executeGa4Tool(args.metric as "traffic" | "top_pages" | "traffic_sources" | "devices" | "geo", args, result.conn, text, makeOAuth2Client);
  }

  // GMB
  if (name === "gmb_query") {
    const result = resolveConnection("GOOGLE_MY_BUSINESS", args.account_name as string | undefined, user);
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
    return executeBacklinkCheck(args.domain as string, ((args.country as string | undefined) ?? "us").toLowerCase(), text);
  if (name === "ai_overview_check")
    return executeAiOverviewCheck(args.domain as string, ((args.country as string | undefined) ?? "in").toLowerCase(), text);
  if (name === "traffic_data")
    return executeTrafficData(args.domain as string, ((args.country as string | undefined) ?? "us").toLowerCase(), text);
  if (name === "keyword_volume")
    return executeKeywordVolume(args.keywords as string[], ((args.country as string | undefined) ?? "us").toLowerCase(), text);

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
      instructions: "EasyFetcher provides marketing data from Google Search Console, Google Analytics 4, Google My Business, Google Trends, real-time SERP rank checking, and SE Ranking data (backlinks, AI overviews, traffic, keyword volumes).\n\nTOOL SELECTION RULES:\n- User asks to check keyword rankings / positions / where a site ranks → use rank_check_direct\n- User asks about backlinks / link profile / who links to a domain → use backlink_check\n- User asks about AI Overviews / AI citations / SGE presence → use ai_overview_check\n- User asks about website traffic / monthly visitors / audience → use traffic_data\n- User asks about keyword volume / search demand / CPC / difficulty → use keyword_volume\n- User asks about GSC traffic, impressions, clicks, CTR → use gsc_query\n- User asks if a URL is indexed / indexing status / why a page isn't in Google / URL inspection → use gsc_url_inspect\n- User asks about website analytics, sessions, pageviews → use ga4_query\n- User asks about Google Business Profile / reviews → use gmb_query\n- User asks about search trends → use trends_query\n\nIMPORTANT: Only call the tool that matches what the user asked. Do not call multiple tools unless explicitly asked.\nrank_check_direct, backlink_check, ai_overview_check, traffic_data, keyword_volume, and trends_query need no connection — call them directly.\nFor GSC/GA4/GMB: call list_connections first, then the query tool.\n\nCRITICAL: If a tool returns an error stating that the user has multiple connections, YOU MUST stop and explicitly ask the user which connection they want to use, listing the available options provided in the error message.",
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
