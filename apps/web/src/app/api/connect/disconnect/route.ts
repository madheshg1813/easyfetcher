import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { invalidateUserCache } from "@/lib/mcp-cache";
import type { Platform } from "@easyfetcher/db";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { platform, connectionId } = await request.json() as { platform: Platform; connectionId?: string };
  if (!platform) return NextResponse.json({ error: "platform is required" }, { status: 400 });

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // If a specific connectionId is given, delete just that one connection (one site)
  // Otherwise delete all connections for this platform
  if (connectionId) {
    const connection = await prisma.connection.findFirst({
      where: { id: connectionId, userId: dbUser.id, platform },
    });
    if (!connection) return NextResponse.json({ error: "Connection not found" }, { status: 404 });

    await prisma.connection.delete({ where: { id: connectionId } });
    await prisma.activityLog.create({
      data: {
        userId: dbUser.id,
        type: "DISCONNECTED",
        message: `Disconnected ${platform}${connection.siteUrl ? ` (${connection.siteUrl})` : ""}`,
        metadata: { platform, siteUrl: connection.siteUrl },
      },
    });
  } else {
    // Disconnect all connections for this platform
    const connections = await prisma.connection.findMany({
      where: { userId: dbUser.id, platform },
    });
    if (connections.length === 0) return NextResponse.json({ error: "Connection not found" }, { status: 404 });

    await prisma.connection.deleteMany({ where: { userId: dbUser.id, platform } });
    await prisma.activityLog.create({
      data: {
        userId: dbUser.id,
        type: "DISCONNECTED",
        message: `Disconnected ${platform}`,
        metadata: { platform },
      },
    });
  }

  // Invalidate cached MCP responses so next tool call gets fresh data
  invalidateUserCache(dbUser.id).catch(() => {/* ignore — cache expires via TTL anyway */});

  return NextResponse.json({ success: true });
}
