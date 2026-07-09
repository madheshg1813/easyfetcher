import { NextRequest, NextResponse } from "next/server";
import { prisma, decrypt } from "@easyfetcher/db";
import { google } from "googleapis";
import { getMcpCallLimit } from "@/lib/plan-check";
import { buildCacheKey, getCached, setCached } from "@/lib/mcp-cache";
import { isTokenExpiringSoon, refreshGoogleToken } from "@/lib/token-refresh";
import type { Plan } from "@easyfetcher/db";

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
import { pagespeedTool, executePagespeedTool } from "./tools/pagespeed";
import { bingWebmasterTool, executeBingWebmasterTool } from "./tools/bing";

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

// ─── MCP quota check + increment ─────────────────────────────────────────────
async function checkAndIncrementQuota(userId: string, plan: Plan): Promise<{ allowed: boolean; used: number; limit: number }> {
  const limit = getMcpCallLimit(plan);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mcpCallsUsed: true, mcpCallsResetAt: true },
  });
  if (!user) return { allowed: false, used: 0, limit };

  const now = new Date();
  let used = user.mcpCallsUsed;

  // Reset counter if the monthly window has passed
  if (!user.mcpCallsResetAt || user.mcpCallsResetAt <= now) {
    used = 0;
    const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    await prisma.user.update({
      where: { id: userId },
      data: { mcpCallsUsed: 0, mcpCallsResetAt: nextReset },
    });
  }

  // -1 = unlimited (Enterprise)
  if (limit !== -1 && used >= limit) {
    return { allowed: false, used, limit };
  }

  await prisma.user.update({ where: { id: userId }, data: { mcpCallsUsed: { increment: 1 } } });
  return { allowed: true, used: used + 1, limit };
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
export type Connection = UserWithConnections["connections"][0];

