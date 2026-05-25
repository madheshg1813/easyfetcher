import type { McpTool, TextFn } from "./types";

export const trendsTool: McpTool = {
  name: "trends_query",
  description: "Query Google Trends data. No connection required — works for any keyword. metric='interest_over_time' shows search interest trend, 'related_queries' shows related rising/top keywords, 'related_topics' shows related topics.",
  inputSchema: {
    type: "object",
    properties: {
      keyword: { type: "string", description: "The keyword or topic to analyze (e.g. 'LED TV repair Chennai')" },
      metric: { type: "string", enum: ["interest_over_time", "related_queries", "related_topics"], description: "Type of trend data to fetch" },
      geo: { type: "string", description: "Country code (e.g. 'IN' for India, 'US' for USA, '' for worldwide). Default: worldwide" },
      days: { type: "number", description: "Days to look back: 7, 30, 90, 365. Default: 30", default: 30 },
    },
    required: ["keyword", "metric"],
  },
};

export async function executeTrendsTool(
  args: Record<string, unknown>,
  text: TextFn
) {
  const keyword = typeof args.keyword === "string" ? args.keyword : "";
  const metric = typeof args.metric === "string" ? args.metric : "interest_over_time";
  const geo = typeof args.geo === "string" ? args.geo : "";
  const days = typeof args.days === "number" ? args.days : 30;

  if (!keyword) return text("keyword argument is required");

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const googleTrends = require("google-trends-api");

  try {
    if (metric === "interest_over_time") {
      const result = await googleTrends.interestOverTime({
        keyword,
        startTime: startDate,
        endTime: endDate,
        geo: geo || undefined,
      });
      const data = JSON.parse(result);
      const points = data?.default?.timelineData ?? [];
      if (points.length === 0) return text(`No trend data found for "${keyword}".`);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = points.map((p: any) => {
        const date = new Date(p.time * 1000).toISOString().split("T")[0];
        const value = p.value?.[0] ?? 0;
        const bar = "█".repeat(Math.round(value / 10));
        return `${date}: ${String(value).padStart(3)} ${bar}`;
      });

      const avg = Math.round(points.reduce((s: number, p: { value: number[] }) => s + (p.value?.[0] ?? 0), 0) / points.length);
      const peak = Math.max(...points.map((p: { value: number[] }) => p.value?.[0] ?? 0));

      return text(
        `Google Trends: "${keyword}"${geo ? ` (${geo})` : " (worldwide)"} — last ${days} days\n\n` +
        `Average interest: ${avg}/100 | Peak: ${peak}/100\n\n` +
        rows.join("\n")
      );
    }

    if (metric === "related_queries") {
      const result = await googleTrends.relatedQueries({
        keyword,
        startTime: startDate,
        endTime: endDate,
        geo: geo || undefined,
      });
      const data = JSON.parse(result);
      const top = data?.default?.rankedList?.[0]?.rankedKeyword ?? [];
      const rising = data?.default?.rankedList?.[1]?.rankedKeyword ?? [];
      const lines: string[] = [`Related queries for "${keyword}"${geo ? ` (${geo})` : ""}:\n`];
      if (top.length > 0) {
        lines.push("TOP QUERIES:");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        top.slice(0, 10).forEach((q: any, i: number) => lines.push(`  ${i + 1}. ${q.query} (${q.value})`));
      }
      if (rising.length > 0) {
        lines.push("\nRISING QUERIES:");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rising.slice(0, 10).forEach((q: any, i: number) => lines.push(`  ${i + 1}. ${q.query} (+${q.value}%)`));
      }
      if (top.length === 0 && rising.length === 0) return text(`No related queries found for "${keyword}".`);
      return text(lines.join("\n"));
    }

    if (metric === "related_topics") {
      const result = await googleTrends.relatedTopics({
        keyword,
        startTime: startDate,
        endTime: endDate,
        geo: geo || undefined,
      });
      const data = JSON.parse(result);
      const top = data?.default?.rankedList?.[0]?.rankedKeyword ?? [];
      const rising = data?.default?.rankedList?.[1]?.rankedKeyword ?? [];
      const lines: string[] = [`Related topics for "${keyword}"${geo ? ` (${geo})` : ""}:\n`];
      if (top.length > 0) {
        lines.push("TOP TOPICS:");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        top.slice(0, 10).forEach((t: any, i: number) => lines.push(`  ${i + 1}. ${t.topic?.title ?? t.query} — ${t.topic?.type ?? ""} (${t.value})`));
      }
      if (rising.length > 0) {
        lines.push("\nRISING TOPICS:");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rising.slice(0, 10).forEach((t: any, i: number) => lines.push(`  ${i + 1}. ${t.topic?.title ?? t.query} — ${t.topic?.type ?? ""} (+${t.value}%)`));
      }
      if (top.length === 0 && rising.length === 0) return text(`No related topics found for "${keyword}".`);
      return text(lines.join("\n"));
    }

    return text("Unknown trends metric");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return text(`Google Trends error: ${msg}`);
  }
}
