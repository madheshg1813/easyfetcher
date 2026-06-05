import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { saveConnection } from "@/lib/save-connection";

// Called from the pick-site page when user selects which site(s) to connect.
// Security: pendingId is a random cuid with 15-min expiry — no Clerk auth() needed.
// The pendingConnection record already contains the verified userId from the OAuth callback.
export async function GET(request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? `${new URL(request.url).protocol}//${new URL(request.url).host}`;

  try {
    const { searchParams } = new URL(request.url);
    const pendingId = searchParams.get("pendingId");
    const siteUrlsParam = searchParams.get("siteUrl") ?? "";
    const selectedSites = siteUrlsParam.split(",").map((s) => decodeURIComponent(s.trim())).filter(Boolean);

    if (!pendingId || selectedSites.length === 0) {
      return NextResponse.redirect(new URL("/dashboard/sources?error=invalid_confirm", base));
    }

    // Look up pending connection — it contains the userId from the OAuth callback
    const pending = await prisma.pendingConnection.findUnique({ where: { id: pendingId } });

    if (!pending) {
      return NextResponse.redirect(new URL("/dashboard/sources?error=session_not_found", base));
    }

    if (pending.expiresAt < new Date()) {
      await prisma.pendingConnection.delete({ where: { id: pendingId } }).catch(() => {});
      return NextResponse.redirect(new URL("/dashboard/sources?error=session_expired", base));
    }

    // Resolve workspace
    let workspaceId = pending.workspaceId;
    if (!workspaceId) {
      const ws =
        (await prisma.workspace.findFirst({ where: { userId: pending.userId, isDefault: true } })) ??
        (await prisma.workspace.findFirst({ where: { userId: pending.userId } }));
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
        pending.userId,
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
    return NextResponse.redirect(new URL(`/dashboard/sources?connected=${pending.platform}`, base));
  } catch (err: unknown) {
    console.error("[confirm] error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    const detail = encodeURIComponent(msg.slice(0, 200));
    return NextResponse.redirect(new URL(`/dashboard/sources?error=confirm_failed&detail=${detail}`, base));
  }
}
