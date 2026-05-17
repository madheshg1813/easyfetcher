import { checkBacklinks, checkAiOverviews, checkTrafficData, checkKeywordVolumes } from "@/lib/seranking";
import type { McpTool, TextFn } from "./types";

// ─── Tool definitions ─────────────────────────────────────────────────────────

export const backlinkCheckTool: McpTool = {
  name: "backlink_check",
  description: "Check backlinks for a domain — total count, referring domains, domain authority, and top referring sites. Use when user asks about backlinks, link profile, or who links to a domain.",
  inputSchema: {
    type: "object",
    properties: {
      domain: { type: "string", description: "Domain to check backlinks for, e.g. 'amitservices.in'" },
      country: { type: "string", description: "Country code for regional data. Options: 'US', 'IN', 'GB', 'CA', 'AU'. Default: 'US'" },
    },
    required: ["domain"],
  },
};

export const aiOverviewTool: McpTool = {
  name: "ai_overview_check",
  description: "Check if a domain appears in Google AI Overviews and AI citations for a keyword. Use when user asks about AI visibility, AI citations, SGE presence, or AI-generated answers.",
  inputSchema: {
    type: "object",
    properties: {
      domain: { type: "string", description: "Domain to check, e.g. 'amitservices.in'" },
      keyword: { type: "string", description: "Keyword to check AI overview presence for" },
      country: { type: "string", description: "Country code. Options: 'US', 'IN', 'GB', 'CA', 'AU'. Default: 'US'" },
    },
    required: ["domain", "keyword"],
  },
};

export const trafficDataTool: McpTool = {
  name: "traffic_data",
  description: "Get estimated website traffic data for a domain — monthly visits, organic vs paid breakdown, top traffic countries, and top pages. Use when user asks about website traffic, visitors, or audience data.",
  inputSchema: {
    type: "object",
    properties: {
      domain: { type: "string", description: "Domain to check traffic for, e.g. 'amitservices.in'" },
      country: { type: "string", description: "Country code for regional data. Options: 'US', 'IN', 'GB', 'CA', 'AU'. Default: 'US'" },
    },
    required: ["domain"],
  },
};

export const keywordVolumeTool: McpTool = {
  name: "keyword_volume",
  description: "Get search volume, CPC, competition, and keyword difficulty for one or more keywords. Use when user asks about keyword volume, search demand, CPC, or keyword difficulty.",
  inputSchema: {
    type: "object",
    properties: {
      keywords: {
        type: "array",
        items: { type: "string" },
        description: "Keywords to get volume data for (max 5 per call)",
      },
      country: { type: "string", description: "Country code. Options: 'US', 'IN', 'GB', 'CA', 'AU'. Default: 'US'" },
    },
    required: ["keywords"],
  },
};

// ─── Executors ────────────────────────────────────────────────────────────────

export async function executeBacklinkCheck(domain: string, country = "US", text: TextFn) {
  const result = await checkBacklinks(domain, country);

  let out = `**Backlink report for ${result.domain}**\n\n`;
  out += `• Total backlinks: ${result.totalBacklinks?.toLocaleString() ?? "N/A"}\n`;
  out += `• Referring domains: ${result.referringDomains?.toLocaleString() ?? "N/A"}\n`;
  out += `• Domain authority: ${result.domainAuthority ?? "N/A"}\n`;

  if (result.topReferrers.length > 0) {
    out += `\n**Top referring domains:**\n`;
    out += result.topReferrers.map((r) => `  • ${r.domain} (${r.backlinks} links)`).join("\n");
  }

  return text(out.trim());
}

export async function executeAiOverviewCheck(domain: string, keyword: string, country = "US", text: TextFn) {
  const result = await checkAiOverviews(domain, keyword, country);

  let out = `**AI Overview check for "${result.keyword}" — ${result.domain}**\n\n`;
  out += `• Appears in AI Overview: ${result.appearsInAiOverview === true ? "Yes" : result.appearsInAiOverview === false ? "No" : "Unknown"}\n`;
  out += `• Estimated AI traffic: ${result.aiTrafficEstimate?.toLocaleString() ?? "N/A"} visits/month\n`;

  if (result.citations.length > 0) {
    out += `\n**AI citations found:**\n`;
    out += result.citations.map((c) => `  • "${c.keyword}" → ${c.url}`).join("\n");
  } else {
    out += `\nNo AI citations found for this keyword.`;
  }

  return text(out.trim());
}

export async function executeTrafficData(domain: string, country = "US", text: TextFn) {
  const result = await checkTrafficData(domain, country);

  let out = `**Traffic data for ${result.domain}**\n\n`;
  out += `• Monthly visits: ${result.monthlyVisits?.toLocaleString() ?? "N/A"}\n`;
  out += `• Organic traffic: ${result.organicTraffic?.toLocaleString() ?? "N/A"}\n`;
  out += `• Paid traffic: ${result.paidTraffic?.toLocaleString() ?? "N/A"}\n`;

  if (result.topCountries.length > 0) {
    out += `\n**Top countries:**\n`;
    out += result.topCountries.map((c) => `  • ${c.country}: ${c.share}%`).join("\n");
  }

  if (result.topPages.length > 0) {
    out += `\n\n**Top pages by traffic:**\n`;
    out += result.topPages.map((p) => `  • ${p.url} — ${p.traffic?.toLocaleString() ?? "N/A"} visits`).join("\n");
  }

  return text(out.trim());
}

export async function executeKeywordVolume(keywords: string[], country = "US", text: TextFn) {
  if (keywords.length === 0) return text("Please provide at least one keyword.");
  if (keywords.length > 5) return text("Maximum 5 keywords per call.");

  const results = await checkKeywordVolumes(keywords, country);

  let out = `**Keyword volume data** (${country}):\n\n`;
  for (const r of results) {
    out += `**"${r.keyword}"**\n`;
    out += `  • Search volume: ${r.searchVolume?.toLocaleString() ?? "N/A"}/month\n`;
    out += `  • CPC: ${r.cpc != null ? `$${r.cpc.toFixed(2)}` : "N/A"}\n`;
    out += `  • Difficulty: ${r.difficulty ?? "N/A"}\n`;
    out += `  • Intent: ${r.intent ?? "N/A"}\n\n`;
  }

  return text(out.trim());
}
