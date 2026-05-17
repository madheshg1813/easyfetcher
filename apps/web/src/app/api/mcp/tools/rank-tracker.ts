import { checkKeywordRanks } from "@/lib/apify";
import type { McpTool, TextFn } from "./types";

export const rankCheckDirectTool: McpTool = {
  name: "rank_check_direct",
  description: "Check Google search rankings for specific keywords on a domain RIGHT NOW. Pass the domain and keywords directly — no setup needed. Takes ~30-60 seconds per keyword. Always use this when a user asks to check keyword rankings and provides a domain + keywords.",
  inputSchema: {
    type: "object",
    properties: {
      domain: { type: "string", description: "The domain to check rankings for, e.g. 'amitservices.in' or 'https://www.amitservices.in/'" },
      keywords: {
        type: "array",
        items: { type: "string" },
        description: "List of keywords to check rankings for",
      },
      location: {
        type: "string",
        description: "Country/location for search results. Options: 'United States', 'United Kingdom', 'India', 'Canada', 'Australia', 'Germany', 'France', 'Singapore'. Default: 'United States'",
      },
    },
    required: ["domain", "keywords"],
  },
};

export async function executeRankCheckDirect(
  domain: string,
  keywords: string[],
  location: string = "United States",
  text: TextFn
) {
  if (keywords.length === 0) return text("Please provide at least one keyword.");
  if (keywords.length > 10) return text("Maximum 10 keywords per direct check. Use keyword lists for larger sets.");

  const results = await checkKeywordRanks(domain, keywords, location);

  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  const ranked = results.filter((r) => r.rank !== null).sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  const notRanked = results.filter((r) => r.rank === null);

  let out = `**Keyword rankings for ${cleanDomain}** (${location}):\n\n`;

  if (ranked.length > 0) {
    out += `**Ranked (top 50):**\n`;
    out += ranked.map((r) => `  #${r.rank} — "${r.keyword}"\n       ${r.rankUrl ?? ""}`).join("\n") + "\n\n";
  }
  if (notRanked.length > 0) {
    out += `**Not ranked in top 50:**\n`;
    out += notRanked.map((r) => `  • "${r.keyword}"`).join("\n");
  }

  return text(out.trim());
}
