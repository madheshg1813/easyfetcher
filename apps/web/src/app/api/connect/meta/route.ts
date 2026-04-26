import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkConnectionAllowed } from "@/lib/plan-check";
import type { Platform, Plan } from "@easyfetcher/db";

const META_SCOPES = [
  "ads_read",
  "pages_show_list",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_manage_insights",
];

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const platform = (searchParams.get("platform") ?? "META_ADS") as Platform;
  const workspaceId = searchParams.get("workspaceId");
  const baseUrl = requestUrl.origin;

  const metaPlatforms: Platform[] = ["META_ADS", "INSTAGRAM"];
  if (!metaPlatforms.includes(platform)) {
    return NextResponse.json({ error: "Invalid platform for Meta OAuth" }, { status: 400 });
  }

  let dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? `${userId}@unknown.local`;
    const name = [clerkUser?.firstName, clerkUser?.lastName].filter((s): s is string => Boolean(s)).join(" ") || null;
    dbUser = await prisma.user.create({ data: { clerkId: userId, email, name } });
  }

  let resolvedWorkspaceId = workspaceId;
  if (!resolvedWorkspaceId) {
    const ws =
      (await prisma.workspace.findFirst({ where: { userId: dbUser.id, isDefault: true } })) ??
      (await prisma.workspace.findFirst({ where: { userId: dbUser.id } }));
    resolvedWorkspaceId = ws?.id ?? null;
  }

  if (resolvedWorkspaceId) {
    const workspace = await prisma.workspace.findFirst({
      where: { id: resolvedWorkspaceId, userId: dbUser.id },
      include: { _count: { select: { connections: { where: { status: "CONNECTED" } } } } },
    });

    if (!workspace) return NextResponse.redirect(`${baseUrl}/dashboard/sources`);

    const check = checkConnectionAllowed(dbUser.plan as Plan, platform, workspace._count.connections);
    if (!check.allowed) {
      const url = new URL(`${baseUrl}/dashboard/sources`);
      url.searchParams.set("error", "plan_limit");
      url.searchParams.set("requiredPlan", check.requiredPlan);
      return NextResponse.redirect(url.toString());
    }
  }

  const appId = process.env.META_APP_ID;
  if (!appId) return NextResponse.json({ error: "Meta OAuth not configured" }, { status: 500 });

  const redirectUri = `${baseUrl}/api/callback/meta`;
  const state = Buffer.from(JSON.stringify({ userId, platform, workspaceId: resolvedWorkspaceId })).toString("base64url");

  const authUrl =
    `https://www.facebook.com/v19.0/dialog/oauth` +
    `?client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(META_SCOPES.join(","))}` +
    `&response_type=code` +
    `&state=${state}`;

  return NextResponse.redirect(authUrl);
}
