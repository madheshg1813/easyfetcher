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
  description: "Check how many times a domain is cited in Google AI Overviews, Google AI Mode, ChatGPT, Perplexity, and Gemini. Use when user asks about AI visibility, AI citations, SGE presence, or brand mentions in AI answers.",
  inputSchema: {
    type: "object",
    properties: {
      domain: { type: "string", description: "Domain to check, e.g. 'amitservices.in'" },
      country: { type: "string", description: "Country code. Options: 'us', 'in', 'gb', 'ca', 'au'. Default: 'in'" },
    },
    required: ["domain"],
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

export async function executeBacklinkCheck(domain: string, country = "in", text: TextFn) {
  const result = await checkBacklinks(domain, country);

  let out = `**Backlink report for ${result.domain}**\n\n`;
  out += `• Total backlinks: ${result.totalBacklinks?.toLocaleString() ?? "N/A"}\n`;
  out += `• Referring domains: ${result.referringDomains?.toLocaleString() ?? "N/A"}\n`;
  out += `• Domain authority: ${result.domainAuthority ?? "N/A"}\n`;
  out += `• Page authority: ${result.pageAuthority ?? "N/A"}\n`;

  if (result.backlinksHistory.length > 0) {
    out += `\n**Backlink history (last 6 months):**\n`;
    out += result.backlinksHistory.map(
      (h) => `  • ${h.date}: ${h.backlinks} total (+${h.new} new, -${h.lost} lost)`
    ).join("\n");
  }

  if (result.topBacklinks.length > 0) {
    out += `\n\n**Top referring domains (${result.topBacklinks.length} links):**\n`;
    out += result.topBacklinks.map((b) => {
      const rel = b.rel === "nofollow" ? " [nofollow]" : "";
      const status = b.status === "lost" ? " ❌ lost" : "";
      const anchor = b.anchorText ? ` — "${b.anchorText}"` : "";
      return `  • ${b.originDomain}${rel}${status}${anchor}\n    ↳ ${b.originUrl}`;
    }).join("\n");
  }

  return text(out.trim());
}

export async function executeAiOverviewCheck(domain: string, country = "in", text: TextFn) {
  const result = await checkAiOverviews(domain, country);

  let out = `**AI Overview & Citations for ${result.domain}**\n\n`;
  out += `• Google AI citations: ${result.aiCitations ?? "N/A"}\n`;
  out += `• Google AI Mode citations: ${result.aimodeCitations ?? "N/A"}\n`;
  out += `• ChatGPT citations: ${result.chatgptCitations ?? "N/A"}\n`;
  out += `• Perplexity citations: ${result.perplexityCitations ?? "N/A"}\n`;
  out += `• Gemini citations: ${result.geminiCitations ?? "N/A"}\n`;
  out += `• AI Overview traffic: ${result.totalAiOverviewTraffic?.toLocaleString() ?? "N/A"} visits/month\n`;

  return text(out.trim());
}

export async function executeTrafficData(domain: string, country = "worldwide", text: TextFn) {
  const result = await checkTrafficData(domain, country);

  let out = `**Traffic data for ${result.domain}**\n\n`;
  out += `• Organic traffic: ${result.organicTraffic?.toLocaleString() ?? "N/A"} visits/month\n`;
  out += `• Paid traffic: ${result.paidTraffic?.toLocaleString() ?? "N/A"} visits/month\n`;
  out += `• Organic keywords: ${result.organicKeywords?.toLocaleString() ?? "N/A"}\n`;

  if (result.topCountries.length > 0) {
    out += `\n**Top countries:**\n`;
    out += result.topCountries.map((c) => `  • ${c.country}: ${c.traffic.toLocaleString()} visits (${c.share}%)`).join("\n");
  }

  return text(out.trim());
}

export async function executeKeywordVolume(keywords: string[], country = "in", text: TextFn) {
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
