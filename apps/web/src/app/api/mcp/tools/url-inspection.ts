import { google } from "googleapis";
import type { McpTool, Connection, TextFn } from "./types";

export const urlInspectionTool: McpTool = {
  name: "gsc_url_inspect",
  description:
    "Inspect one or multiple URLs using the Google Search Console URL Inspection API. " +
    "For each URL returns: indexing status (INDEXED / NOT_INDEXED / EXCLUDED), last crawl date, " +
    "canonical URL, mobile usability issues, rich result eligibility, and AMP status. " +
    "Use this when a user asks: 'Is this URL indexed?', 'Why isn't this page in Google?', " +
    "'Check indexing status of these pages', 'Audit my blog posts for indexing issues'. " +
    "Pass a single url or a urls array (up to 10). Requires a connected GSC account.",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "Single URL to inspect (e.g. https://example.com/blog/post).",
      },
      urls: {
        type: "array",
        items: { type: "string" },
        description: "Multiple URLs to inspect in one call (max 10). Use instead of url for batch checks.",
      },
      site_url: {
        type: "string",
        description: "GSC site URL or label. Required if you have multiple GSC sites connected.",
      },
    },
    required: [],
  },
};

// ─── Single URL inspection ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function inspectOne(sc: any, inspectionUrl: string, siteUrl: string): Promise<{
  url: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any;
  error?: string;
}> {
  try {
    const res = await sc.urlInspection.index.inspect({
      requestBody: { inspectionUrl, siteUrl },
    });
    return { url: inspectionUrl, result: res.data?.inspectionResult };
  } catch (err: unknown) {
    const gErr = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
    const msg = gErr?.response?.data?.error?.message ?? gErr?.message ?? String(err);
    return { url: inspectionUrl, result: null, error: msg };
  }
}

// ─── Format a single inspection result into lines ─────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatResult(url: string, result: any, error?: string): string[] {
  const lines: string[] = [];

  if (error) {
    lines.push(`❓ **${url}**`);
    lines.push(`   Error: ${error}`);
    return lines;
  }

  if (!result) {
    lines.push(`❓ **${url}** — No result returned`);
    return lines;
  }

  const idx = result.indexStatusResult;
  const verdict = idx?.verdict ?? "UNKNOWN";
  const statusEmoji: Record<string, string> = { FULL: "✅", NOT_INDEXED: "❌", EXCLUDED: "⚠️", NEUTRAL: "ℹ️" };
  const emoji = statusEmoji[verdict] ?? "❓";

  lines.push(`${emoji} **${url}**`);
  lines.push(`   Status: **${verdict}**${idx?.coverageState ? ` — ${idx.coverageState}` : ""}`);

  if (idx?.lastCrawlTime) {
    const d = new Date(idx.lastCrawlTime);
    const daysAgo = Math.floor((Date.now() - d.getTime()) / 86400000);
    lines.push(`   Last crawled: ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} (${daysAgo === 0 ? "today" : daysAgo === 1 ? "yesterday" : `${daysAgo}d ago`})`);
  } else {
    lines.push(`   Last crawled: never`);
  }

  if (idx?.robotsTxtState && idx.robotsTxtState !== "ALLOWED")
    lines.push(`   ⚠️ Robots.txt: ${idx.robotsTxtState}`);
  if (idx?.indexingState && idx.indexingState !== "INDEXING_ALLOWED")
    lines.push(`   ⚠️ Indexing: ${idx.indexingState}`);
  if (idx?.pageFetchState && idx.pageFetchState !== "SUCCESSFUL")
    lines.push(`   ⚠️ Page fetch: ${idx.pageFetchState}`);

  const googleCanon = idx?.googleCanonical;
  const userCanon   = idx?.userCanonical;
  if (googleCanon && userCanon && googleCanon !== userCanon) {
    lines.push(`   ⚠️ Canonical mismatch:`);
    lines.push(`      You declared: ${userCanon}`);
    lines.push(`      Google chose:  ${googleCanon}`);
  } else if (googleCanon) {
    lines.push(`   Canonical: ${googleCanon}`);
  }

  // Mobile
  const mob = result.mobileUsabilityResult;
  if (mob?.verdict && mob.verdict !== "PASS") {
    lines.push(`   📱 Mobile: ${mob.verdict}${mob.issues?.length ? ` — ${mob.issues.map((i: {issueType?: string}) => i.issueType).join(", ")}` : ""}`);
  }

  // Rich results
  const rich = result.richResultsResult;
  if (rich?.verdict && rich.verdict !== "PASS") {
    lines.push(`   🎯 Rich results: ${rich.verdict}`);
  }

  return lines;
}

