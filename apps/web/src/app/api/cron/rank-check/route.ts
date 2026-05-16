import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkKeywordRanks } from "@/lib/apify";

// Vercel Cron calls this daily — protected by CRON_SECRET
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find all lists whose nextCheckAt is due
  const dueLists = await prisma.keywordList.findMany({
    where: {
      schedule: { not: "MANUAL" },
      nextCheckAt: { lte: now },
    },
  });

  const results = await Promise.allSettled(
    dueLists.map(async (list) => {
      const job = await prisma.seoJob.create({
        data: {
          userId: list.userId,
          type: "KEYWORD_RANK",
          status: "RUNNING",
          domain: list.domain,
          input: { keywordListId: list.id, keywords: list.keywords, location: list.location },
        },
      });

      const ranks = await checkKeywordRanks(list.domain, list.keywords, list.location);

      await prisma.keywordSnapshot.createMany({
        data: ranks.map((r) => ({
          userId: list.userId,
          keywordListId: list.id,
          seoJobId: job.id,
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

      const days = list.schedule === "WEEKLY" ? 7 : list.schedule === "BIWEEKLY" ? 14 : 30;
      const nextCheckAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      await Promise.all([
        prisma.seoJob.update({ where: { id: job.id }, data: { status: "DONE", completedAt: now, creditsUsed: list.keywords.length } }),
        prisma.keywordList.update({ where: { id: list.id }, data: { lastCheckedAt: now, nextCheckAt } }),
      ]);
    })
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ processed: dueLists.length, succeeded, failed });
}
