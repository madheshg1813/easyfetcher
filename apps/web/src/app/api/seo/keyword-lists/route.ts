import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  domain: z.string().min(1),
  keywords: z.array(z.string().min(1)).min(1).max(500),
  location: z.string().default("United States"),
  device: z.enum(["desktop", "mobile"]).default("desktop"),
  schedule: z.enum(["MANUAL", "WEEKLY", "BIWEEKLY", "MONTHLY"]).default("MANUAL"),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const lists = await prisma.keywordList.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      snapshots: {
        orderBy: { checkedAt: "desc" },
        // Latest snapshot per keyword — we group in JS below
      },
    },
  });

  // For each list, build latest rank per keyword
  const listsWithRanks = lists.map((list) => {
    const latestByKeyword = new Map<string, typeof list.snapshots[0]>();
    for (const snap of list.snapshots) {
      if (!latestByKeyword.has(snap.keyword)) {
        latestByKeyword.set(snap.keyword, snap);
      }
    }

    const keywordRanks = list.keywords.map((kw) => {
      const snap = latestByKeyword.get(kw);
      return {
        keyword: kw,
        rank: snap?.rank ?? null,
        rankUrl: snap?.rankUrl ?? null,
        rankTitle: snap?.rankTitle ?? null,
        checkedAt: snap?.checkedAt ?? null,
      };
    });

    return {
      id: list.id,
      name: list.name,
      domain: list.domain,
      location: list.location,
      device: list.device,
      schedule: list.schedule,
      lastCheckedAt: list.lastCheckedAt,
      nextCheckAt: list.nextCheckAt,
      createdAt: list.createdAt,
      keywordRanks,
    };
  });

  return NextResponse.json(listsWithRanks);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, domain, keywords, location, device, schedule } = parsed.data;

  // Compute nextCheckAt for scheduled lists
  let nextCheckAt: Date | null = null;
  if (schedule !== "MANUAL") {
    const days = schedule === "WEEKLY" ? 7 : schedule === "BIWEEKLY" ? 14 : 30;
    nextCheckAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  const list = await prisma.keywordList.create({
    data: { userId: user.id, name, domain, keywords, location, device, schedule, nextCheckAt },
  });

  return NextResponse.json(list, { status: 201 });
}
