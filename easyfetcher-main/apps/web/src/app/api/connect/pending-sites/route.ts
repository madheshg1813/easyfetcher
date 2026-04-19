import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pendingId = new URL(request.url).searchParams.get("pendingId");
  if (!pendingId) return NextResponse.json({ error: "Missing pendingId" }, { status: 400 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const pending = await prisma.pendingConnection.findFirst({
    where: { id: pendingId, userId: dbUser.id },
  });

  if (!pending) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (pending.expiresAt < new Date()) return NextResponse.json({ error: "Session expired. Please reconnect." }, { status: 410 });

  return NextResponse.json({ sites: pending.sites, platform: pending.platform });
}
