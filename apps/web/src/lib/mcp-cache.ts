import { Redis } from "@upstash/redis";
import { createHash } from "crypto";

// TTLs in seconds per tool. Tools absent from this map are never cached.
const TOOL_TTL: Record<string, number> = {
  gsc_query:             7200,  // 2h
  gsc_url_inspect:       3600,  // 1h
  ga4_query:             7200,  // 2h
  gmb_query:             3600,  // 1h
  pagespeed_query:      14400,  // 4h
  rank_check_direct:     1800,  // 30m — more volatile
  trends_query:          3600,  // 1h
  bing_webmaster_query:  7200,  // 2h
  backlink_check:        3600,  // 1h
  ai_overview_check:     3600,  // 1h
  traffic_data:          3600,  // 1h
  keyword_volume:        7200,  // 2h
  // list_connections intentionally absent — always returns live data
};

type McpResult = { content: { type: string; text: string }[] };

let _redis: Redis | null | undefined = undefined;

function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || url.includes("[your-db-id]") || token === "...") {
    _redis = null;
    return null;
  }
  try {
    _redis = new Redis({ url, token });
    return _redis;
  } catch {
    _redis = null;
    return null;
  }
}

export function buildCacheKey(userId: string, toolName: string, args: Record<string, unknown>): string {
  const argsHash = createHash("sha1").update(JSON.stringify(args)).digest("hex").slice(0, 12);
  return `mcp:v1:${userId}:${toolName}:${argsHash}`;
}

/**
 * Returns a cached result if available, or null on miss / uncacheable tool / Redis not configured.
 * Does NOT fall back to live — caller decides what to do on null.
 */
export async function getCached(toolName: string, cacheKey: string): Promise<McpResult | null> {
  if (!(toolName in TOOL_TTL)) return null;
  const redis = getRedis();
  if (!redis) return null;
  try {
    const cached = await redis.get<McpResult>(cacheKey);
    if (!cached) return null;
    // Prepend a subtle indicator so users know it was served from cache
    const text = cached.content?.[0]?.text ?? "";
    return { content: [{ type: "text", text: `[cached] ${text}` }] };
  } catch {
    return null;
  }
}

/**
 * Stores a result in Redis with the appropriate TTL for the given tool.
 * Fire-and-forget — does not throw.
 */
export function setCached(toolName: string, cacheKey: string, result: McpResult): void {
  const ttl = TOOL_TTL[toolName];
  if (!ttl) return;
  const redis = getRedis();
  if (!redis) return;
  redis.set(cacheKey, result, { ex: ttl }).catch(() => {/* ignore write errors */});
}

/**
 * Invalidates all cached results for a user (call when they disconnect/reconnect a source).
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    let cursor = 0;
    do {
      const [next, keys] = await redis.scan(cursor, { match: `mcp:v1:${userId}:*`, count: 100 });
      cursor = Number(next);
      if (keys.length > 0) await redis.del(...(keys as [string, ...string[]]));
    } while (cursor !== 0);
  } catch {
    // ignore — cache will expire naturally via TTL
  }
}
