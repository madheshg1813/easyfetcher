import { prisma } from "@/lib/db";
import { checkKeywordRanks } from "@/lib/apify";
import type { McpTool, TextFn } from "./types";

export const keywordListsTool: McpTool = {
  name: "keyword_lists",
  description: "List all keyword rank tracking lists for this account — shows domains, keyword counts, location, and when last checked. Call this first to get list IDs before querying ranks.",
  inputSchema: { type: "object", properties: {} },
};

export const keywordRanksTool: McpTool = {
  name: "keyword_ranks",
  description: "Get the latest saved ranking data for a keyword list. Returns positions, ranking URLs, and not-ranked keywords. Use keyword_lists first to get the list ID.",
  inputSchema: {
    type: "object",
    properties: {
      list_id: { type: "string", description: "The ID of the keyword list (from keyword_lists)" },
    },
    required: ["list_id"],
  },
};

export const checkKeywordRanksTool: McpTool = {
  name: "check_keyword_ranks",
  description: "Trigger a fresh Google SERP rank check for a keyword list. Runs live checks via Apify — takes ~1 minute per keyword. Warn the user about the time cost and the number of keywords before running. Returns immediately; call keyword_ranks after ~2 minutes to see results.",
  inputSchema: {
    type: "object",
    properties: {
      list_id: { type: "string", description: "The ID of the keyword list to check (from keyword_lists)" },
    },
    required: ["list_id"],
  },
};

export async function executeKeywordLists(userId: string, text: TextFn) {
  const lists = await prisma.keywordList.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (lists.length === 0) {
    return text("No keyword lists yet. Add some at your EasyFetcher dashboard → SEO Tools → Rank Tracker.");
  }

  const lines = lists.map((l) => {
    const checked = l.lastCheckedAt ? `last checked ${l.lastCheckedAt.toLocaleDateString()}` : "never checked";
    return `• **${l.name}** [id: \`${l.id}\`]\n  Domain: ${l.domain} | ${l.keywords.length} keywords | ${l.location} | ${checked}`;
  });

  return text(`Your keyword lists:\n\n${lines.join("\n\n")}`);
}

export async function executeKeywordRanks(listId: string, userId: string, text: TextFn) {
  const list = await prisma.keywordList.findFirst({ where: { id: listId, userId } });
  if (!list) return text("List not found. Call keyword_lists to see your lists.");

  const snapshots = await prisma.keywordSnapshot.findMany({
    where: { keywordListId: listId, userId },
    orderBy: { checkedAt: "desc" },
  });

  // Keep only most recent snapshot per keyword
  const seen = new Set<string>();
  const latest = snapshots.filter((s) => {
    if (seen.has(s.keyword)) return false;
    seen.add(s.keyword);
    return true;
  });

  if (latest.length === 0) {
    return text(`No rank data yet for "${list.name}". Use check_keyword_ranks to run a fresh check, or click Check Now in the dashboard.`);
  }

  const checkedAt = latest[0].checkedAt.toLocaleDateString();
  const ranked = latest.filter((s) => s.rank !== null).sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  const notRanked = latest.filter((s) => s.rank === null);

  let out = `**Keyword rankings for "${list.name}"** (${list.domain}) — as of ${checkedAt}\n\n`;

  if (ranked.length > 0) {
    out += `**Ranked (top 50):**\n`;
    out += ranked.map((s) => `  #${s.rank} — "${s.keyword}"\n       ${s.rankUrl ?? ""}`).join("\n") + "\n\n";
  }
  if (notRanked.length > 0) {
    out += `**Not ranked (beyond position 50):**\n`;
    out += notRanked.map((s) => `  • "${s.keyword}"`).join("\n");
  }

  return text(out.trim());
}

export async function executeCheckKeywordRanks(listId: string, userId: string, text: TextFn) {
  const list = await prisma.keywordList.findFirst({ where: { id: listId, userId } });
  if (!list) return text("List not found. Call keyword_lists to see your lists.");

  // Create job record
  const job = await prisma.seoJob.create({
    data: {
      userId,
      type: "KEYWORD_RANK",
      status: "RUNNING",
      domain: list.domain,
      input: { keywordListId: list.id, keywords: list.keywords, location: list.location },
    },
  });

  const estMinutes = Math.ceil(list.keywords.length * 0.75);

  // Fire async — don't await so MCP response returns immediately
  runCheckInBackground(job.id, list, userId).catch(async (err) => {
    console.error("[mcp rank-check] failed:", err);
    await prisma.seoJob.update({
      where: { id: job.id },
      data: { status: "ERROR", errorMsg: String(err), completedAt: new Date() },
    });
  });

  return text(
    `Rank check started for "${list.name}" (${list.keywords.length} keywords on ${list.domain}).\n\n` +
    `This runs live Google SERP lookups — estimated time: ~${estMinutes} minute${estMinutes !== 1 ? "s" : ""}.\n\n` +
    `Call **keyword_ranks** with list_id="${listId}" in about ${estMinutes + 1} minutes to see the results.`
  );
}

async function runCheckInBackground(
  jobId: string,
  list: { id: string; userId: string; domain: string; keywords: string[]; location: string; device: string },
  userId: string
) {
  const results = await checkKeywordRanks(list.domain, list.keywords, list.location);

  await prisma.keywordSnapshot.createMany({
    data: results.map((r) => ({
      userId,
      keywordListId: list.id,
      seoJobId: jobId,
      domain: list.domain,
      keyword: r.keyword,
      location: list.location,
      device: list.device,
      rank: r.rank,
      rankUrl: r.rankUrl,
      rankTitle: r.rankTitle,
      pagesChecked: r.pagesChecked,
    })),
  });

  const now = new Date();
  await Promise.all([
    prisma.seoJob.update({ where: { id: jobId }, data: { status: "DONE", completedAt: now, creditsUsed: list.keywords.length } }),
    prisma.keywordList.update({ where: { id: list.id }, data: { lastCheckedAt: now } }),
  ]);
}