// Proactively refresh a Google token if it's expiring within 5 min, saving new token to DB
async function getRefreshedConn(conn: Connection): Promise<Connection> {
  if (!isTokenExpiringSoon(conn)) return conn;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await refreshGoogleToken(conn as any) as unknown as Connection;
  } catch {
    return conn; // graceful fallback — token may still work, let the API call surface the real error
  }
}

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
  pagespeedTool,
  backlinkCheckTool,
  aiOverviewTool,
  trafficDataTool,
  keywordVolumeTool,
  bingWebmasterTool,
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
      else if (p === "BING_WEBMASTER") lines.push(`   • Bing Webmaster: connected → use bing_webmaster_query with your site_url (e.g. https://example.com/)`);
      else lines.push(`   • ${p}: ${label}`);
    }
    lines.push("\nUse the appropriate query tool with the site identifier shown above.");
    return text(lines.join("\n"));
  }

  // GSC
  if (name === "gsc_query") {
    const result = resolveConnection("GSC", args.site_url as string | undefined, user);
    if ("error" in result) return text(result.error);
    const conn = await getRefreshedConn(result.conn);
    return executeGscTool(args.metric as "top_queries" | "top_pages" | "keyword_detail", args, conn, text, makeOAuth2Client);
  }

  // GSC URL Inspection
  if (name === "gsc_url_inspect") {
    const result = resolveConnection("GSC", args.site_url as string | undefined, user);
    if ("error" in result) return text(result.error);
    const conn = await getRefreshedConn(result.conn);
    return executeUrlInspection(args, conn, text, makeOAuth2Client);
  }

  // GA4
  if (name === "ga4_query") {
    const result = resolveConnection("GA4", args.property_name as string | undefined, user);
    if ("error" in result) return text(result.error);
    const conn = await getRefreshedConn(result.conn);
    return executeGa4Tool(args.metric as "traffic" | "top_pages" | "traffic_sources" | "devices" | "geo", args, conn, text, makeOAuth2Client);
  }

  // GMB
  if (name === "gmb_query") {
    const result = resolveConnection("GOOGLE_MY_BUSINESS", args.account_name as string | undefined, user);
    if ("error" in result) return text(result.error);
    const conn = await getRefreshedConn(result.conn);
    return executeGmbTool(args.metric as "overview" | "reviews", args, conn, text, makeOAuth2Client);
  }

  // PageSpeed Insights
  if (name === "pagespeed_query") {
    return executePagespeedTool(
      args.url as string,
      (args.strategy as "mobile" | "desktop" | undefined) ?? "mobile",
      text
    );
  }

  // Rank tracker
  if (name === "rank_check_direct") {
    const domain = args.domain as string;
    const keywords = args.keywords as string[];
    const location = (args.location as string | undefined) ?? "United States";
    return executeRankCheckDirect(domain, keywords, location, text);
  }

  // Bing Webmaster
  if (name === "bing_webmaster_query") {
    const bingConn = user.connections.find((c) => (c.platform as string) === "BING_WEBMASTER");
    if (!bingConn) return text("Bing Webmaster is not connected. Visit your EasyFetcher dashboard to connect it.");
    const refreshedBingConn = await getRefreshedConn(bingConn);
    return executeBingWebmasterTool(
      args.metric as "top_queries" | "top_pages",
      args,
      refreshedBingConn,
      text
    );
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
export async function GET(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const mcpBase = forwarded ? `${proto}://${forwarded}` : BASE;
  return new NextResponse(null, {
    status: 405,
    headers: {
      Allow: "POST, HEAD",
      "WWW-Authenticate": `Bearer resource_metadata="${mcpBase}/.well-known/oauth-protected-resource"`,
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
      instructions: "EasyFetcher provides marketing data from Google Search Console, Google Analytics 4, Google My Business, Google Trends, Bing Webmaster, real-time SERP rank checking, PageSpeed/Core Web Vitals, and SE Ranking data (backlinks, AI overviews, traffic, keyword volumes).\n\nTOOL SELECTION RULES:\n- User asks to check keyword rankings / positions / where a site ranks → use rank_check_direct\n- User asks about backlinks / link profile / who links to a domain → use backlink_check\n- User asks about AI Overviews / AI citations / SGE presence → use ai_overview_check\n- User asks about website traffic / monthly visitors / audience → use traffic_data\n- User asks about keyword volume / search demand / CPC / difficulty → use keyword_volume\n- User asks about GSC traffic, impressions, clicks, CTR → use gsc_query\n- User asks if a URL is indexed / indexing status / why a page isn't in Google / URL inspection → use gsc_url_inspect\n- User asks about website analytics, sessions, pageviews → use ga4_query\n- User asks about Google Business Profile / reviews → use gmb_query\n- User asks about search trends → use trends_query\n- User asks about page speed / Core Web Vitals / LCP / CLS / performance score / Lighthouse → use pagespeed_query\n- User asks about Bing clicks, impressions, queries, or Bing organic performance → use bing_webmaster_query\n\nIMPORTANT: Only call the tool that matches what the user asked. Do not call multiple tools unless explicitly asked.\nrank_check_direct, backlink_check, ai_overview_check, traffic_data, keyword_volume, trends_query, and pagespeed_query need no connection — call them directly with the URL or domain.\nFor GSC/GA4/GMB/Bing: call list_connections first, then the query tool.\n\nCRITICAL: If a tool returns an error stating that the user has multiple connections, YOU MUST stop and explicitly ask the user which connection they want to use, listing the available options provided in the error message.",
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
    const forwarded = request.headers.get("x-forwarded-host");
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    const mcpBase = forwarded ? `${proto}://${forwarded}` : BASE;
    return new NextResponse(
      JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32001, message: "Unauthorized" } }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "WWW-Authenticate": `Bearer resource_metadata="${mcpBase}/.well-known/oauth-protected-resource"`,
        },
      }
    );
  }

  if (method === "tools/call") {
    const toolName = params.name as string;
    const toolArgs = (params.arguments ?? {}) as Record<string, unknown>;

    // Check cache first — a hit doesn't consume quota (no external API call)
    const cacheKey = buildCacheKey(user.id, toolName, toolArgs);
    const cached = await getCached(toolName, cacheKey);
    if (cached) return rpcResult(id, cached);

    // Cache miss — check monthly quota before calling external APIs
    const quota = await checkAndIncrementQuota(user.id, user.plan as Plan);
    if (!quota.allowed) {
      const limitStr = quota.limit === -1 ? "unlimited" : quota.limit.toString();
      return rpcResult(id, {
        content: [{
          type: "text",
          text: `Monthly limit reached. You've used ${quota.used} / ${limitStr} AI queries this month. Upgrade your plan or wait until next month for your quota to reset.`,
        }],
      });
    }

    try {
      const result = await executeTool(toolName, toolArgs, user);
      setCached(toolName, cacheKey, result); // fire-and-forget, doesn't delay response
      return rpcResult(id, result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return rpcError(id, -32000, `Tool error: ${msg}`);
    }
  }

  return rpcError(id, -32601, `Method not found: ${method}`);
}
