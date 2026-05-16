import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkKeywordRanks } from "@/lib/apify";
import { z } from "zod";

const schema = z.object({ keywordListId: z.string() });

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Missing keywordListId" }, { status: 400 });

  const list = await prisma.keywordList.findFirst({
    where: { id: parsed.data.keywordListId, userId: user.id },
  });
  if (!list) return NextResponse.json({ error: "List not found" }, { status: 404 });

  // Create a SeoJob record
  const job = await prisma.seoJob.create({
    data: {
      userId: user.id,
      type: "KEYWORD_RANK",
      status: "RUNNING",
      domain: list.domain,
      input: { keywordListId: list.id, keywords: list.keywords, location: list.location, device: list.device },
    },
  });

  // Run async — don't await, respond immediately with job id
  runRankCheck(job.id, list).catch(async (err) => {
    await prisma.seoJob.update({
      where: { id: job.id },
      data: { status: "ERROR", errorMsg: String(err), completedAt: new Date() },
    });
  });

  return NextResponse.json({ jobId: job.id, status: "RUNNING" });
}

async function runRankCheck(
  jobId: string,
  list: { id: string; userId: string; domain: string; keywords: string[]; location: string; device: string }
) {
  const results = await checkKeywordRanks(list.domain, list.keywords, list.location);

  // Store snapshots
  await prisma.keywordSnapshot.createMany({
    data: results.map((r) => ({
      userId: list.userId,
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
    prisma.seoJob.update({
      where: { id: jobId },
      data: { status: "DONE", completedAt: now, creditsUsed: list.keywords.length },
    }),
    prisma.keywordList.update({
      where: { id: list.id },
      data: { lastCheckedAt: now },
    }),
  ]);
}
