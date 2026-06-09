import type { McpTool, TextFn } from "./types";

export const pagespeedTool: McpTool = {
  name: "pagespeed_query",
  description:
    "Check PageSpeed / Core Web Vitals for any URL using Google Lighthouse. Returns performance score, LCP, CLS, FCP, TBT, Speed Index, and top improvement opportunities. No connection required — pass any public URL directly.",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The full URL to analyze, e.g. 'https://www.example.com' or 'https://www.example.com/page'",
      },
      strategy: {
        type: "string",
        enum: ["mobile", "desktop"],
        description: "Device type to test. Default: mobile (Google ranks on mobile-first).",
      },
    },
    required: ["url"],
  },
};

export async function executePagespeedTool(
  url: string,
  strategy: "mobile" | "desktop" = "mobile",
  text: TextFn
) {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) return text("PageSpeed API key not configured. Please contact EasyFetcher support.");

  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${apiKey}`;

  let data: PagespeedResponse;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    const res = await fetch(endpoint, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
      throw new Error(err?.error?.message ?? `API error ${res.status}`);
    }
    data = await res.json() as PagespeedResponse;
  } catch (err) {
    if ((err as Error).name === "AbortError") return text("PageSpeed request timed out after 30s. Try again.");
    return text(`PageSpeed API error: ${(err as Error).message}`);
  }

  const cats = data.lighthouseResult?.categories;
  const audits = data.lighthouseResult?.audits ?? {};

  const score = Math.round((cats?.performance?.score ?? 0) * 100);
  const scoreLabel = score >= 90 ? "🟢 Good" : score >= 50 ? "🟡 Needs improvement" : "🔴 Poor";

  const metric = (key: string) => {
    const a = audits[key];
    if (!a) return "N/A";
    return a.displayValue ?? "N/A";
  };

  const ratingOf = (key: string) => {
    const r = audits[key]?.score;
    if (r === null || r === undefined) return "";
    return r >= 0.9 ? " ✅" : r >= 0.5 ? " ⚠️" : " ❌";
  };

  // Top opportunities (audits with significant savings)
  const opportunities = Object.values(audits)
    .filter((a) => a.details?.type === "opportunity" && (a.details?.overallSavingsMs ?? 0) > 200)
    .sort((a, b) => (b.details?.overallSavingsMs ?? 0) - (a.details?.overallSavingsMs ?? 0))
    .slice(0, 5)
    .map((a) => `  • ${a.title} (~${Math.round((a.details?.overallSavingsMs ?? 0) / 100) / 10}s savings)`)
    .join("\n");

  let out = `**PageSpeed Report** — ${url}\n`;
  out += `Strategy: ${strategy} | ${new Date().toLocaleDateString()}\n\n`;
  out += `**Performance Score: ${score}/100** ${scoreLabel}\n\n`;
  out += `**Core Web Vitals:**\n`;
  out += `  • LCP (Largest Contentful Paint): ${metric("largest-contentful-paint")}${ratingOf("largest-contentful-paint")}\n`;
  out += `  • CLS (Cumulative Layout Shift):  ${metric("cumulative-layout-shift")}${ratingOf("cumulative-layout-shift")}\n`;
  out += `  • FCP (First Contentful Paint):   ${metric("first-contentful-paint")}${ratingOf("first-contentful-paint")}\n`;
  out += `  • TBT (Total Blocking Time):      ${metric("total-blocking-time")}${ratingOf("total-blocking-time")}\n`;
  out += `  • Speed Index:                    ${metric("speed-index")}${ratingOf("speed-index")}\n`;

  if (opportunities) {
    out += `\n**Top Improvement Opportunities:**\n${opportunities}`;
  }

  return text(out.trim());
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PagespeedAudit {
  title: string;
  score: number | null;
  displayValue?: string;
  details?: {
    type?: string;
    overallSavingsMs?: number;
  };
}

interface PagespeedResponse {
  lighthouseResult?: {
    categories?: {
      performance?: { score: number };
    };
    audits?: Record<string, PagespeedAudit>;
  };
}
