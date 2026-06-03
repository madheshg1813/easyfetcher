import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Platform } from "@easyfetcher/db";

// No-auth platforms that connect instantly with no OAuth
const FREE_PLATFORMS: Platform[] = ["GOOGLE_TRENDS"];

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL("/login", request.url));

  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") as Platform;
  const workspaceId = searchParams.get("workspaceId");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!platform || !FREE_PLATFORMS.includes(platform)) {
    return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=invalid_platform`);
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=user_not_found`);

  let resolvedWorkspaceId = workspaceId;
  if (!resolvedWorkspaceId) {
    const ws = await prisma.workspace.findFirst({ where: { userId: dbUser.id, isDefault: true } })
      ?? await prisma.workspace.findFirst({ where: { userId: dbUser.id } });
    resolvedWorkspaceId = ws?.id ?? null;
  }

  if (!resolvedWorkspaceId) {
    return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=no_workspace`);
  }

  const label = platform === "GOOGLE_TRENDS" ? "Google Trends" : platform;

  await prisma.connection.upsert({
    where: {
      workspaceId_platform_siteUrl: {
        workspaceId: resolvedWorkspaceId,
        platform,
        siteUrl: platform.toLowerCase(),
      },
    },
    create: {
      userId: dbUser.id,
      workspaceId: resolvedWorkspaceId,
      platform,
      accessToken: "none",
      status: "CONNECTED",
      siteUrl: platform.toLowerCase(),
      label,
    },
    update: {
      status: "CONNECTED",
      label,
    },
  });

  return NextResponse.redirect(`${baseUrl}/dashboard/sources?connected=${platform}`);
}