// ─── Executor ─────────────────────────────────────────────────────────────────
export async function executeUrlInspection(
  args: Record<string, unknown>,
  conn: Connection,
  text: TextFn,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  makeOAuth2Client: (a: string, r: string | null, e: Date | null) => any
) {
  if (!conn.siteUrl) return text("GSC connected but no site URL found. Try re-authenticating.");

  // Collect URLs — support single `url` or array `urls`
  const rawUrls: string[] = [];
  if (typeof args.url === "string" && args.url.trim()) {
    rawUrls.push(args.url.trim());
  }
  if (Array.isArray(args.urls)) {
    for (const u of args.urls) {
      if (typeof u === "string" && u.trim()) rawUrls.push(u.trim());
    }
  }
  if (rawUrls.length === 0) return text("Provide url (single) or urls (array) to inspect.");

  const urls = [...new Set(rawUrls)].slice(0, 10); // dedupe, max 10
  const capped = rawUrls.length > 10;

  let authClient: ReturnType<typeof makeOAuth2Client>;
  try {
    authClient = makeOAuth2Client(conn.accessToken, conn.refreshToken, conn.expiresAt);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return text(`Token decryption failed: ${msg}. Try reconnecting GSC from your EasyFetcher dashboard.`);
  }

  const sc = google.searchconsole({ version: "v1", auth: authClient });

  // Run all inspections in parallel
  const results = await Promise.all(
    urls.map((u) => inspectOne(sc, u, conn.siteUrl!))
  );

  const lines: string[] = [];

  if (urls.length === 1) {
    // ── Single URL: full detailed report ─────────────────────────────────────
    const { url, result, error } = results[0];
    if (error) return text(`GSC URL Inspection error: ${error}`);
    if (!result) return text("No inspection result returned by Google.");

    lines.push(`🔍 **URL Inspection Report**`);
    lines.push(`**URL:** ${url}`);
    lines.push(`**GSC Property:** ${conn.label ?? conn.siteUrl}`);
    lines.push("");

    const idx = result.indexStatusResult;
    if (idx) {
      const statusEmoji: Record<string, string> = { FULL: "✅", NOT_INDEXED: "❌", EXCLUDED: "⚠️", NEUTRAL: "ℹ️" };
      const verdict = idx.verdict ?? "UNKNOWN";
      lines.push(`## ${statusEmoji[verdict] ?? "❓"} Indexing Status: ${verdict}`);
      if (idx.coverageState)  lines.push(`**Coverage State:** ${idx.coverageState}`);
      if (idx.lastCrawlTime) {
        const d = new Date(idx.lastCrawlTime);
        const daysAgo = Math.floor((Date.now() - d.getTime()) / 86400000);
        lines.push(`**Last Crawled:** ${d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} (${daysAgo === 0 ? "today" : `${daysAgo} days ago`})`);
      }
      if (idx.crawledAs)       lines.push(`**Crawled As:** ${idx.crawledAs}`);
      if (idx.robotsTxtState)  lines.push(`**Robots.txt:** ${idx.robotsTxtState}`);
      if (idx.indexingState)   lines.push(`**Indexing Allowed:** ${idx.indexingState}`);
      if (idx.pageFetchState)  lines.push(`**Page Fetch:** ${idx.pageFetchState}`);

      const googleCanon = idx.googleCanonical;
      const userCanon   = idx.userCanonical;
      if (googleCanon) lines.push(`**Google-Selected Canonical:** ${googleCanon}`);
      if (userCanon)   lines.push(`**User-Declared Canonical:** ${userCanon}`);
      if (googleCanon && userCanon && googleCanon !== userCanon)
        lines.push(`⚠️ **Canonical mismatch** — Google is using a different canonical than declared.`);
      if (idx.sitemap?.length)        lines.push(`**In Sitemaps:** ${idx.sitemap.join(", ")}`);
      if (idx.referringUrls?.length)  lines.push(`**Discovered via:** ${idx.referringUrls.slice(0, 3).join(", ")}`);
      lines.push("");
    }

    const mob = result.mobileUsabilityResult;
    if (mob) {
      const v = mob.verdict ?? "UNKNOWN";
      lines.push(`## ${v === "PASS" ? "✅" : "❌"} Mobile Usability: ${v}`);
      if (mob.issues?.length) {
        for (const i of mob.issues) lines.push(`  • ${i.issueType ?? ""} — ${i.message ?? ""}`);
      }
      lines.push("");
    }

    const rich = result.richResultsResult;
    if (rich) {
      const v = rich.verdict ?? "UNKNOWN";
      lines.push(`## ${v === "PASS" ? "✅" : v === "FAIL" ? "❌" : "ℹ️"} Rich Results: ${v}`);
      for (const item of rich.detectedItems ?? []) {
        lines.push(`**Type:** ${item.richResultType ?? "Unknown"}`);
        for (const ri of item.items ?? []) {
          for (const iss of ri.issues ?? []) {
            const sev = iss.severity ?? "INFO";
            lines.push(`  ${sev === "ERROR" ? "❌" : "⚠️"} [${sev}] ${iss.issueMessage ?? ""}`);
          }
        }
      }
      lines.push("");
    }

    const amp = result.ampResult;
    if (amp) {
      const v = amp.verdict ?? "UNKNOWN";
      lines.push(`## ${v === "PASS" ? "✅" : "❌"} AMP: ${v}`);
      for (const i of amp.issues ?? []) lines.push(`  • ${i.issueMessage ?? ""}`);
    }

  } else {
    // ── Batch: compact summary table ─────────────────────────────────────────
    lines.push(`🔍 **Batch URL Inspection — ${conn.label ?? conn.siteUrl}**`);
    lines.push(`Checked ${urls.length} URL${urls.length !== 1 ? "s" : ""}${capped ? " (limited to 10)" : ""}\n`);

    const indexed    = results.filter(r => r.result?.indexStatusResult?.verdict === "FULL");
    const notIndexed = results.filter(r => r.result?.indexStatusResult?.verdict === "NOT_INDEXED");
    const excluded   = results.filter(r => r.result?.indexStatusResult?.verdict === "EXCLUDED");
    const errors     = results.filter(r => r.error);

    lines.push(`✅ Indexed: ${indexed.length}  ❌ Not indexed: ${notIndexed.length}  ⚠️ Excluded: ${excluded.length}${errors.length ? `  ❓ Errors: ${errors.length}` : ""}\n`);

    for (const r of results) {
      const resultLines = formatResult(r.url, r.result, r.error);
      lines.push(...resultLines);
      lines.push("");
    }

    // Actionable summary
    if (notIndexed.length > 0) {
      lines.push(`---`);
      lines.push(`**${notIndexed.length} URL${notIndexed.length !== 1 ? "s" : ""} not indexed.** Use gsc_url_inspect on each individually for detailed diagnosis.`);
    }
    if (excluded.length > 0) {
      lines.push(`**${excluded.length} URL${excluded.length !== 1 ? "s" : ""} excluded** (noindex, canonical, or duplicate). Check coverage state per URL.`);
    }

    lines.push(`\n_Note: Google's URL Inspection API allows ~2,000 checks/day per property._`);
  }

  return text(lines.join("\n"));
}
