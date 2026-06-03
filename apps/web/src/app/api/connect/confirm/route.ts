import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { saveConnection } from "@/lib/save-connection";

// Called from the site-picker page when a user has multiple GSC sites or GA4 properties.
// For single-site OAuth flows, the connection is now written directly in /api/callback/google.
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.redirect(new URL("/login", request.url));

    const { searchParams } = new URL(request.url);
    const pendingId = searchParams.get("pendingId");
    const siteUrlsParam = searchParams.get("siteUrl") ?? "";
    const selectedSites = siteUrlsParam.split(",").map((s) => s.trim()).filter(Boolean);

    if (!pendingId || selectedSites.length === 0) {
      return NextResponse.redirect(new URL("/dashboard/sources?error=invalid_confirm", request.url));
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return NextResponse.redirect(new URL("/dashboard/sources?error=user_not_found", request.url));

    const pending = await prisma.pendingConnection.findFirst({
      where: { id: pendingId, userId: dbUser.id },
    });

    if (!pending || pending.expiresAt < new Date()) {
      return NextResponse.redirect(new URL("/dashboard/sources?error=session_expired", request.url));
    }

    // Resolve workspace
    let workspaceId = pending.workspaceId;
    if (!workspaceId) {
      const ws =
        (await prisma.workspace.findFirst({ where: { userId: dbUser.id, isDefault: true } })) ??
        (await prisma.workspace.findFirst({ where: { userId: dbUser.id } }));
      workspaceId = ws?.id ?? null;
    }

    const sites = (pending.sites as Array<{ siteUrl: string; displayName?: string }>) || [];

    for (const siteUrl of selectedSites) {
      const site = sites.find((s) => s.siteUrl === siteUrl);
      if (!site) continue;

      const label =
        site.displayName ??
        siteUrl
          .replace("sc-domain:", "")
          .replace("https://", "")
          .replace("http://", "")
          .replace(/\/$/, "");

      await saveConnection(
        dbUser.id,
        workspaceId,
        pending.platform,
        pending.accessToken,
        pending.refreshToken,
        pending.tokenExpiry,
        pending.userEmail,
        siteUrl,
        label,
      );
    }

    await prisma.pendingConnection.delete({ where: { id: pendingId } });
    return NextResponse.redirect(new URL(`/dashboard/sources?connected=${pending.platform}`, request.url));
  } catch (err: any) {
    console.error("[confirm] error:", err);
    const detail = encodeURIComponent((err?.message ?? String(err)).slice(0, 200));
    return NextResponse.redirect(new URL(`/dashboard/sources?error=confirm_failed&detail=${detail}`, request.url));
  }
}
