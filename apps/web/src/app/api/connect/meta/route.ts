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

  const { searchParams } = new URL(request.url);
  const platform = (searchParams.get("platform") ?? "META_ADS") as Platform;
  const workspaceId = searchParams.get("workspaceId");

  // Validate platform is Meta
  const metaPlatforms: Platform[] = ["META_ADS", "INSTAGRAM"];
  if (!metaPlatforms.includes(platform)) {
    return NextResponse.json({ error: "Invalid platform for Meta OAuth" }, { status: 400 });
  }

  // Auto-create user if webhook hasn't fired yet (local dev)
  let dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? `${userId}@unknown.local`;
    const name = [clerkUser?.firstName, clerkUser?.lastName].filter((s): s is string => Boolean(s)).join(" ") || null;
    dbUser = await prisma.user.create({ data: { clerkId: userId, email, name } });
  }

  // Resolve active workspace
  let resolvedWorkspaceId = workspaceId;
  if (!resolvedWorkspaceId) {
    const ws = await prisma.workspace.findFirst({
      where: { userId: dbUser.id, isDefault: true },
    }) ?? await prisma.workspace.findFirst({ where: { userId: dbUser.id } });
    resolvedWorkspaceId = ws?.id ?? null;
  }

  // Verify workspace belongs to this user
  if (resolvedWorkspaceId) {
    const workspace = await prisma.workspace.findFirst({
      where: { id: resolvedWorkspaceId, userId: dbUser.id },
      include: { _count: { select: { connections: { where: { status: "CONNECTED" } } } } },
    });

    if (!workspace) {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? `${new URL(request.url).protocol}//${new URL(request.url).host}`;
      return NextResponse.redirect(new URL("/dashboard/sources", base));
    }

    const check = checkConnectionAllowed(dbUser.plan as Plan, platform, workspace._count.connections as number);
    if (!check.allowed) {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? `${new URL(request.url).protocol}//${new URL(request.url).host}`;
      const url = new URL("/dashboard/sources", base);
      url.searchParams.set("error", "plan_limit");
      url.searchParams.set("requiredPlan", check.requiredPlan);
      return NextResponse.redirect(url);
    }
  }

  const appId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return NextResponse.json({ error: "Meta OAuth not configured" }, { status: 500 });
  }

  // Encode userId + platform + workspaceId in state
  const state = Buffer.from(JSON.stringify({ userId, platform, workspaceId: resolvedWorkspaceId })).toString("base64url");

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(META_SCOPES.join(","))}&response_type=code&state=${state}`;

  return NextResponse.redirect(authUrl);
}