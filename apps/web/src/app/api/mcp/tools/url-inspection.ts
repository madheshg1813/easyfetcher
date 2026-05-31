import { google } from "googleapis";
import type { McpTool, Connection, TextFn } from "./types";

// ─── Tool descriptor ──────────────────────────────────────────────────────────
export const urlInspectionTool: McpTool = {
  name: "gsc_url_inspect",
  description:
    "Inspect a specific URL using the Google Search Console URL Inspection API. " +
    "Returns indexing status (INDEXED / NOT_INDEXED / EXCLUDED), last crawl date, " +
    "canonical URL (Google-selected vs user-declared), mobile usability issues, " +
    "rich result eligibility & errors, and AMP status. " +
    "Use this when a user asks: 'Is this URL indexed?', 'Why isn't this page in Google?', " +
    "'Check the indexing status of X', 'What does GSC say about this URL?'. " +
    "Requires a connected GSC account. The URL must belong to the connected GSC property.",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description:
          "The full page URL to inspect (e.g. https://example.com/blog/post). Must belong to the connected GSC property.",
      },
      workspace_name: {
        type: "string",
        description: "Workspace name. Required if you have multiple workspaces.",
      },
      site_url: {
        type: "string",
        description:
          "GSC site URL or label. Required if your workspace has multiple GSC sites connected.",
      },
    },
    required: ["url"],
  },
};

