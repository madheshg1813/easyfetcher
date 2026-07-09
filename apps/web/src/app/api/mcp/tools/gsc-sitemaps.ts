import { google } from "googleapis";
import type { McpTool, Connection, TextFn } from "./types";

export const gscSitemapsTool: McpTool = {
  name: "gsc_sitemaps",
  description:
    "Check sitemap health for a GSC property. Returns all submitted sitemaps with: " +
    "how many URLs were submitted vs how many Google actually indexed, last crawl date, " +
    "errors, warnings, and whether Google is still processing it. " +
    "Use this when a user asks: 'How many pages are indexed?', 'Why aren't all my pages indexed?', " +
    "'Check my sitemap', 'Is Google crawling my site?', 'Show indexing coverage'. " +
    "Requires a connected GSC account.",
  inputSchema: {
    type: "object",
    properties: {
      site_url: {
        type: "string",
        description: "GSC site URL or label. Required if you have multiple GSC sites connected.",
      },
    },
    required: [],
  },
};

export async function executeGscSitemaps(
  args: Record<string, unknown>,
  conn: Connection,
  text: TextFn,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  makeOAuth2Client: (a: string, r: string | null, e: Date | null) => any
) {
  if (!conn.siteUrl) return text("GSC connected but no site URL found. Try re-authenticating.");

  let authClient: ReturnType<typeof makeOAuth2Client>;
  try {
    authClient = makeOAuth2Client(conn.accessToken, conn.refreshToken, conn.expiresAt);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return text(`Token decryption failed: ${msg}. Try reconnecting GSC from your EasyFetcher dashboard.`);
  }

  const sc = google.webmasters({ version: "v3", auth: authClient });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sitemaps: any[] = [];
  try {
    const res = await sc.sitemaps.list({ siteUrl: conn.siteUrl });
    sitemaps = res.data.sitemap ?? [];
  } catch (err: unknown) {
    const gErr = err as { response?: { data?: { error?: { message?: string; status?: string } } }; message?: string };
    const apiMsg = gErr?.response?.data?.error?.message ?? gErr?.message ?? String(err);
    const status = gErr?.response?.data?.error?.status ?? "";
    if (status === "PERMISSION_DENIED" || apiMsg.includes("403"))
      return text(`No access to ${conn.siteUrl}. Re-connect GSC from your EasyFetcher dashboard.`);
    if (status === "UNAUTHENTICATED" || apiMsg.includes("401"))
      return text(`GSC token expired. Re-connect GSC from your EasyFetcher dashboard.`);
    return text(`GSC Sitemaps API error: ${apiMsg}`);
  }

  if (sitemaps.length === 0) {
    return text(
      `No sitemaps submitted for ${conn.label ?? conn.siteUrl}.\n\n` +
      `To fix this: Go to Google Search Console → Sitemaps → Submit your sitemap URL (usually /sitemap.xml).`
    );
  }

  const lines: string[] = [];
  lines.push(`🗺️ **Sitemap Report for ${conn.label ?? conn.siteUrl}**`);
  lines.push(`${sitemaps.length} sitemap${sitemaps.length !== 1 ? "s" : ""} found\n`);

  let totalSubmitted = 0;
  let totalIndexed = 0;

  for (const sm of sitemaps) {
    const path: string = sm.path ?? "unknown";
    const lastDownloaded: string | null = sm.lastDownloaded ?? null;
    const lastSubmitted: string | null = sm.lastSubmitted ?? null;
    const isPending: boolean = sm.isPending ?? false;
    const isSitemapsIndex: boolean = sm.isSitemapsIndex ?? false;
    const errors: number = Number(sm.errors ?? 0);
    const warnings: number = Number(sm.warnings ?? 0);

    // Status emoji
    let statusEmoji = "✅";
    if (isPending) statusEmoji = "⏳";
    else if (errors > 0) statusEmoji = "❌";
    else if (warnings > 0) statusEmoji = "⚠️";

    const sitemapType = isSitemapsIndex ? " [index]" : "";
    lines.push(`${statusEmoji} **${path}**${sitemapType}`);

    if (isPending) {
      lines.push(`   Status: Still being processed by Google`);
    }

    // Per-type submitted vs indexed breakdown
    const contents: Array<{ type?: string; submitted?: string; indexed?: string }> = sm.contents ?? [];
    let smSubmitted = 0;
    let smIndexed = 0;

    if (contents.length > 0) {
      for (const c of contents) {
        const sub = Number(c.submitted ?? 0);
        const idx = Number(c.indexed ?? 0);
        smSubmitted += sub;
        smIndexed += idx;
        const pct = sub > 0 ? Math.round((idx / sub) * 100) : 0;
        const bar = buildBar(pct);
        lines.push(`   ${c.type ?? "WEB"}: ${idx.toLocaleString()} / ${sub.toLocaleString()} indexed ${bar} ${pct}%`);
      }
    }

    totalSubmitted += smSubmitted;
    totalIndexed += smIndexed;

    if (lastDownloaded) {
      const d = new Date(lastDownloaded);
      const daysAgo = Math.floor((Date.now() - d.getTime()) / 86400000);
      const label = daysAgo === 0 ? "today" : daysAgo === 1 ? "yesterday" : `${daysAgo} days ago`;
      lines.push(`   Last crawled: ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} (${label})`);

      // Warn if Google hasn't crawled in > 7 days
      if (daysAgo > 7) {
        lines.push(`   ⚠️ Google hasn't recrawled this sitemap in ${daysAgo} days — check for crawl budget issues`);
      }
    } else if (lastSubmitted) {
      lines.push(`   Submitted: ${new Date(lastSubmitted).toLocaleDateString()} — not yet crawled`);
    }

    if (errors > 0)   lines.push(`   ❌ ${errors} error${errors !== 1 ? "s" : ""} — open GSC → Sitemaps for details`);
    if (warnings > 0) lines.push(`   ⚠️ ${warnings} warning${warnings !== 1 ? "s" : ""}`);

    lines.push("");
  }

  // Summary
  if (totalSubmitted > 0) {
    const overallPct = Math.round((totalIndexed / totalSubmitted) * 100);
    const gap = totalSubmitted - totalIndexed;
    lines.push(`---`);
    lines.push(`📊 **Overall: ${totalIndexed.toLocaleString()} / ${totalSubmitted.toLocaleString()} URLs indexed (${overallPct}%)**`);

    if (gap > 0) {
      lines.push(`⚠️ ${gap.toLocaleString()} URLs submitted but not indexed.`);
      if (overallPct < 50) {
        lines.push(`   This is a significant gap. Common causes:`);
        lines.push(`   • Pages blocked by robots.txt or noindex meta tag`);
        lines.push(`   • Thin / duplicate content`);
        lines.push(`   • Crawl budget exhausted — site may be too large`);
        lines.push(`   • Pages are too new (Google hasn't gotten to them yet)`);
        lines.push(`\n   Use gsc_url_inspect on specific pages to diagnose individual URLs.`);
      } else if (overallPct < 80) {
        lines.push(`   Use gsc_url_inspect on your most important unindexed pages to find the cause.`);
      }
    } else if (overallPct === 100) {
      lines.push(`✅ All submitted URLs are indexed — great sitemap health!`);
    }
  }

  return text(lines.join("\n"));
}

function buildBar(pct: number): string {
  const filled = Math.round(pct / 10);
  return "[" + "█".repeat(filled) + "░".repeat(10 - filled) + "]";
}
