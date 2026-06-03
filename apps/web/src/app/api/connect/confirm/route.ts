import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Called after the site picker — creates the actual Connection record(s)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.redirect(new URL("/login", request.url));

    const { searchParams } = new URL(request.url);
    const pendingId = searchParams.get("pendingId");
    const siteUrlsParam = searchParams.get("siteUrl") ?? "";
    const selectedSites = siteUrlsParam.split(",").map((s) => s.trim()).filter(Boolean);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    if (!pendingId || selectedSites.length === 0) {
      return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=invalid_confirm`);
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=user_not_found`);

    const pending = await prisma.pendingConnection.findFirst({
      where: { id: pendingId, userId: dbUser.id },
    });

    if (!pending || pending.expiresAt < new Date()) {
      return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=session_expired`);
    }

    // Resolve workspace — use from pending, or fall back to default
    let workspaceId = pending.workspaceId;
    if (!workspaceId) {
      const ws = await prisma.workspace.findFirst({
        where: { userId: dbUser.id, isDefault: true },
      }) ?? await prisma.workspace.findFirst({ where: { userId: dbUser.id } });
      workspaceId = ws?.id ?? null;
    }

    const sites = pending.sites as Array<{ siteUrl: string; permissionLevel?: string; displayName?: string }>;

    for (const siteUrl of selectedSites) {
      const site = sites.find((s) => s.siteUrl === siteUrl);
      if (!site) continue;

      const label = site.displayName ?? siteUrl
        .replace("sc-domain:", "")
        .replace("https://", "")
        .replace("http://", "")
        .replace(/\/$/, "");

      await prisma.connection.upsert({
        where: {
          workspaceId_platform_siteUrl: {
            workspaceId: workspaceId!,
            platform: pending.platform,
            siteUrl,
          },
        },
        create: {
          userId: dbUser.id,
          workspaceId,
          platform: pending.platform,
          accessToken: pending.accessToken,
          refreshToken: pending.refreshToken,
          expiresAt: pending.tokenExpiry,
          status: "CONNECTED",
          siteUrl,
          label,
          metadata: { email: pending.userEmail },
        },
        update: {
          accessToken: pending.accessToken,
          refreshToken: pending.refreshToken ?? undefined,
          expiresAt: pending.tokenExpiry,
          status: "CONNECTED",
          label,
          metadata: { email: pending.userEmail },
        },
      });

      await prisma.activityLog.create({
        data: {
          userId: dbUser.id,
          type: "CONNECTED",
          message: `Connected ${pending.platform} (${label})`,
          metadata: { platform: pending.platform, siteUrl, workspaceId },
        },
      });
    }

    await prisma.pendingConnection.delete({ where: { id: pendingId } });

    return NextResponse.redirect(`${baseUrl}/dashboard/sources?connected=${pending.platform}`);
  } catch (err: any) {
    console.error("Confirm connection error:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: err.message || String(err),
        stack: err.stack,
      },
      { status: 500 }
    );
  }
}