// ─── Executor ─────────────────────────────────────────────────────────────────
export async function executeUrlInspection(
  args: Record<string, unknown>,
  conn: Connection,
  text: TextFn,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  makeOAuth2Client: (a: string, r: string | null, e: Date | null) => any
) {
  const inspectionUrl = typeof args.url === "string" ? args.url.trim() : "";
  if (!inspectionUrl) return text("url argument is required.");
  if (!conn.siteUrl)
    return text("GSC connected but no site URL found. Try re-authenticating.");

  // Build OAuth2 client
  let authClient: ReturnType<typeof makeOAuth2Client>;
  try {
    authClient = makeOAuth2Client(conn.accessToken, conn.refreshToken, conn.expiresAt);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[url-inspection] token decrypt failed:", msg);
    return text(
      `Token decryption failed: ${msg}. Try reconnecting GSC from your EasyFetcher dashboard.`
    );
  }

  // Call the URL Inspection API
  const sc = google.searchconsole({ version: "v1", auth: authClient });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any;
  try {
    const res = await sc.urlInspection.index.inspect({
      requestBody: {
        inspectionUrl,
        siteUrl: conn.siteUrl,
      },
    });
    data = res.data;
  } catch (err: unknown) {
    const gErr = err as {
      response?: { data?: { error?: { message?: string; status?: string } } };
      message?: string;
    };
    const apiMsg =
      gErr?.response?.data?.error?.message ?? gErr?.message ?? String(err);
    const status = gErr?.response?.data?.error?.status ?? "";
    console.error("[url-inspection] API error:", apiMsg);

    if (status === "PERMISSION_DENIED" || apiMsg.includes("403")) {
      return text(
        `Google account does not have access to ${conn.siteUrl}. Re-connect GSC from your EasyFetcher dashboard.`
      );
    }
    if (
      status === "UNAUTHENTICATED" ||
      apiMsg.includes("401") ||
      apiMsg.toLowerCase().includes("invalid credentials")
    ) {
      return text(
        `GSC token expired or revoked. Re-connect GSC from your EasyFetcher dashboard.`
      );
    }
    if (apiMsg.toLowerCase().includes("not found") || apiMsg.includes("404")) {
      return text(
        `URL not found in property "${conn.siteUrl}". Make sure the URL belongs to this GSC property.`
      );
    }
    return text(`GSC URL Inspection API error: ${apiMsg}`);
  }

  const result = data?.inspectionResult;
  if (!result) return text("No inspection result returned by Google.");

  const lines: string[] = [];
  lines.push(`🔍 **URL Inspection Report**`);
  lines.push(`**URL:** ${inspectionUrl}`);
  lines.push(`**GSC Property:** ${conn.label ?? conn.siteUrl}`);
  lines.push("");

  // ── Index status ────────────────────────────────────────────────────────────
  const idx = result.indexStatusResult;
  if (idx) {
    const statusEmoji: Record<string, string> = {
      FULL: "✅",
      NOT_INDEXED: "❌",
      EXCLUDED: "⚠️",
      NEUTRAL: "ℹ️",
    };
    const verdict = idx.verdict ?? "UNKNOWN";
    const emoji = statusEmoji[verdict] ?? "❓";
    lines.push(`## ${emoji} Indexing Status: ${verdict}`);

    if (idx.coverageState) lines.push(`**Coverage State:** ${idx.coverageState}`);
    if (idx.lastCrawlTime) {
      const crawlDate = new Date(idx.lastCrawlTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      lines.push(`**Last Crawled:** ${crawlDate}`);
    }
    if (idx.crawledAs) lines.push(`**Crawled As:** ${idx.crawledAs}`);
    if (idx.googleCanonical) lines.push(`**Google-Selected Canonical:** ${idx.googleCanonical}`);
    if (idx.userCanonical) lines.push(`**User-Declared Canonical:** ${idx.userCanonical}`);
    if (idx.robotsTxtState) lines.push(`**Robots.txt:** ${idx.robotsTxtState}`);
    if (idx.indexingState) lines.push(`**Indexing Allowed:** ${idx.indexingState}`);
    if (idx.pageFetchState) lines.push(`**Page Fetch:** ${idx.pageFetchState}`);

    if (idx.sitemap && idx.sitemap.length > 0) {
      lines.push(`**In Sitemaps:** ${idx.sitemap.join(", ")}`);
    }
    if (idx.referringUrls && idx.referringUrls.length > 0) {
      lines.push(`**Referring URLs (discovered via):** ${idx.referringUrls.slice(0, 3).join(", ")}`);
    }
    lines.push("");
  }

  // ── Mobile usability ─────────────────────────────────────────────────────────
  const mob = result.mobileUsabilityResult;
  if (mob) {
    const mobVerdict = mob.verdict ?? "UNKNOWN";
    const mobEmoji = mobVerdict === "PASS" ? "✅" : mobVerdict === "FAIL" ? "❌" : "ℹ️";
    lines.push(`## ${mobEmoji} Mobile Usability: ${mobVerdict}`);

    if (mob.issues && mob.issues.length > 0) {
      lines.push("**Issues:**");
      for (const issue of mob.issues) {
        lines.push(`  • ${issue.issueType ?? issue} — ${issue.message ?? ""}`);
      }
    }
    lines.push("");
  }

  // ── Rich results ─────────────────────────────────────────────────────────────
  const rich = result.richResultsResult;
  if (rich) {
    const richVerdict = rich.verdict ?? "UNKNOWN";
    const richEmoji = richVerdict === "PASS" ? "✅" : richVerdict === "FAIL" ? "❌" : "ℹ️";
    lines.push(`## ${richEmoji} Rich Results: ${richVerdict}`);

    if (rich.detectedItems && rich.detectedItems.length > 0) {
      for (const item of rich.detectedItems) {
        lines.push(`**Type:** ${item.richResultType ?? "Unknown"}`);
        if (item.items && item.items.length > 0) {
          for (const i of item.items) {
            if (i.issues && i.issues.length > 0) {
              for (const iss of i.issues) {
                const sev = iss.severity ?? "INFO";
                const issEmoji = sev === "ERROR" ? "❌" : sev === "WARNING" ? "⚠️" : "ℹ️";
                lines.push(`  ${issEmoji} [${sev}] ${iss.issueMessage ?? iss}`);
              }
            }
          }
        }
      }
    }
    lines.push("");
  }

  // ── AMP ──────────────────────────────────────────────────────────────────────
  const amp = result.ampResult;
  if (amp) {
    const ampVerdict = amp.verdict ?? "UNKNOWN";
    const ampEmoji = ampVerdict === "PASS" ? "✅" : ampVerdict === "FAIL" ? "❌" : "ℹ️";
    lines.push(`## ${ampEmoji} AMP Status: ${ampVerdict}`);
    if (amp.issues && amp.issues.length > 0) {
      for (const issue of amp.issues) {
        lines.push(`  • ${issue.issueMessage ?? issue}`);
      }
    }
    lines.push("");
  }

  return text(lines.join("\n"));
}
